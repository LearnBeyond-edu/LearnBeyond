const BaseController = require('./baseController');
const feedbackRepository = require('../repositories/feedbackRepository');

class FeedbackController extends BaseController {
  constructor() {
    super(feedbackRepository);
  }
}

module.exports = new FeedbackController();
