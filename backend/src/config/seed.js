require('dotenv').config();
const { getClient, pool } = require('./db');
const authService = require('../services/authService');
const logger = require('../utils/logger');

const seedUsers = async () => {
  try {
    const client = await getClient();
    
    // Fetch Role IDs
    const rolesRes = await client.query('SELECT id, role_name FROM roles');
    const roleMap = {};
    rolesRes.rows.forEach(r => { roleMap[r.role_name] = r.id; });
    
    // Check if users already exist
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count) > 0) {
      logger.info('Database already seeded with users.');
      return;
    }

    // Insert an Institution for association
    const instRes = await client.query(`
      INSERT INTO institutions (name, email, phone, address, account_status, institution_type, created_at, updated_at) 
      VALUES ('LearnBeyond Academy', 'admin@learnbeyond.edu', '555-0100', '123 Education Lane', 'Active', 'School', NOW(), NOW())
      RETURNING id
    `);
    const instId = instRes.rows[0].id;

    const mockUsers = [
      {
        email: 'admin@learnbeyond.edu',
        password: 'Password123',
        role_id: roleMap['Platform Admin'],
        first_name: 'Platform',
        last_name: 'Admin'
      },
      {
        email: 'school@learnbeyond.edu',
        password: 'Password123',
        role_id: roleMap['Institution Admin'],
        first_name: 'Institution',
        last_name: 'Admin',
        institution_id: instId
      },
      {
        email: 'teacher@learnbeyond.edu',
        password: 'Password123',
        role_id: roleMap['Teacher'],
        first_name: 'Jane',
        last_name: 'Smith',
        institution_id: instId,
        phone: '555-0101'
      },
      {
        email: 'student@learnbeyond.edu',
        password: 'Password123',
        role_id: roleMap['Student'],
        first_name: 'Johnny',
        last_name: 'Appleseed',
        institution_id: instId
      },
      {
        email: 'parent@learnbeyond.edu',
        password: 'Password123',
        role_id: roleMap['Parent'],
        first_name: 'Martha',
        last_name: 'Appleseed',
        institution_id: instId,
        phone: '555-0102'
      },
      {
        email: 'therapist@learnbeyond.edu',
        password: 'Password123',
        role_id: roleMap['Therapist'],
        first_name: 'Dr. John',
        last_name: 'Watson',
        institution_id: instId,
        phone: '555-0103'
      }
    ];

    for (const user of mockUsers) {
      await authService.registerUser(user);
      logger.info(`Seeded user: ${user.email} (${Object.keys(roleMap).find(key => roleMap[key] === user.role_id)})`);
    }

    logger.info('Database seeding completed successfully.');
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
  } finally {
    process.exit(0);
  }
};

seedUsers();
