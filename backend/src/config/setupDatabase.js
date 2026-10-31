const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL || "postgresql://learnbeyondbd_owner:npg_B2eRsC1kXvdQ@ep-square-mud-b30j9mjj-pooler.c-4.ap-southeast-1.aws.neon.tech/learnbeyondbd?sslmode=require";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function setup(existingClient = null) {
  let client = existingClient;
  let shouldRelease = false;
  let tempPool = null;

  if (!client) {
    tempPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
    console.log('Connecting to Neon database...');
    client = await tempPool.connect();
    shouldRelease = true;
  }
  
  try {
    const candidatePaths = [
      path.resolve(__dirname, '../../../database_schema.sql'),
      path.resolve(__dirname, '../../database_schema.sql'),
      path.resolve(__dirname, '../database_schema.sql'),
      path.resolve(process.cwd(), 'database_schema.sql'),
      path.resolve(process.cwd(), 'backend/database_schema.sql'),
    ];
    const sqlPath = candidatePaths.find(p => fs.existsSync(p));
    if (!sqlPath) {
      console.warn('⚠️ database_schema.sql not found in candidate paths. Skipping auto-DDL execution.');
      return;
    }
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove any psql-specific metacommands (lines starting with \)
    sql = sql.replace(/^\\.*$/gm, '');
    sql = sql.replace(/SET\s+transaction_timeout.*?;/gi, '');
    sql = sql.replace(/ALTER\s+TABLE\s+.*?OWNER\s+TO\s+.*?;/gi, '');
    sql = sql.replace(/ALTER\s+SEQUENCE\s+.*?OWNER\s+TO\s+.*?;/gi, '');
    sql = sql.replace(/ALTER\s+DEFAULT\s+PRIVILEGES.*?;/gi, '');

    console.log('Executing database schema creation...');
    try {
      await client.query(sql);
    } catch (schemaErr) {
      console.log('Schema note:', schemaErr.message);
    }
    await client.query('SET search_path TO public;');
    console.log('✅ Tables ready!');

    // Now seed default roles and users
    console.log('Seeding initial roles, institutions, classes, and users...');

    // 1. Ensure Roles
    const roles = ['Platform Admin', 'Institution Admin', 'Teacher', 'Student', 'Parent', 'Therapist'];
    for (const r of roles) {
      const existing = await client.query('SELECT id FROM roles WHERE role_name = $1', [r]);
      if (existing.rows.length === 0) {
        await client.query('INSERT INTO roles (role_name) VALUES ($1)', [r]);
      }
    }
    const rolesRes = await client.query('SELECT id, role_name FROM roles');
    const roleMap = {};
    rolesRes.rows.forEach(r => { roleMap[r.role_name] = r.id; });

    // 2. Ensure Institution
    const instId = '8dffb045-b42c-484d-aa27-b13a93f9790b';
    const existingInst = await client.query('SELECT id FROM institutions WHERE id = $1', [instId]);
    if (existingInst.rows.length === 0) {
      await client.query(`
        INSERT INTO institutions (id, name, email, phone, address, account_status, institution_type, created_at, updated_at)
        VALUES ($1, 'LearnBeyond Academy', 'admin@learnbeyond.edu', '555-0100', '123 Education Lane', 'Active', 'School', NOW(), NOW())
      `, [instId]);
    }

    // 3. Ensure Default Class
    const classId = '8dffb045-b42c-484d-aa27-b13a93f9790c';
    const existingClass = await client.query('SELECT id FROM classes WHERE id = $1', [classId]);
    if (existingClass.rows.length === 0) {
      await client.query(`
        INSERT INTO classes (id, institution_id, grade, section, academic_year, room_number, created_at, updated_at)
        VALUES ($1, $2, 4, 'A', '2026-2027', 'Room 101', NOW(), NOW())
      `, [classId, instId]);
    }

    // 4. Ensure Users
    const passwordHash = await bcrypt.hash('Password123', 10);
    const mockUsers = [
      { email: 'admin@learnbeyond.edu', role: 'Platform Admin', first_name: 'Platform', last_name: 'Admin', inst: null },
      { email: 'school@learnbeyond.edu', role: 'Institution Admin', first_name: 'Institution', last_name: 'Admin', inst: instId },
      { email: 'teacher@learnbeyond.edu', role: 'Teacher', first_name: 'Jane', last_name: 'Smith', inst: instId, phone: '555-0101' },
      { email: 'staff1@gmail.com', role: 'Teacher', first_name: 'Jane', last_name: 'Smith', inst: instId, phone: '555-0101' },
      { email: 'student@learnbeyond.edu', role: 'Student', first_name: 'Johnny', last_name: 'Appleseed', inst: instId },
      { email: 'parent@learnbeyond.edu', role: 'Parent', first_name: 'Martha', last_name: 'Appleseed', inst: instId, phone: '555-0102' },
      { email: 'therapist@learnbeyond.edu', role: 'Therapist', first_name: 'Dr. John', last_name: 'Watson', inst: instId, phone: '555-0103' }
    ];

    for (const u of mockUsers) {
      let userId;
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
      if (existingUser.rows.length === 0) {
        const userRes = await client.query(`
          INSERT INTO users (email, username, password_hash, role_id, is_active, first_name, last_name, institution_id, created_at, updated_at)
          VALUES ($1, $2, $3, $4, true, $5, $6, $7, NOW(), NOW())
          RETURNING id;
        `, [u.email, u.email.split('@')[0], passwordHash, roleMap[u.role], u.first_name, u.last_name, u.inst]);
        userId = userRes.rows[0]?.id;
      } else {
        userId = existingUser.rows[0].id;
        await client.query(`
          UPDATE users SET password_hash = $1, first_name = $2, last_name = $3 WHERE id = $4
        `, [passwordHash, u.first_name, u.last_name, userId]);
      }
      
      if (userId) {
        if (u.role === 'Student') {
          const existingProfile = await client.query('SELECT user_id FROM student_profiles WHERE user_id = $1', [userId]);
          if (existingProfile.rows.length === 0) {
            await client.query(`
              INSERT INTO student_profiles (user_id, institution_id, class_id, admission_number, roll_number, created_at, updated_at)
              VALUES ($1, $2, $3, 'ADM-1001', '1', NOW(), NOW())
            `, [userId, instId, classId]);
          }
        } else if (u.role === 'Teacher') {
          const existingProfile = await client.query('SELECT user_id FROM staff_profiles WHERE user_id = $1', [userId]);
          if (existingProfile.rows.length === 0) {
            await client.query(`
              INSERT INTO staff_profiles (user_id, institution_id, employee_id, designation, qualification, experience, created_at, updated_at)
              VALUES ($1, $2, $3, 'Senior Teacher', 'M.Ed', 5, NOW(), NOW())
            `, [userId, instId, 'EMP-' + Math.floor(1000 + Math.random() * 9000)]);
          }
        }
      }
    }

    console.log('✅ ALL tables, classes, roles, and demo users have been successfully seeded into Neon DB!');
  } catch (err) {
    console.error('❌ Database setup error:', err);
  } finally {
    if (shouldRelease && client) {
      client.release();
    }
    if (tempPool) {
      await tempPool.end();
    }
  }
}

module.exports = { setup };

if (require.main === module) {
  setup().catch(console.error);
}
