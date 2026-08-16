const logger = require('../utils/logger');

// Simple in-memory mock for Redis when running locally without a Redis server
const mockStore = new Map();
const timers = new Map();

const redisMock = {
  // set(key, value) or set(key, value, 'EX', seconds)
  set: async (key, value, ...args) => {
    mockStore.set(key, String(value));
    // Handle EX (expire in seconds)
    const exIdx = args.findIndex(a => String(a).toUpperCase() === 'EX');
    if (exIdx !== -1 && args[exIdx + 1]) {
      const seconds = parseInt(args[exIdx + 1]);
      if (timers.has(key)) clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => mockStore.delete(key), seconds * 1000));
    }
    return 'OK';
  },
  get: async (key) => mockStore.get(key) || null,
  del: async (key) => {
    if (timers.has(key)) clearTimeout(timers.get(key));
    mockStore.delete(key);
    return 1;
  },
  incr: async (key) => {
    const val = (parseInt(mockStore.get(key)) || 0) + 1;
    mockStore.set(key, String(val));
    return val;
  },
  ping: async () => 'PONG',
  on: () => {},
};

logger.info('Using in-memory Redis mock (no local Redis server required).');
module.exports = redisMock;

