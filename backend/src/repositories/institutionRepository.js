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
    const result = await query(
      `UPDATE institutions 
       SET deleted_at = NOW(), 
           account_status = 'Inactive', 
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    await query(
      `UPDATE users 
       SET is_active = false, 
           updated_at = NOW() 
       WHERE institution_id = $1`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new InstitutionRepository();
