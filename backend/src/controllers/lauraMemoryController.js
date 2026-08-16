const BaseController = require('./baseController');
const lauraMemoryRepository = require('../repositories/lauraMemoryRepository');

class LauraMemoryController extends BaseController {
  constructor() {
    super(lauraMemoryRepository);
  }
}

module.exports = new LauraMemoryController();
