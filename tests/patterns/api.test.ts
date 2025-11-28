import { ApiCache } from '../../src/patterns/api.cache';
import { cache } from '../../src/cache.service';

jest.mock('../../src/cache.service');

const mockCache = cache as jest.Mocked<typeof cache>;

describe('ApiCache', () => {
  let apiCache: ApiCache;

  beforeEach(() => {
    apiCache = new ApiCache();
    jest.clearAllMocks();
  });

  describe('Post caching', () => {
    it('should cache post with default TTL', async () => {
      const post = { id: 'post-123', title: 'Test Post' };

      await apiCache.cachePost('post-123', post);
      expect(mockCache.set).toHaveBeenCalledWith(
        'api:post:post-123',
        post,
        3600
      );
    });

    it('should cache post with custom TTL', async () => {
      const post = { id: 'post-123', title: 'Test Post' };

      await apiCache.cachePost('post-123', post, 7200);
      expect(mockCache.set).toHaveBeenCalledWith(
        'api:post:post-123',
        post,
        7200
      );
    });

    it('should get cached post', async () => {
      const post = { id: 'post-123', title: 'Test Post' };
      mockCache.get.mockResolvedValue(post);

      const result = await apiCache.getPost('post-123');
      expect(result).toEqual(post);
      expect(mockCache.get).toHaveBeenCalledWith('api:post:post-123');
    });

    it('should invalidate post', async () => {
      await apiCache.invalidatePost('post-123');
      expect(mockCache.del).toHaveBeenCalledWith('api:post:post-123');
    });

    it('should invalidate author posts', async () => {
      mockCache.delPattern.mockResolvedValue(5);

      const result = await apiCache.invalidateAuthorPosts('author-123');
      expect(result).toBe(5);
      expect(mockCache.delPattern).toHaveBeenCalledWith(
        'api:author:author-123:*'
      );
    });
  });

  describe('List caching', () => {
    it('should cache list with default TTL', async () => {
      const list = [{ id: '1' }, { id: '2' }];

      await apiCache.cacheList('trending', list);
      expect(mockCache.set).toHaveBeenCalledWith(
        'api:list:trending',
        list,
        300
      );
    });

    it('should get cached list', async () => {
      const list = [{ id: '1' }, { id: '2' }];
      mockCache.get.mockResolvedValue(list);

      const result = await apiCache.getList('trending');
      expect(result).toEqual(list);
    });

    it('should invalidate list', async () => {
      await apiCache.invalidateList('trending');
      expect(mockCache.del).toHaveBeenCalledWith('api:list:trending');
    });
  });

  describe('Category caching', () => {
    it('should cache category', async () => {
      const category = { id: 'cat-123', name: 'Technology' };

      await apiCache.cacheCategory('cat-123', category);
      expect(mockCache.set).toHaveBeenCalledWith(
        'api:category:cat-123',
        category,
        3600
      );
    });

    it('should get cached category', async () => {
      const category = { id: 'cat-123', name: 'Technology' };
      mockCache.get.mockResolvedValue(category);

      const result = await apiCache.getCategory('cat-123');
      expect(result).toEqual(category);
    });
  });

  describe('Profile caching', () => {
    it('should cache profile', async () => {
      const profile = { id: 'user-123', name: 'John Doe' };

      await apiCache.cacheProfile('user-123', profile);
      expect(mockCache.set).toHaveBeenCalledWith(
        'api:user:user-123:profile',
        profile,
        1800
      );
    });

    it('should get cached profile', async () => {
      const profile = { id: 'user-123', name: 'John Doe' };
      mockCache.get.mockResolvedValue(profile);

      const result = await apiCache.getProfile('user-123');
      expect(result).toEqual(profile);
    });
  });

  describe('invalidateAll', () => {
    it('should invalidate all API cache', async () => {
      mockCache.delPattern.mockResolvedValue(100);

      const result = await apiCache.invalidateAll();
      expect(result).toBe(100);
      expect(mockCache.delPattern).toHaveBeenCalledWith('api:*');
    });
  });
});
