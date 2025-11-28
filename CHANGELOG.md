# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-28

### Added

- Initial release of `@cvscharan/blogs-cache`
- Redis client singleton with robust connection management
- Core cache operations (get, set, del, delPattern, incr, expire, ttl)
- Session caching pattern with 24-hour TTL
- API caching pattern for posts, lists, categories, and profiles
- Rate limiting pattern with sliding window algorithm
- Counter pattern for atomic view counts and analytics
- Utility functions for cache key building and serialization
- Comprehensive test suite with 80%+ coverage
- TypeScript support with full type definitions
- ESLint and Prettier configuration
- Jest testing framework
- GitHub Actions CI/CD pipeline
- Comprehensive documentation

### Features

- **Type Safety**: Full TypeScript support with generic types
- **Production Ready**: Robust error handling, retry logic, graceful shutdown
- **Clean Architecture**: Clear separation of concerns following SOLID principles
- **Pre-built Patterns**: Session, API, Rate Limiting, and Counter patterns
- **Consistent Naming**: Standardized cache key convention
- **Flexible TTLs**: Configurable time-to-live for different data types

### Technical Details

- Node.js 20+ support
- ioredis 5.3.2 as Redis client
- 80%+ test coverage requirement
- ESLint with TypeScript support
- Prettier for code formatting
- GitHub Packages publishing

## [Unreleased]

### Planned

- Integration tests with real Redis instance
- Performance benchmarks
- Monitoring and metrics integration
- Additional caching patterns (LRU, LFU)
- Redis Cluster support
- Sentinel support for high availability

---

[1.0.0]: https://github.com/CVSCharan/blogs-cache/releases/tag/v1.0.0
