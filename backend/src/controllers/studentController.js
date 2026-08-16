const BaseController = require('./baseController');
const studentRepository = require('../repositories/studentRepository');

class StudentController extends BaseController {
  constructor() {
    super(studentRepository);
  }
}

module.exports = new StudentController();
