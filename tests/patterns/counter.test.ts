import { Counter } from '../../src/patterns/counter';
import { cache } from '../../src/cache.service';

jest.mock('../../src/cache.service');

const mockCache = cache as jest.Mocked<typeof cache>;

describe('Counter', () => {
  let counter: Counter;

  beforeEach(() => {
    counter = new Counter();
    jest.clearAllMocks();
  });

  describe('increment', () => {
    it('should increment counter atomically', async () => {
      mockCache.incr.mockResolvedValue(5);

      const result = await counter.increment('views', 'post-123');
      expect(result).toBe(5);
      expect(mockCache.incr).toHaveBeenCalledWith('counter:views:post-123');
    });
  });

  describe('get', () => {
    it('should get counter value', async () => {
      mockCache.get.mockResolvedValue(10);

      const result = await counter.get('views', 'post-123');
      expect(result).toBe(10);
      expect(mockCache.get).toHaveBeenCalledWith('counter:views:post-123');
    });

    it('should return 0 if counter does not exist', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await counter.get('views', 'post-123');
      expect(result).toBe(0);
    });
  });

  describe('getMultiple', () => {
    it('should get multiple counter values', async () => {
      mockCache.get
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(20)
        .mockResolvedValueOnce(30);

      const result = await counter.getMultiple('views', [
        'post-1',
        'post-2',
        'post-3',
      ]);

      expect(result.size).toBe(3);
      expect(result.get('post-1')).toBe(10);
      expect(result.get('post-2')).toBe(20);
      expect(result.get('post-3')).toBe(30);
    });
  });

  describe('set', () => {
    it('should set counter to specific value', async () => {
      await counter.set('views', 'post-123', 100);
      expect(mockCache.set).toHaveBeenCalledWith('counter:views:post-123', 100);
    });
  });

  describe('reset', () => {
    it('should reset counter', async () => {
      await counter.reset('views', 'post-123');
      expect(mockCache.del).toHaveBeenCalledWith('counter:views:post-123');
    });
  });

  describe('decrement', () => {
    it('should decrement counter', async () => {
      mockCache.get.mockResolvedValue(10);

      const result = await counter.decrement('views', 'post-123');
      expect(result).toBe(9);
      expect(mockCache.set).toHaveBeenCalledWith('counter:views:post-123', 9);
    });

    it('should not go below zero', async () => {
      mockCache.get.mockResolvedValue(0);

      const result = await counter.decrement('views', 'post-123');
      expect(result).toBe(0);
    });
  });

  describe('incrementBy', () => {
    it('should increment counter by specific amount', async () => {
      mockCache.get.mockResolvedValue(10);

      const result = await counter.incrementBy('views', 'post-123', 5);
      expect(result).toBe(15);
      expect(mockCache.set).toHaveBeenCalledWith('counter:views:post-123', 15);
    });
  });
});
