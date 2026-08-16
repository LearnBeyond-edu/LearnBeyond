const BaseController = require('./baseController');
const assignmentRepository = require('../repositories/assignmentRepository');

class AssignmentController extends BaseController {
  constructor() {
    super(assignmentRepository);
  }
}

module.exports = new AssignmentController();
