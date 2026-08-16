const { query, getClient } = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    const result = await query(
      `SELECT u.*, r.role_name 
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
      [email]
    );
    return result.rows[0];
  }

  async findById(id) {
    const result = await query(
      `SELECT u.id, u.email, u.password_hash, u.role_id, u.is_active, u.created_at, r.role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  }

  async createUser(userData, client = null) {
    const { email, passwordHash, role_id, first_name = 'User', last_name = '', institution_id = null } = userData;
    const dbClient = client || { query: (text, params) => query(text, params) };
    const username = email.split('@')[0];
    
    const result = await dbClient.query(
      `INSERT INTO users (email, username, password_hash, role_id, is_active, first_name, last_name, institution_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, $5, $6, $7, NOW(), NOW())
       RETURNING id, email, role_id, is_active, first_name, last_name, institution_id, created_at`,
      [email, username, passwordHash, role_id, first_name, last_name, institution_id]
    );
    
    return result.rows[0];
  }

  // Profile creation depending on role
  async createProfile(userId, profileData, roleName, client) {
    const { first_name, last_name, phone, institution_id, assigned_class, assigned_section, student_id } = profileData;
    let tableName;
    let queryText;
    let params;

    switch (roleName) {
      case 'student':
      case 'Student':
        tableName = 'student_profiles';
        queryText = `INSERT INTO student_profiles (user_id, institution_id, admission_number, created_at, updated_at) VALUES ($1, $2, 'S-' || substr(md5(random()::text), 1, 6), NOW(), NOW())`;
        params = [userId, institution_id];
        break;
      case 'parent':
      case 'Parent':
        tableName = 'parent_profiles';
        queryText = `INSERT INTO parent_profiles (user_id, institution_id, relation, student_id, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())`;
        params = [userId, institution_id, profileData.relation || 'Parent', student_id || null];
        break;
      case 'staff':
      case 'teacher':
      case 'Teacher':
        tableName = 'staff_profiles';
        queryText = `INSERT INTO staff_profiles (user_id, institution_id, employee_id, created_at, updated_at) VALUES ($1, $2, 'T-' || substr(md5(random()::text), 1, 6), NOW(), NOW())`;
        params = [userId, institution_id];
        break;
      case 'therapist':
      case 'Therapist':
        tableName = 'therapist_profiles';
        queryText = `INSERT INTO therapist_profiles (user_id, institution_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`;
        params = [userId, institution_id];
        break;
      case 'super_admin':
      case 'admin':
      case 'Platform Admin':
      case 'institution_admin':
      case 'Institution Admin':
        return null;
      default:
        throw new Error(`Profile creation for role ${roleName} is not supported yet.`);
    }

    if (queryText) {
      await client.query(queryText, params);
      
      if ((roleName === 'Teacher' || roleName === 'staff' || roleName === 'teacher') && assigned_class && assigned_section && institution_id) {
        // Sanitize the inputs: extract numbers from "Class X" and characters from "Section Y"
        const cleanGrade = parseInt(String(assigned_class).replace(/[^0-9]/g, ''), 10);
        const cleanSection = String(assigned_section).replace('Section ', '').trim();

        if (!isNaN(cleanGrade) && cleanSection) {
          // Find if this class + section exists for the institution
          const existRes = await client.query(
            `SELECT id FROM classes WHERE institution_id = $1 AND grade = $2 AND section = $3`,
            [institution_id, cleanGrade, cleanSection]
          );
          
          if (existRes.rows.length > 0) {
            // Update the class teacher
            await client.query(
              `UPDATE classes SET class_teacher_id = $1, updated_at = NOW() WHERE id = $2`,
              [userId, existRes.rows[0].id]
            );
          } else {
            // Create the class and assign the teacher
            const currentYear = new Date().getFullYear();
            const academicYear = `${currentYear}-${currentYear + 1}`;
            await client.query(
              `INSERT INTO classes (institution_id, grade, section, class_teacher_id, academic_year, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
              [institution_id, cleanGrade, cleanSection, userId, academicYear]
            );
          }
        }
      }
    }
  }

  async getRoleNameById(roleId) {
    const result = await query('SELECT role_name FROM roles WHERE id = $1', [roleId]);
    return result.rows[0]?.role_name;
  }
}

module.exports = new UserRepository();
