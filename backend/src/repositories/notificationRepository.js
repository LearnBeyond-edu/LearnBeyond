const BaseRepository = require('./baseRepository');

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications', false, false, true);
  }
}

module.exports = new NotificationRepository();
