import { getRedisClient, disconnectRedis } from '../src/client';

describe('Redis Client', () => {
  afterEach(async () => {
    await disconnectRedis();
    delete process.env.REDIS_URL;
  });

  describe('getRedisClient', () => {
    it('should throw error if REDIS_URL is not set', () => {
      delete process.env.REDIS_URL;
      expect(() => getRedisClient()).toThrow(
        'REDIS_URL environment variable is not set'
      );
    });

    it('should create Redis client with valid REDIS_URL', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      const client = getRedisClient();
      expect(client).toBeDefined();
      expect(client.status).toBeDefined();
    });

    it('should return same instance (singleton)', () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      const client1 = getRedisClient();
      const client2 = getRedisClient();
      expect(client1).toBe(client2);
    });
  });

  describe('disconnectRedis', () => {
    it('should disconnect Redis client', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      getRedisClient();
      await disconnectRedis();
      // After disconnect, should create new instance
      const newClient = getRedisClient();
      expect(newClient).toBeDefined();
    });

    it('should handle disconnect when no client exists', async () => {
      await expect(disconnectRedis()).resolves.not.toThrow();
    });
  });
});
