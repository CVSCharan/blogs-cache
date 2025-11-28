import { cache } from '../cache.service';

/**
 * Counter prefix
 */
const COUNTER_PREFIX = 'counter';

/**
 * Counter pattern for view counts and analytics
 * Implements atomic increment operations for real-time counters
 */
export class Counter {
  /**
   * Build counter cache key
   * @param resource Resource type (e.g., "views", "likes")
   * @param id Resource identifier
   * @returns Formatted cache key
   */
  private buildKey(resource: string, id: string): string {
    return `${COUNTER_PREFIX}:${resource}:${id}`;
  }

  /**
   * Increment counter atomically
   * @param resource Resource type
   * @param id Resource identifier
   * @returns New counter value
   */
  async increment(resource: string, id: string): Promise<number> {
    const key = this.buildKey(resource, id);
    return await cache.incr(key);
  }

  /**
   * Get counter value
   * @param resource Resource type
   * @param id Resource identifier
   * @returns Counter value (0 if not exists)
   */
  async get(resource: string, id: string): Promise<number> {
    const key = this.buildKey(resource, id);
    const value = await cache.get<number>(key);
    return value ?? 0;
  }

  /**
   * Get multiple counter values
   * @param resource Resource type
   * @param ids Array of resource identifiers
   * @returns Map of id to counter value
   */
  async getMultiple(
    resource: string,
    ids: string[]
  ): Promise<Map<string, number>> {
    const results = new Map<string, number>();

    await Promise.all(
      ids.map(async (id) => {
        const value = await this.get(resource, id);
        results.set(id, value);
      })
    );

    return results;
  }

  /**
   * Set counter to specific value
   * @param resource Resource type
   * @param id Resource identifier
   * @param value Counter value
   */
  async set(resource: string, id: string, value: number): Promise<void> {
    const key = this.buildKey(resource, id);
    await cache.set(key, value);
  }

  /**
   * Reset counter to zero
   * @param resource Resource type
   * @param id Resource identifier
   */
  async reset(resource: string, id: string): Promise<void> {
    const key = this.buildKey(resource, id);
    await cache.del(key);
  }

  /**
   * Decrement counter atomically
   * @param resource Resource type
   * @param id Resource identifier
   * @returns New counter value
   */
  async decrement(resource: string, id: string): Promise<number> {
    const current = await this.get(resource, id);
    const newValue = Math.max(0, current - 1);
    await this.set(resource, id, newValue);
    return newValue;
  }

  /**
   * Increment counter by specific amount
   * @param resource Resource type
   * @param id Resource identifier
   * @param amount Amount to increment by
   * @returns New counter value
   */
  async incrementBy(
    resource: string,
    id: string,
    amount: number
  ): Promise<number> {
    const current = await this.get(resource, id);
    const newValue = current + amount;
    await this.set(resource, id, newValue);
    return newValue;
  }
}

/**
 * Singleton instance of Counter
 */
export const counter = new Counter();
