const BaseController = require('./baseController');
const parentRepository = require('../repositories/parentRepository');

class ParentController extends BaseController {
  constructor() {
    super(parentRepository);
  }
}

module.exports = new ParentController();
