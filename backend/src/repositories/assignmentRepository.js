const BaseRepository = require('./baseRepository');

class AssignmentRepository extends BaseRepository {
  constructor() {
    super('assignments');
  }

  async create(data) {
    // assignments table does not have institution_id, but baseController might inject it.
    const cleanData = { ...data };
    delete cleanData.institution_id;
    return super.create(cleanData);
  }
}

module.exports = new AssignmentRepository();
