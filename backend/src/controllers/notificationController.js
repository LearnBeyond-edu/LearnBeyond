const BaseController = require('./baseController');
const notificationRepository = require('../repositories/notificationRepository');

class NotificationController extends BaseController {
  constructor() {
    super(notificationRepository);
  }
}

module.exports = new NotificationController();
