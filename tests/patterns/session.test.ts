import { SessionCache } from '../../src/patterns/session.cache';
import { cache } from '../../src/cache.service';
import type { SessionData } from '../../src/types';

jest.mock('../../src/cache.service');

const mockCache = cache as jest.Mocked<typeof cache>;

describe('SessionCache', () => {
  let sessionCache: SessionCache;

  beforeEach(() => {
    sessionCache = new SessionCache();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should get session data', async () => {
      const sessionData: SessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'AUTHOR',
        createdAt: new Date(),
      };
      mockCache.get.mockResolvedValue(sessionData);

      const result = await sessionCache.get('session-123');
      expect(result).toEqual(sessionData);
      expect(mockCache.get).toHaveBeenCalledWith('session:session-123');
    });

    it('should return null if session does not exist', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await sessionCache.get('missing-session');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set session data with TTL', async () => {
      const sessionData: SessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'AUTHOR',
        createdAt: new Date(),
      };

      await sessionCache.set('session-123', sessionData);
      expect(mockCache.set).toHaveBeenCalledWith(
        'session:session-123',
        sessionData,
        86400
      );
    });
  });

  describe('delete', () => {
    it('should delete session', async () => {
      await sessionCache.delete('session-123');
      expect(mockCache.del).toHaveBeenCalledWith('session:session-123');
    });
  });

  describe('deleteAllForUser', () => {
    it('should delete all sessions for user', async () => {
      mockCache.delPattern.mockResolvedValue(3);

      const result = await sessionCache.deleteAllForUser('user-123');
      expect(result).toBe(3);
      expect(mockCache.delPattern).toHaveBeenCalledWith('session:*:user-123');
    });
  });

  describe('refresh', () => {
    it('should refresh session TTL', async () => {
      await sessionCache.refresh('session-123');
      expect(mockCache.expire).toHaveBeenCalledWith('session:session-123', 86400);
    });
  });

  describe('getTTL', () => {
    it('should get remaining TTL', async () => {
      mockCache.ttl.mockResolvedValue(3600);

      const result = await sessionCache.getTTL('session-123');
      expect(result).toBe(3600);
      expect(mockCache.ttl).toHaveBeenCalledWith('session:session-123');
    });
  });
});
