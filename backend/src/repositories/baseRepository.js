const { query } = require('../config/db');

class BaseRepository {
  constructor(tableName, hasSoftDelete = false, hasUpdatedAt = true, hasCreatedAt = true) {
    this.tableName = tableName;
    this.hasSoftDelete = hasSoftDelete;
    this.hasUpdatedAt = hasUpdatedAt;
    this.hasCreatedAt = hasCreatedAt;
  }

  /**
   * Enterprise-grade Cursor Pagination (Keyset pagination)
   * Prevents full table scans associated with COUNT(*) and OFFSET.
   */
  async findAll(limit = 10, cursor = null, additionalWhere = '', params = []) {
    let queryStr = `SELECT * FROM ${this.tableName}`;
    const whereConditions = [];

    if (this.hasSoftDelete) {
      whereConditions.push('deleted_at IS NULL');
    }

    // Determine the parameter index for cursor
    let paramIndex = params.length + 1;
    let queryParams = [...params];

    if (cursor) {
      whereConditions.push(`id < $${paramIndex}`);
      queryParams.push(cursor);
      paramIndex++;
    }

    if (whereConditions.length > 0) {
      queryStr += ` WHERE ${whereConditions.join(' AND ')}`;
      if (additionalWhere) {
        queryStr += additionalWhere.trim().toUpperCase().startsWith('AND') 
          ? ` ${additionalWhere}` 
          : ` AND ${additionalWhere}`;
      }
    } else {
      if (additionalWhere) {
        queryStr += additionalWhere.trim().toUpperCase().startsWith('AND')
          ? ` WHERE ${additionalWhere.replace(/^AND\s+/i, '')}`
          : ` WHERE ${additionalWhere}`;
      }
    }

    // Always order by ID DESC for consistent cursor pagination
    const safeLimit = parseInt(limit) + 1;
    queryStr += ` ORDER BY id DESC LIMIT ${safeLimit}`;

    const result = await query(queryStr, queryParams);
    
    let hasNextPage = false;
    let nextCursor = null;

    if (result.rows.length > limit) {
      hasNextPage = true;
      // Remove the extra row
      result.rows.pop();
      // The cursor is the ID of the last item in the current set
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

  async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    let whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    if (this.hasSoftDelete) {
      whereClause += ` AND deleted_at IS NULL`;
    }

    const result = await query(
      `SELECT * FROM ${this.tableName} WHERE ${whereClause} LIMIT 1`,
      values
    );
    return result.rows[0];
  }

  async findById(id) {
    const queryStr = this.hasSoftDelete
      ? `SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`
      : `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await query(queryStr, [id]);
    return result.rows[0];
  }

  async delete(id) {
    if (this.hasSoftDelete) {
      await query(`UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = $1`, [id]);
    } else {
      await query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    }
  }
  async create(data, client = null) {
    const dbClient = client || { query: (text, params) => query(text, params) };
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    // Add created_at and updated_at if they aren't in data
    if (this.hasCreatedAt && !keys.includes('created_at')) {
      keys.push('created_at');
      values.push(new Date());
    }
    if (this.hasUpdatedAt && !keys.includes('updated_at')) {
      keys.push('updated_at');
      values.push(new Date());
    }

    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const queryStr = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const result = await dbClient.query(queryStr, values);
    return result.rows[0];
  }

  async update(id, data, client = null) {
    const dbClient = client || { query: (text, params) => query(text, params) };
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    // Auto-update updated_at
    if (this.hasUpdatedAt && !keys.includes('updated_at')) {
      keys.push('updated_at');
      values.push(new Date());
    }

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const queryStr = this.hasSoftDelete
      ? `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} AND deleted_at IS NULL RETURNING *`
      : `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    
    const result = await dbClient.query(queryStr, [...values, id]);
    return result.rows[0];
  }
}

module.exports = BaseRepository;
