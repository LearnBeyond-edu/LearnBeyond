const BaseRepository = require('./baseRepository');

class LessonRepository extends BaseRepository {
  constructor() {
    super('lessons');
  }

  async create(data) {
    // lessons table does not have institution_id, but baseController might inject it.
    const cleanData = { ...data };
    delete cleanData.institution_id;
    return super.create(cleanData);
  }
}

module.exports = new LessonRepository();
