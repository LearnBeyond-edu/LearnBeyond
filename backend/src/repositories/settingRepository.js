const BaseRepository = require('./baseRepository');

class SettingRepository extends BaseRepository {
  constructor() {
    super('settings');
  }
}

module.exports = new SettingRepository();
