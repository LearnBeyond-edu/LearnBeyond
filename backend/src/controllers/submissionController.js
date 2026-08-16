const BaseController = require('./baseController');
const submissionRepository = require('../repositories/submissionRepository');

class SubmissionController extends BaseController {
  constructor() {
    super(submissionRepository);
  }
}

module.exports = new SubmissionController();
