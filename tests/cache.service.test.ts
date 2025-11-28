import { CacheService } from '../src/cache.service';
import { getRedisClient, disconnectRedis } from '../src/client';

// Mock Redis client
jest.mock('../src/client');

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
};

(getRedisClient as jest.Mock).mockReturnValue(mockRedis);

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await disconnectRedis();
  });

  describe('get', () => {
    it('should get and deserialize value', async () => {
      const testData = { foo: 'bar' };
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await cacheService.get('test-key');
      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null if key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await cacheService.get('missing-key');
      expect(result).toBeNull();
    });

    it('should handle JSON parse errors gracefully', async () => {
      mockRedis.get.mockResolvedValue('invalid-json');

      const result = await cacheService.get('bad-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should serialize and set value without TTL', async () => {
      const testData = { foo: 'bar' };
      mockRedis.set.mockResolvedValue('OK');

      await cacheService.set('test-key', testData);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      );
    });

    it('should serialize and set value with TTL', async () => {
      const testData = { foo: 'bar' };
      mockRedis.setex.mockResolvedValue('OK');

      await cacheService.set('test-key', testData, 3600);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test-key',
        3600,
        JSON.stringify(testData)
      );
    });

    it('should handle set errors gracefully', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis error'));

      await expect(
        cacheService.set('test-key', { foo: 'bar' })
      ).resolves.not.toThrow();
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      mockRedis.del.mockResolvedValue(1);

      await cacheService.del('test-key');
      expect(mockRedis.del).toHaveBeenCalledWith('test-key');
    });

    it('should handle delete errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      await expect(cacheService.del('test-key')).resolves.not.toThrow();
    });
  });

  describe('delPattern', () => {
    it('should delete keys matching pattern', async () => {
      mockRedis.keys.mockResolvedValue(['key1', 'key2', 'key3']);
      mockRedis.del.mockResolvedValue(3);

      const result = await cacheService.delPattern('test:*');
      expect(result).toBe(3);
      expect(mockRedis.keys).toHaveBeenCalledWith('test:*');
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2', 'key3');
    });

    it('should return 0 if no keys match pattern', async () => {
      mockRedis.keys.mockResolvedValue([]);

      const result = await cacheService.delPattern('test:*');
      expect(result).toBe(0);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.delPattern('test:*');
      expect(result).toBe(0);
    });
  });

  describe('incr', () => {
    it('should increment counter', async () => {
      mockRedis.incr.mockResolvedValue(5);

      const result = await cacheService.incr('counter');
      expect(result).toBe(5);
      expect(mockRedis.incr).toHaveBeenCalledWith('counter');
    });

    it('should handle errors gracefully', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.incr('counter');
      expect(result).toBe(0);
    });
  });

  describe('expire', () => {
    it('should set expiration on key', async () => {
      mockRedis.expire.mockResolvedValue(1);

      await cacheService.expire('test-key', 3600);
      expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 3600);
    });

    it('should handle errors gracefully', async () => {
      mockRedis.expire.mockRejectedValue(new Error('Redis error'));

      await expect(
        cacheService.expire('test-key', 3600)
      ).resolves.not.toThrow();
    });
  });

  describe('ttl', () => {
    it('should get TTL for key', async () => {
      mockRedis.ttl.mockResolvedValue(3600);

      const result = await cacheService.ttl('test-key');
      expect(result).toBe(3600);
      expect(mockRedis.ttl).toHaveBeenCalledWith('test-key');
    });

    it('should handle errors gracefully', async () => {
      mockRedis.ttl.mockRejectedValue(new Error('Redis error'));

      const result = await cacheService.ttl('test-key');
      expect(result).toBe(-1);
    });
  });
});
