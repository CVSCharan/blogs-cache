import { getRedisClient } from './client';
import type { CacheClient } from './types';

/**
 * Core cache service implementing CacheClient interface
 * Provides type-safe caching operations with automatic serialization
 * Implements Single Responsibility Principle (SRP)
 */
export class CacheService implements CacheClient {
  private redis = getRedisClient();

  /**
   * Get value from cache
   * @param key Cache key
   * @returns Deserialized value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param key Cache key
   * @param value Value to cache (will be JSON serialized)
   * @param ttl Time to live in seconds (optional)
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete key from cache
   * @param key Cache key
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete keys matching pattern
   * @param pattern Redis key pattern (e.g., "session:*")
   * @returns Number of keys deleted
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.redis.del(...keys);
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Increment counter atomically
   * @param key Cache key
   * @returns New counter value
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiration on key
   * @param key Cache key
   * @param seconds Time to live in seconds
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
    }
  }

  /**
   * Get remaining TTL for key
   * @param key Cache key
   * @returns Remaining TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }
}

/**
 * Singleton instance of CacheService
 * Export for direct usage
 */
export const cache = new CacheService();
