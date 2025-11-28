import { cache } from '../cache.service';
import type { SessionData } from '../types';

/**
 * Session TTL: 24 hours
 */
const SESSION_TTL = 86400;

/**
 * Session cache prefix
 */
const SESSION_PREFIX = 'session';

/**
 * Session caching pattern for authentication
 * Implements Open/Closed Principle (OCP) - extends cache functionality
 */
export class SessionCache {
  /**
   * Build session cache key
   * @param sessionId Session identifier
   * @returns Formatted cache key
   */
  private buildKey(sessionId: string): string {
    return `${SESSION_PREFIX}:${sessionId}`;
  }

  /**
   * Get session data from cache
   * @param sessionId Session identifier
   * @returns Session data or null if not found
   */
  async get(sessionId: string): Promise<SessionData | null> {
    return await cache.get<SessionData>(this.buildKey(sessionId));
  }

  /**
   * Store session data in cache
   * @param sessionId Session identifier
   * @param data Session data
   */
  async set(sessionId: string, data: SessionData): Promise<void> {
    await cache.set(this.buildKey(sessionId), data, SESSION_TTL);
  }

  /**
   * Delete session from cache
   * @param sessionId Session identifier
   */
  async delete(sessionId: string): Promise<void> {
    await cache.del(this.buildKey(sessionId));
  }

  /**
   * Delete all sessions for a user
   * @param userId User identifier
   * @returns Number of sessions deleted
   */
  async deleteAllForUser(userId: string): Promise<number> {
    return await cache.delPattern(`${SESSION_PREFIX}:*:${userId}`);
  }

  /**
   * Refresh session TTL (extend expiration)
   * @param sessionId Session identifier
   */
  async refresh(sessionId: string): Promise<void> {
    await cache.expire(this.buildKey(sessionId), SESSION_TTL);
  }

  /**
   * Get remaining TTL for session
   * @param sessionId Session identifier
   * @returns Remaining TTL in seconds
   */
  async getTTL(sessionId: string): Promise<number> {
    return await cache.ttl(this.buildKey(sessionId));
  }
}

/**
 * Singleton instance of SessionCache
 */
export const sessionCache = new SessionCache();
