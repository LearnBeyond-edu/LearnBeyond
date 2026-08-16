const BaseRepository = require('./baseRepository');

class LauraMemoryRepository extends BaseRepository {
  constructor() {
    super('laura_memory');
  }
}

module.exports = new LauraMemoryRepository();
