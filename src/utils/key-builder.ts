import type { CacheKeyComponents } from '../types';

/**
 * Build cache key from components
 * Implements consistent naming convention: {service}:{resource}:{id}:{field}
 * @param components Cache key components
 * @returns Formatted cache key
 */
export function buildKey(components: CacheKeyComponents): string {
  const { service, resource, id, field } = components;

  // Validate components
  if (!service || !resource || !id) {
    throw new Error('service, resource, and id are required for cache key');
  }

  // Build key
  const parts = [service, resource, id];
  if (field) {
    parts.push(field);
  }

  return parts.join(':');
}

/**
 * Parse cache key into components
 * @param key Cache key string
 * @returns Parsed components
 */
export function parseKey(key: string): CacheKeyComponents {
  const parts = key.split(':');

  if (parts.length < 3) {
    throw new Error('Invalid cache key format');
  }

  return {
    service: parts[0],
    resource: parts[1],
    id: parts[2],
    field: parts[3],
  };
}

/**
 * Validate cache key format
 * @param key Cache key to validate
 * @returns true if valid
 */
export function isValidKey(key: string): boolean {
  try {
    parseKey(key);
    return true;
  } catch {
    return false;
  }
}
