import Redis from 'ioredis';

/**
 * Redis client singleton instance
 * Implements Singleton Pattern for connection management
 */
let redis: Redis | null = null;

/**
 * Get or create Redis client singleton
 * @returns Redis client instance
 * @throws Error if REDIS_URL environment variable is not set
 */
export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number): number | void {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err: Error): boolean {
        console.error('Redis connection error:', err);
        return true;
      },
    });

    // Connection event handlers
    redis.on('error', (error: Error) => {
      console.error('Redis error:', error);
    });

    redis.on('connect', () => {
      console.warn('Redis connected successfully');
    });

    redis.on('reconnecting', () => {
      console.warn('Redis reconnecting...');
    });

    redis.on('close', () => {
      console.warn('Redis connection closed');
    });

    // Graceful shutdown handlers
    const cleanup = (): void => {
      void (async (): Promise<void> => {
        if (redis) {
          await redis.quit();
          redis = null;
          console.warn('Redis connection closed gracefully');
        }
      })();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  return redis;
}

/**
 * Disconnect Redis client
 * Used for testing and graceful shutdown
 */
export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
