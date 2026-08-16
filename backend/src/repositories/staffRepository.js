const BaseRepository = require('./baseRepository');

class StaffRepository extends BaseRepository {
  constructor() {
    super('staff_profiles', false);
  }

  async findAll(limit = 10, cursor = null, additionalWhere = '', params = []) {
    const { query } = require('../config/db');
    let queryStr = `
      SELECT sp.*, u.first_name, u.last_name, u.email 
      FROM staff_profiles sp
      JOIN users u ON sp.user_id = u.id
    `;
    const whereConditions = [];

    let paramIndex = params.length + 1;
    let queryParams = [...params];

    if (cursor) {
      whereConditions.push(`sp.id < $${paramIndex}`);
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

    queryStr += ` ORDER BY sp.id DESC LIMIT $${paramIndex}`;
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
      SELECT sp.*, u.first_name, u.last_name, u.email 
      FROM staff_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.id = $1
    `;
    const result = await query(queryStr, [id]);
    return result.rows[0];
  }

  async delete(id) {
    const { query } = require('../config/db');
    const profile = await this.findById(id);
    if (profile) {
      await query(`DELETE FROM staff_profiles WHERE id = $1`, [id]);
      await query(`DELETE FROM users WHERE id = $1`, [profile.user_id]);
    }
  }
}

module.exports = new StaffRepository();
