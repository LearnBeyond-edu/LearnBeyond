const BaseRepository = require('./baseRepository');

class ReportRepository extends BaseRepository {
  constructor() {
    super('reports');
  }
}

module.exports = new ReportRepository();
