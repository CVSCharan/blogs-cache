import { cache } from '../cache.service';
import type { RateLimitConfig, RateLimitResult } from '../types';

/**
 * Rate limit prefix
 */
const RATE_LIMIT_PREFIX = 'ratelimit';

/**
 * Rate limiting pattern for API protection
 * Implements sliding window rate limiting using Redis INCR + EXPIRE
 */
export class RateLimiter {
  /**
   * Build rate limit cache key
   * @param identifier Unique identifier (e.g., userId, IP address)
   * @returns Formatted cache key
   */
  private buildKey(identifier: string): string {
    return `${RATE_LIMIT_PREFIX}:${identifier}`;
  }

  /**
   * Check if request is within rate limit
   * @param identifier Unique identifier for rate limiting
   * @param config Rate limit configuration
   * @returns Rate limit result with allowed status, remaining count, and reset time
   */
  async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const key = this.buildKey(identifier);
    const count = await cache.incr(key);

    // Set expiration on first request
    if (count === 1) {
      await cache.expire(key, config.windowSeconds);
    }

    // Get remaining TTL
    const ttl = await cache.ttl(key);
    const resetAt = Date.now() + ttl * 1000;
    const remaining = Math.max(0, config.maxRequests - count);

    return {
      allowed: count <= config.maxRequests,
      remaining,
      resetAt,
    };
  }

  /**
   * Reset rate limit for identifier
   * @param identifier Unique identifier
   */
  async reset(identifier: string): Promise<void> {
    const key = this.buildKey(identifier);
    await cache.del(key);
  }

  /**
   * Get current count for identifier
   * @param identifier Unique identifier
   * @returns Current request count
   */
  async getCount(identifier: string): Promise<number> {
    const key = this.buildKey(identifier);
    const value = await cache.get<number>(key);
    return value ?? 0;
  }

  /**
   * Get remaining TTL for rate limit window
   * @param identifier Unique identifier
   * @returns Remaining seconds in window
   */
  async getTTL(identifier: string): Promise<number> {
    const key = this.buildKey(identifier);
    return await cache.ttl(key);
  }
}

/**
 * Singleton instance of RateLimiter
 */
export const rateLimiter = new RateLimiter();
