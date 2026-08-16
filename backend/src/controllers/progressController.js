const BaseController = require('./baseController');
const progressRepository = require('../repositories/progressRepository');

class ProgressController extends BaseController {
  constructor() {
    super(progressRepository);
  }
}

module.exports = new ProgressController();
