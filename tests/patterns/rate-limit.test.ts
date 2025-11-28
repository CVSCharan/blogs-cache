import { RateLimiter } from '../../src/patterns/rate-limit';
import { cache } from '../../src/cache.service';
import type { RateLimitConfig } from '../../src/types';

jest.mock('../../src/cache.service');

const mockCache = cache as jest.Mocked<typeof cache>;

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    jest.clearAllMocks();
  });

  describe('checkLimit', () => {
    it('should allow requests within limit', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowSeconds: 60,
      };
      mockCache.incr.mockResolvedValue(5);
      mockCache.ttl.mockResolvedValue(30);

      const result = await rateLimiter.checkLimit('user-123', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should block requests exceeding limit', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowSeconds: 60,
      };
      mockCache.incr.mockResolvedValue(11);
      mockCache.ttl.mockResolvedValue(30);

      const result = await rateLimiter.checkLimit('user-123', config);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should set expiration on first request', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowSeconds: 60,
      };
      mockCache.incr.mockResolvedValue(1);
      mockCache.ttl.mockResolvedValue(60);

      await rateLimiter.checkLimit('user-123', config);
      expect(mockCache.expire).toHaveBeenCalledWith('ratelimit:user-123', 60);
    });

    it('should not set expiration on subsequent requests', async () => {
      const config: RateLimitConfig = {
        maxRequests: 10,
        windowSeconds: 60,
      };
      mockCache.incr.mockResolvedValue(5);
      mockCache.ttl.mockResolvedValue(30);

      await rateLimiter.checkLimit('user-123', config);
      expect(mockCache.expire).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('should reset rate limit', async () => {
      await rateLimiter.reset('user-123');
      expect(mockCache.del).toHaveBeenCalledWith('ratelimit:user-123');
    });
  });

  describe('getCount', () => {
    it('should get current count', async () => {
      mockCache.get.mockResolvedValue(5);

      const result = await rateLimiter.getCount('user-123');
      expect(result).toBe(5);
    });

    it('should return 0 if no count exists', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await rateLimiter.getCount('user-123');
      expect(result).toBe(0);
    });
  });

  describe('getTTL', () => {
    it('should get remaining TTL', async () => {
      mockCache.ttl.mockResolvedValue(30);

      const result = await rateLimiter.getTTL('user-123');
      expect(result).toBe(30);
    });
  });
});
