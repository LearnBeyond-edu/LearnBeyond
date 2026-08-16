const BaseRepository = require('./baseRepository');

class TherapistRepository extends BaseRepository {
  constructor() {
    super('therapist_profiles', false);
  }

  async findAll(limit = 10, cursor = null, additionalWhere = '', params = []) {
    const { query } = require('../config/db');
    let queryStr = `
      SELECT tp.*, u.first_name, u.last_name, u.email 
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
    `;
    const whereConditions = [];

    let paramIndex = params.length + 1;
    let queryParams = [...params];

    if (cursor) {
      whereConditions.push(`tp.id < $${paramIndex}`);
      queryParams.push(cursor);
      paramIndex++;
    }

    if (whereConditions.length > 0) {
      queryStr += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    if (additionalWhere) {
      const modWhere = additionalWhere.replace(/institution_id/g, 'u.institution_id');
      queryStr += modWhere.trim().toUpperCase().startsWith('AND') 
        ? ` ${modWhere}` 
        : ` AND ${modWhere}`;
    }

    queryStr += ` ORDER BY tp.id DESC LIMIT $${paramIndex}`;
    queryParams.push(limit + 1);

    const result = await query(queryStr, queryParams);
    
    let hasNextPage = false;
    let nextCursor = null;

    if (result.rows.length > limit) {
      hasNextPage = true;
      result.rows.pop();
      nextCursor = result.rows[result.rows.length - 1].id;
    }

    return { 
      data: result.rows, 
      meta: {
        hasNextPage,
        nextCursor
      }
    };
  }

  async findById(id) {
    const { query } = require('../config/db');
    const queryStr = `
      SELECT tp.*, u.first_name, u.last_name, u.email 
      FROM therapist_profiles tp
      JOIN users u ON tp.user_id = u.id
      WHERE tp.id = $1
    `;
    const result = await query(queryStr, [id]);
    return result.rows[0];
  }

  async delete(id) {
    const { query } = require('../config/db');
    const profile = await this.findById(id);
    if (profile) {
      await query(`DELETE FROM therapist_profiles WHERE id = $1`, [id]);
      await query(`DELETE FROM users WHERE id = $1`, [profile.user_id]);
    }
  }
}

module.exports = new TherapistRepository();
