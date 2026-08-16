const BaseRepository = require('./baseRepository');
const { query } = require('../config/db');

class ClassRepository extends BaseRepository {
  constructor() {
    super('classes');
  }

  async findAll(limit = 10, cursor = null, additionalWhere = '', params = []) {
    let queryStr = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM student_profiles s WHERE s.class_id = c.id) as student_count 
      FROM ${this.tableName} c
    `;
    const whereConditions = [];

    if (this.hasSoftDelete) {
      whereConditions.push('c.deleted_at IS NULL');
    }

    let paramIndex = params.length + 1;
    let queryParams = [...params];

    if (cursor) {
      whereConditions.push(`c.id < $${paramIndex}`);
      queryParams.push(cursor);
      paramIndex++;
    }

    if (whereConditions.length > 0) {
      queryStr += ` WHERE ${whereConditions.join(' AND ')}`;
      if (additionalWhere) {
        const modWhere = additionalWhere.replace(/institution_id/g, 'c.institution_id');
        queryStr += modWhere.trim().toUpperCase().startsWith('AND') 
          ? ` ${modWhere}` 
          : ` AND ${modWhere}`;
      }
    } else {
      if (additionalWhere) {
        const modWhere = additionalWhere.replace(/institution_id/g, 'c.institution_id');
        queryStr += modWhere.trim().toUpperCase().startsWith('AND')
          ? ` WHERE ${modWhere.replace(/^AND\s+/i, '')}`
          : ` WHERE ${modWhere}`;
      }
    }

    queryStr += ` ORDER BY c.id DESC LIMIT $${paramIndex}`;
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
      meta: { hasNextPage, nextCursor }
    };
  }

  async create(data) {
    const { institution_id, name, description, teacher_id } = data;
    const result = await query(
      `INSERT INTO classes (institution_id, name, description, teacher_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [institution_id, name, description, teacher_id]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { name, description, teacher_id } = data;
    const result = await query(
      `UPDATE classes SET 
        name = COALESCE($1, name), 
        description = COALESCE($2, description), 
        teacher_id = COALESCE($3, teacher_id), 
        updated_at = NOW() 
       WHERE id = $4 AND deleted_at IS NULL RETURNING *`,
      [name, description, teacher_id, id]
    );
    return result.rows[0];
  }
}

module.exports = new ClassRepository();
