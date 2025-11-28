import { cache } from '../cache.service';

/**
 * Default TTLs for different resource types
 */
const DEFAULT_TTL = {
  POST: 3600, // 1 hour
  LIST: 300, // 5 minutes
  CATEGORY: 3600, // 1 hour
  PROFILE: 1800, // 30 minutes
};

/**
 * API cache prefix
 */
const API_PREFIX = 'api';

/**
 * API response caching pattern
 * Implements cache-aside pattern for API responses
 */
export class ApiCache {
  /**
   * Cache a blog post
   * @param postId Post identifier
   * @param post Post data
   * @param ttl Time to live in seconds (default: 1 hour)
   */
  async cachePost(
    postId: string,
    post: unknown,
    ttl: number = DEFAULT_TTL.POST
  ): Promise<void> {
    const key = `${API_PREFIX}:post:${postId}`;
    await cache.set(key, post, ttl);
  }

  /**
   * Get cached post
   * @param postId Post identifier
   * @returns Post data or null if not cached
   */
  async getPost(postId: string): Promise<unknown | null> {
    const key = `${API_PREFIX}:post:${postId}`;
    return await cache.get(key);
  }

  /**
   * Invalidate (delete) cached post
   * @param postId Post identifier
   */
  async invalidatePost(postId: string): Promise<void> {
    const key = `${API_PREFIX}:post:${postId}`;
    await cache.del(key);
  }

  /**
   * Invalidate all posts by an author
   * @param authorId Author identifier
   * @returns Number of posts invalidated
   */
  async invalidateAuthorPosts(authorId: string): Promise<number> {
    return await cache.delPattern(`${API_PREFIX}:author:${authorId}:*`);
  }

  /**
   * Cache a list (e.g., trending posts, recent posts)
   * @param listType Type of list (e.g., "trending", "recent")
   * @param data List data
   * @param ttl Time to live in seconds (default: 5 minutes)
   */
  async cacheList(
    listType: string,
    data: unknown[],
    ttl: number = DEFAULT_TTL.LIST
  ): Promise<void> {
    const key = `${API_PREFIX}:list:${listType}`;
    await cache.set(key, data, ttl);
  }

  /**
   * Get cached list
   * @param listType Type of list
   * @returns List data or null if not cached
   */
  async getList(listType: string): Promise<unknown[] | null> {
    const key = `${API_PREFIX}:list:${listType}`;
    return await cache.get<unknown[]>(key);
  }

  /**
   * Invalidate cached list
   * @param listType Type of list
   */
  async invalidateList(listType: string): Promise<void> {
    const key = `${API_PREFIX}:list:${listType}`;
    await cache.del(key);
  }

  /**
   * Cache category data
   * @param categoryId Category identifier
   * @param category Category data
   * @param ttl Time to live in seconds (default: 1 hour)
   */
  async cacheCategory(
    categoryId: string,
    category: unknown,
    ttl: number = DEFAULT_TTL.CATEGORY
  ): Promise<void> {
    const key = `${API_PREFIX}:category:${categoryId}`;
    await cache.set(key, category, ttl);
  }

  /**
   * Get cached category
   * @param categoryId Category identifier
   * @returns Category data or null if not cached
   */
  async getCategory(categoryId: string): Promise<unknown | null> {
    const key = `${API_PREFIX}:category:${categoryId}`;
    return await cache.get(key);
  }

  /**
   * Cache user profile
   * @param userId User identifier
   * @param profile Profile data
   * @param ttl Time to live in seconds (default: 30 minutes)
   */
  async cacheProfile(
    userId: string,
    profile: unknown,
    ttl: number = DEFAULT_TTL.PROFILE
  ): Promise<void> {
    const key = `${API_PREFIX}:user:${userId}:profile`;
    await cache.set(key, profile, ttl);
  }

  /**
   * Get cached profile
   * @param userId User identifier
   * @returns Profile data or null if not cached
   */
  async getProfile(userId: string): Promise<unknown | null> {
    const key = `${API_PREFIX}:user:${userId}:profile`;
    return await cache.get(key);
  }

  /**
   * Invalidate all API cache
   * WARNING: Use with caution in production
   * @returns Number of keys deleted
   */
  async invalidateAll(): Promise<number> {
    return await cache.delPattern(`${API_PREFIX}:*`);
  }
}

/**
 * Singleton instance of ApiCache
 */
export const apiCache = new ApiCache();
