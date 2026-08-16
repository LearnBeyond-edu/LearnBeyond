const { query, getClient } = require('../config/db');

class InstitutionRepository {
  async findAll(limit = 10, offset = 0) {
    const result = await query(
      `SELECT * FROM institutions WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await query(`SELECT COUNT(*) FROM institutions WHERE deleted_at IS NULL`);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  async findAllWithHistory(limit = 10, offset = 0) {
    const result = await query(
      `SELECT * FROM institutions ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const countResult = await query(`SELECT COUNT(*) FROM institutions`);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  async findById(id) {
    const result = await query(
      `SELECT * FROM institutions WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0];
  }

  async create(data) {
    const { name, address, contact_email, contact_phone, subscription_plan, subscription_status } = data;
    const result = await query(
      `INSERT INTO institutions (name, address, email, phone, institution_type, subscription_plan, subscription_status, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, 'School', $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [name, address, contact_email, contact_phone, subscription_plan || 'Starter', subscription_status || 'active']
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { name, address, contact_email, contact_phone, subscription_plan, subscription_status } = data;
    const result = await query(
      `UPDATE institutions 
       SET name = COALESCE($1, name), 
           address = COALESCE($2, address), 
           email = COALESCE($3, email), 
           phone = COALESCE($4, phone), 
           subscription_plan = COALESCE($5, subscription_plan),
           subscription_status = COALESCE($6, subscription_status),
           updated_at = NOW()
       WHERE id = $7 AND deleted_at IS NULL
       RETURNING *`,
      [name, address, contact_email, contact_phone, subscription_plan, subscription_status, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      // Nullify references in classes and lessons to avoid FK violations
      await client.query(`UPDATE classes SET class_teacher_id = NULL WHERE institution_id = $1`, [id]);
      await client.query(`UPDATE lessons SET class_id = NULL WHERE class_id IN (SELECT id FROM classes WHERE institution_id = $1)`, [id]);
      
      // Delete progress, submissions, attendance
      await client.query(`DELETE FROM progress WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id IN (SELECT id FROM users WHERE institution_id = $1))`, [id]);
      await client.query(`DELETE FROM submissions WHERE student_id IN (SELECT id FROM student_profiles WHERE user_id IN (SELECT id FROM users WHERE institution_id = $1))`, [id]);
      await client.query(`DELETE FROM attendance WHERE class_id IN (SELECT id FROM classes WHERE institution_id = $1)`, [id]);
      
      // Delete assignments, quizzes, lessons
      await client.query(`DELETE FROM assignments WHERE class_id IN (SELECT id FROM classes WHERE institution_id = $1)`, [id]);
      await client.query(`DELETE FROM quizzes WHERE class_id IN (SELECT id FROM classes WHERE institution_id = $1)`, [id]);
      await client.query(`DELETE FROM lessons WHERE class_id IN (SELECT id FROM classes WHERE institution_id = $1)`, [id]);
      
      // Delete classes
      await client.query(`DELETE FROM classes WHERE institution_id = $1`, [id]);
      
      // Delete profiles
      await client.query(`DELETE FROM student_profiles WHERE user_id IN (SELECT id FROM users WHERE institution_id = $1)`, [id]);
      await client.query(`DELETE FROM staff_profiles WHERE user_id IN (SELECT id FROM users WHERE institution_id = $1)`, [id]);
      await client.query(`DELETE FROM parent_profiles WHERE user_id IN (SELECT id FROM users WHERE institution_id = $1)`, [id]);
      await client.query(`DELETE FROM therapist_profiles WHERE user_id IN (SELECT id FROM users WHERE institution_id = $1)`, [id]);
      
      // Delete users
      await client.query(`DELETE FROM users WHERE institution_id = $1`, [id]);
      
      // Delete institution
      await client.query(`DELETE FROM institutions WHERE id = $1`, [id]);
      
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new InstitutionRepository();
