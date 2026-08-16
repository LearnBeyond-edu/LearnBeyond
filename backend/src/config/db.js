const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration based on environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'learnbeyond_db',
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  logger.error(`Unexpected error on idle client: ${err.message}`);
  // Do not process.exit(-1) in enterprise, handle it gracefully
});

const connectWithRetry = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW()');
      logger.info(`PostgreSQL Connected: ${res.rows[0].now}`);
      try {
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS app_state JSONB DEFAULT '{}'::jsonb;`);
        logger.info('Ensured app_state column exists in users table.');
      } catch (colErr) {
        logger.error(`Error adding app_state column: ${colErr.message}`);
      }
      client.release();
      return;
    } catch (err) {
      logger.error(`DB Connection failed. Retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  logger.error('Failed to connect to DB after multiple retries. Exiting.');
  process.exit(1);
};

// Graceful Shutdown
const closePool = async () => {
  logger.info('Closing PostgreSQL connection pool...');
  await pool.end();
  logger.info('PostgreSQL connection pool closed.');
};

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

/**
 * Executes a parameterized query using the pool.
 * @param {string} text - The SQL query text.
 * @param {Array} params - The query parameters.
 * @returns {Promise<Object>} The query result.
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Gets a client from the pool for transactions.
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = () => {
  return pool.connect();
};

module.exports = {
  pool,
  connectDB: connectWithRetry,
  query,
  getClient
};
