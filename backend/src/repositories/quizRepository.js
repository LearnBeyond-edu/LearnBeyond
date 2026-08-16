const BaseRepository = require('./baseRepository');

class QuizRepository extends BaseRepository {
  constructor() {
    super('quizzes');
  }

  async create(data) {
    const cleanData = { ...data };
    delete cleanData.institution_id;
    return super.create(cleanData);
  }
}

module.exports = new QuizRepository();
