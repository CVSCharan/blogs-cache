/**
 * Core type definitions for blogs-cache library
 */

/**
 * Cache client interface defining core cache operations
 * Implements Dependency Inversion Principle (DIP)
 */
export interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
}

/**
 * Session data structure for authentication
 */
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: Date;
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Cache key components for structured key building
 */
export interface CacheKeyComponents {
  service: string;
  resource: string;
  id: string;
  field?: string;
}
