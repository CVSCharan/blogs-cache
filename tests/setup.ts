process.env.REDIS_URL = 'redis://localhost:6379';
jest.mock('ioredis', () => require('../__mocks__/ioredis'));
