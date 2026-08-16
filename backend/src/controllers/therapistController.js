const BaseController = require('./baseController');
const therapistRepository = require('../repositories/therapistRepository');

class TherapistController extends BaseController {
  constructor() {
    super(therapistRepository);
  }
}

module.exports = new TherapistController();
