import 'dotenv/config';
import {
  getRedisClient,
  sessionCache,
  apiCache,
  rateLimiter,
  counter,
} from './index';

/**
 * Playground script for development
 * Run with: npm run dev
 */
async function main() {
  try {
    console.log('🚀 Starting blogs-cache playground...');

    // Ensure Redis is connected
    const redis = getRedisClient();
    await redis.ping();
    console.log('✅ Redis connected');

    // 1. Session Cache Example
    console.log('\n--- Session Cache ---');
    const sessionId = 'dev-session-' + Date.now();
    await sessionCache.set(sessionId, {
      userId: 'user-dev',
      email: 'dev@example.com',
      role: 'DEVELOPER',
      createdAt: new Date(),
    });
    console.log('Set session:', sessionId);
    const session = await sessionCache.get(sessionId);
    console.log('Retrieved session:', session);

    // 2. API Cache Example
    console.log('\n--- API Cache ---');
    const postId = 'post-dev-' + Date.now();
    await apiCache.cachePost(postId, {
      title: 'Dev Post',
      content: 'Hello World',
    });
    console.log('Cached post:', postId);
    const post = await apiCache.getPost(postId);
    console.log('Retrieved post:', post);

    // 3. Rate Limiter Example
    console.log('\n--- Rate Limiter ---');
    const limitResult = await rateLimiter.checkLimit('dev-user', {
      maxRequests: 5,
      windowSeconds: 10,
    });
    console.log('Rate limit check:', limitResult);

    // 4. Counter Example
    console.log('\n--- Counter ---');
    const count = await counter.increment('dev-views', 'home-page');
    console.log('View count:', count);

    console.log('\n✨ Playground finished successfully!');
  } catch (error) {
    console.error('❌ Error in playground:', error);
  } finally {
    // Keep process alive for a bit or exit
    // process.exit(0);
    // Nodemon will restart on change, so we can just let it finish or keep it running if we had a server.
    // Since this is a script, it will exit.
  }
}

main();
