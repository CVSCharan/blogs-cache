/**
 * blogs-cache - Shared Redis caching library for Blog Platform
 *
 * Main entry point for the library
 * Exports all public APIs following clean architecture principles
 */

// Core infrastructure
export { getRedisClient, disconnectRedis } from './client';
export { CacheService, cache } from './cache.service';

// Caching patterns
export { SessionCache, sessionCache } from './patterns/session.cache';
export { ApiCache, apiCache } from './patterns/api.cache';
export { RateLimiter, rateLimiter } from './patterns/rate-limit';
export { Counter, counter } from './patterns/counter';

// Types
export type {
  CacheClient,
  SessionData,
  RateLimitConfig,
  RateLimitResult,
  CacheKeyComponents,
} from './types';

// Utilities
export { buildKey, parseKey, isValidKey } from './utils/key-builder';
export { serialize, deserialize } from './utils/serializer';
