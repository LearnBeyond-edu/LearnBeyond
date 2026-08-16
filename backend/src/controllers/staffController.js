const BaseController = require('./baseController');
const staffRepository = require('../repositories/staffRepository');

class StaffController extends BaseController {
  constructor() {
    super(staffRepository);
  }
}

module.exports = new StaffController();
