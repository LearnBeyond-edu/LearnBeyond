const BaseRepository = require('./baseRepository');
const { getClient } = require('../config/db');

class SubmissionRepository extends BaseRepository {
  constructor() {
    super('submissions', false, false);
  }

  async create(data, client = null) {
    const dbClient = client || await getClient();
    try {
      if (data.student_id) {
        const res = await dbClient.query(`SELECT id FROM student_profiles WHERE user_id = $1 OR id = $1 LIMIT 1`, [data.student_id]);
        if (res.rows.length > 0) {
          data.student_id = res.rows[0].id;
        }
      }
      
      // Fix JSONB postgres serialization for objects/arrays
      if (data.answers && typeof data.answers !== 'string') {
        data.answers = JSON.stringify(data.answers);
      }
      if (data.files && typeof data.files !== 'string') {
        data.files = JSON.stringify(data.files);
      }
      if (data.content && typeof data.content !== 'string') {
        data.content = JSON.stringify(data.content);
      }
      return await super.create(data, dbClient);
    } finally {
      if (!client && dbClient.release) dbClient.release();
    }
  }
  
  async findAll(limit = 10, cursor = null, additionalWhere = '', params = []) {
    let newWhere = additionalWhere;
    let newParams = [...params];
    
    // Check if the where clause is filtering by student_id, which might be a user_id
    const match = newWhere.match(/student_id\s*=\s*\$(\d+)/);
    if (match && newParams.length >= parseInt(match[1])) {
      const paramIndex = parseInt(match[1]) - 1;
      const paramToSwap = newParams[paramIndex];
      const { query } = require('../config/db');
      if (typeof paramToSwap === 'string') {
        const res = await query(`SELECT id FROM student_profiles WHERE user_id = $1 LIMIT 1`, [paramToSwap]);
        if (res.rows.length > 0) {
          newParams[paramIndex] = res.rows[0].id;
        }
      }
    }
    
    return super.findAll(limit, cursor, newWhere, newParams);
  }
}

module.exports = new SubmissionRepository();
