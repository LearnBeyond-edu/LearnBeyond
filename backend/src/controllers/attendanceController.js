const BaseController = require('./baseController');
const attendanceRepository = require('../repositories/attendanceRepository');

class AttendanceController extends BaseController {
  constructor() {
    super(attendanceRepository);
  }
}

module.exports = new AttendanceController();
