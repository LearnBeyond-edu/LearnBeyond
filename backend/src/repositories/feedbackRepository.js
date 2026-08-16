const BaseRepository = require('./baseRepository');

class FeedbackRepository extends BaseRepository {
  constructor() {
    super('feedback');
  }
}

module.exports = new FeedbackRepository();
