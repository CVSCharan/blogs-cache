# blogs-cache

> Shared Redis caching library for Blog Platform

[![CI/CD Pipeline](https://github.com/CVSCharan/blogs-cache/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/CVSCharan/blogs-cache/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/CVSCharan/blogs-cache/branch/main/graph/badge.svg)](https://codecov.io/gh/CVSCharan/blogs-cache)

## Overview

`blogs-cache` is a production-ready Redis caching library designed for the Blog Platform microservices architecture. It provides type-safe caching operations, pre-built caching patterns, and consistent cache management following SOLID principles and Clean Architecture.

### Features

✅ **Type-safe operations** - Full TypeScript support with generic types  
✅ **Pre-built patterns** - Session, API, Rate Limiting, and Counter patterns  
✅ **Production-ready** - Robust error handling, retry logic, graceful shutdown  
✅ **Clean Architecture** - Clear separation of concerns, SOLID principles  
✅ **Comprehensive tests** - 80%+ code coverage  
✅ **Zero dependencies** - Only `ioredis` as production dependency

## Installation

### Prerequisites

- Node.js 20+
- Redis instance (local or cloud)

### Install from GitHub Packages

1. Configure npm to use GitHub Packages:

```bash
echo "@cvscharan:registry=https://npm.pkg.github.com" >> .npmrc
```

2. Install the package:

```bash
npm install @cvscharan/blogs-cache
```

## Quick Start

### 1. Set up environment variables

```bash
# .env
REDIS_URL="redis://localhost:6379"

# For Redis Cloud (production)
# REDIS_URL="redis://:password@host:port"
```

### 2. Use in your application

```typescript
import { sessionCache, apiCache, rateLimiter, counter } from '@cvscharan/blogs-cache';

// Session management
await sessionCache.set('session-123', {
  userId: 'user-456',
  email: 'user@example.com',
  role: 'AUTHOR',
  createdAt: new Date(),
});

const session = await sessionCache.get('session-123');

// API caching
await apiCache.cachePost('post-123', post, 3600); // 1 hour TTL
const cachedPost = await apiCache.getPost('post-123');

// Rate limiting
const result = await rateLimiter.checkLimit('user-456', {
  maxRequests: 100,
  windowSeconds: 60,
});

if (!result.allowed) {
  throw new Error('Rate limit exceeded');
}

// View counters
const viewCount = await counter.increment('views', 'post-123');
```

## API Reference

### Core Cache Service

```typescript
import { cache } from '@cvscharan/blogs-cache';

// Get value
const value = await cache.get<T>(key);

// Set value with optional TTL
await cache.set(key, value, ttl?);

// Delete key
await cache.del(key);

// Delete by pattern
const count = await cache.delPattern('session:*');

// Increment counter
const newValue = await cache.incr(key);

// Set expiration
await cache.expire(key, seconds);

// Get TTL
const ttl = await cache.ttl(key);
```

### Session Cache Pattern

```typescript
import { sessionCache } from '@cvscharan/blogs-cache';

// Store session (24-hour TTL)
await sessionCache.set(sessionId, sessionData);

// Get session
const session = await sessionCache.get(sessionId);

// Delete session
await sessionCache.delete(sessionId);

// Delete all sessions for user
await sessionCache.deleteAllForUser(userId);

// Refresh session TTL
await sessionCache.refresh(sessionId);
```

### API Cache Pattern

```typescript
import { apiCache } from '@cvscharan/blogs-cache';

// Cache post (1-hour TTL)
await apiCache.cachePost(postId, post);

// Get cached post
const post = await apiCache.getPost(postId);

// Invalidate post
await apiCache.invalidatePost(postId);

// Cache list (5-minute TTL)
await apiCache.cacheList('trending', posts);

// Get cached list
const trending = await apiCache.getList('trending');
```

### Rate Limiter Pattern

```typescript
import { rateLimiter } from '@cvscharan/blogs-cache';

// Check rate limit
const result = await rateLimiter.checkLimit(identifier, {
  maxRequests: 100,
  windowSeconds: 60,
});

// result = { allowed: boolean, remaining: number, resetAt: number }

// Reset rate limit
await rateLimiter.reset(identifier);
```

### Counter Pattern

```typescript
import { counter } from '@cvscharan/blogs-cache';

// Increment counter
const count = await counter.increment('views', postId);

// Get counter value
const views = await counter.get('views', postId);

// Get multiple counters
const counters = await counter.getMultiple('views', [id1, id2, id3]);

// Reset counter
await counter.reset('views', postId);
```

## Cache Key Naming Convention

All cache keys follow the format: `{service}:{resource}:{id}:{field}`

Examples:
- `session:abc123` - Session data
- `api:post:post-123` - Blog post
- `api:list:trending` - Trending posts list
- `ratelimit:user-456` - Rate limit for user
- `counter:views:post-123` - View counter

## TTL Guidelines

| Data Type     | TTL          | Reason                          |
|---------------|--------------|---------------------------------|
| Sessions      | 24 hours     | User convenience                |
| Blog Posts    | 1 hour       | Content doesn't change often    |
| Post Lists    | 5 minutes    | Balance freshness & performance |
| Categories    | 1 hour       | Rarely change                   |
| User Profiles | 30 minutes   | May update occasionally         |
| View Counters | No expiry    | Synced to DB periodically       |
| Rate Limits   | 1-15 minutes | Short-lived protection          |

## Development

### Setup

```bash
# Clone repository
git clone https://github.com/CVSCharan/blogs-cache.git
cd blogs-cache

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Building

```bash
# Build TypeScript
npm run build

# Build in watch mode
npm run dev
```

### Linting and Formatting

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## License

MIT © CVS Charan

## Support

For issues and questions:
- GitHub Issues: https://github.com/CVSCharan/blogs-cache/issues
- Documentation: See implementation guides in `.context/guides/`

## Related Projects

- [`blogs-db`](https://github.com/CVSCharan/blogs-db) - Shared database library
- [`blogs-auth`](https://github.com/CVSCharan/blogs-auth) - Authentication service
- [`blogs-api`](https://github.com/CVSCharan/blogs-api) - Content API service
