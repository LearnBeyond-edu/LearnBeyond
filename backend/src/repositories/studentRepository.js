const BaseRepository = require('./baseRepository');

class StudentRepository extends BaseRepository {
  constructor() {
    super('student_profiles', false);
  }

  async findAll(limit = 10, cursor = null, additionalWhere = '', params = []) {
    const { query } = require('../config/db');
    let queryStr = `
      SELECT sp.*, u.first_name, u.last_name, u.email, i.name as institution_name 
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN institutions i ON u.institution_id = i.id
    `;
    const whereConditions = [];

    let paramIndex = params.length + 1;
    let queryParams = [...params];

    if (cursor) {
      whereConditions.push(`sp.id < $${paramIndex}`);
      queryParams.push(cursor);
      paramIndex++;
    }

    const allWhere = [...whereConditions];
    if (additionalWhere) {
      const modWhere = additionalWhere
        .replace(/(?<![\w\.])institution_id\b/g, 'sp.institution_id')
        .replace(/(?<![\w\.])user_id\b/g, 'sp.user_id')
        .replace(/(?<![\w\.])id\b(?!\s*<)/g, 'sp.id');
      const cleanModWhere = modWhere.trim().replace(/^AND\s+/i, '');
      if (cleanModWhere) {
        allWhere.push(cleanModWhere);
      }
    }

    if (allWhere.length > 0) {
      queryStr += ` WHERE ${allWhere.join(' AND ')}`;
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
      SELECT sp.*, u.first_name, u.last_name, u.email, i.name as institution_name
      FROM student_profiles sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN institutions i ON u.institution_id = i.id
      WHERE sp.id = $1 OR sp.user_id = $1
      LIMIT 1
    `;
    const result = await query(queryStr, [id]);
    return result.rows[0];
  }

  async delete(id) {
    const { query } = require('../config/db');
    const profile = await this.findById(id);
    if (profile) {
      const studentId = profile.id;
      const userId = profile.user_id;

      // Clean up all related child records first to prevent FK constraint failures
      await query(`DELETE FROM attendance WHERE student_id = $1 OR student_id = $2`, [studentId, userId]).catch(() => {});
      await query(`DELETE FROM progress WHERE student_id = $1 OR student_id = $2`, [studentId, userId]).catch(() => {});
      await query(`DELETE FROM submissions WHERE student_id = $1 OR student_id = $2`, [studentId, userId]).catch(() => {});
      await query(`DELETE FROM quiz_attempts WHERE student_id = $1 OR student_id = $2`, [studentId, userId]).catch(() => {});
      await query(`DELETE FROM enrollments WHERE student_id = $1 OR student_id = $2`, [studentId, userId]).catch(() => {});
      await query(`DELETE FROM direct_messages WHERE sender_id = $1 OR recipient_id = $1`, [userId]).catch(() => {});
      await query(`DELETE FROM notifications WHERE user_id = $1`, [userId]).catch(() => {});
      await query(`DELETE FROM parent_profiles WHERE student_id = $1 OR student_id = $2`, [studentId, userId]).catch(() => {});
      await query(`DELETE FROM student_profiles WHERE id = $1`, [studentId]);
      await query(`DELETE FROM users WHERE id = $1`, [userId]);
    }
  }
}

module.exports = new StudentRepository();
