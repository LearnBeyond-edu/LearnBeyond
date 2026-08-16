const BaseRepository = require('./baseRepository');

class AttendanceRepository extends BaseRepository {
  constructor() {
    super('attendance');
  }
}

module.exports = new AttendanceRepository();
