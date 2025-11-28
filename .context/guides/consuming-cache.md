# Consuming `@cvscharan/blogs-cache`

This guide details how to integrate and use the shared caching library in other microservices (e.g., `blogs-auth`, `blogs-api`).

## 📦 Installation

```bash
npm install @cvscharan/blogs-cache
```

## ⚙️ Configuration

The library relies on a single environment variable to establish the Redis connection.

### Environment Variables

Add the following to your service's `.env` file:

```bash
# Production / Staging
REDIS_URL="redis://:password@host:port"

# Local Development (Docker)
REDIS_URL="redis://:local_dev_password@localhost:6379"
```

> **Note**: The library handles connection management (reconnection, error logging) automatically. You do not need to manually connect.

---

## 🚀 Quick Start

The library exports pre-configured instances for common patterns. You can import them directly.

```typescript
import {
  sessionCache,
  apiCache,
  rateLimiter,
  counter,
} from '@cvscharan/blogs-cache';
```

---

## 📚 Caching Patterns

### 1. Session Management (`blogs-auth`)

Use `sessionCache` for managing user authentication sessions. It enforces a **24-hour TTL**.

```typescript
import { sessionCache } from '@cvscharan/blogs-cache';

// Store a session (Login)
await sessionCache.set('session-123', {
  userId: 'user-abc',
  email: 'user@example.com',
  role: 'USER',
  createdAt: new Date(),
});

// Retrieve a session (Auth Middleware)
const session = await sessionCache.get('session-123');
if (!session) {
  // Session expired or invalid
}

// Refresh session (Activity)
await sessionCache.refresh('session-123');

// Logout
await sessionCache.delete('session-123');

// Invalidate all user sessions (Password Reset / Security)
await sessionCache.deleteAllForUser('user-abc');
```

### 2. API Response Caching (`blogs-api`)

Use `apiCache` for caching expensive database queries or computed responses.

**Caching a Single Post:**

```typescript
import { apiCache } from '@cvscharan/blogs-cache';

// Try cache first
const cachedPost = await apiCache.getPost('post-123');
if (cachedPost) return cachedPost;

// If miss, fetch from DB and cache
const post = await db.post.findUnique({ ... });
await apiCache.cachePost('post-123', post);
```

**Caching Lists:**

```typescript
// Cache a trending list for 5 minutes
await apiCache.cacheList('trending', posts, 300);

// Retrieve list
const trending = await apiCache.getList('trending');
```

**Invalidation:**

```typescript
// When a post is updated
await apiCache.invalidatePost('post-123');

// When an author updates their profile (invalidate all their posts)
await apiCache.invalidateAuthorPosts('author-abc');
```

### 3. Rate Limiting (`blogs-api`, `blogs-auth`)

Use `rateLimiter` to protect endpoints. It uses a **sliding window** algorithm.

```typescript
import { rateLimiter } from '@cvscharan/blogs-cache';

const config = {
  maxRequests: 100, // Allow 100 requests
  windowSeconds: 60, // Per 60 seconds
};

const result = await rateLimiter.checkLimit('ip-127.0.0.1', config);

if (!result.allowed) {
  throw new Error(
    `Rate limit exceeded. Try again in ${result.resetAt} seconds.`
  );
}

console.log(`Remaining requests: ${result.remaining}`);
```

### 4. Counters (`blogs-analytics`)

Use `counter` for high-velocity atomic increments (e.g., post views).

```typescript
import { counter } from '@cvscharan/blogs-cache';

// Increment view count
const newCount = await counter.increment('post-123');

// Get current count
const views = await counter.get('post-123');

// Get multiple counts (for list view)
const counts = await counter.getMultiple(['post-1', 'post-2', 'post-3']);
```

---

## 🛠️ Advanced Usage

### Direct Redis Access

If you need raw Redis commands not covered by the patterns, you can get the underlying client.

```typescript
import { getRedisClient } from '@cvscharan/blogs-cache';

const redis = getRedisClient();
await redis.sadd('myset', 'value');
```

### Custom Cache Keys

If you need to build keys manually following the project convention (`service:resource:id:field`):

```typescript
import { buildKey } from '@cvscharan/blogs-cache';

const key = buildKey('custom-service', 'widget', '123', 'status');
// Output: "custom-service:widget:123:status"
```

---

## ⚠️ Error Handling

The library is designed to be **fail-safe**.

- If Redis is down, cache operations (get/set) will generally catch errors, log them, and return `null` or fail gracefully so your main application flow isn't interrupted.
- **Exception**: `getRedisClient()` will throw if `REDIS_URL` is missing at startup.

## 🐳 Local Development

To run a compatible Redis instance locally:

1. Copy the `docker-compose.yml` from this repo or run:
   ```bash
   docker run -d -p 6379:6379 -e REDIS_PASSWORD=local_dev_password redis:7-alpine redis-server --requirepass local_dev_password
   ```
2. Set `REDIS_URL="redis://:local_dev_password@localhost:6379"` in your service's `.env`.
