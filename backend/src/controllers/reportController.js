const BaseController = require('./baseController');
const reportRepository = require('../repositories/reportRepository');

class ReportController extends BaseController {
  constructor() {
    super(reportRepository);
  }
}

module.exports = new ReportController();
