import { buildKey, parseKey, isValidKey } from '../../src/utils/key-builder';

describe('Key Builder', () => {
  describe('buildKey', () => {
    it('should build key with all components', () => {
      const key = buildKey({
        service: 'api',
        resource: 'post',
        id: 'post-123',
        field: 'views',
      });
      expect(key).toBe('api:post:post-123:views');
    });

    it('should build key without field', () => {
      const key = buildKey({
        service: 'api',
        resource: 'post',
        id: 'post-123',
      });
      expect(key).toBe('api:post:post-123');
    });

    it('should throw error if service is missing', () => {
      expect(() =>
        buildKey({
          service: '',
          resource: 'post',
          id: 'post-123',
        })
      ).toThrow('service, resource, and id are required for cache key');
    });

    it('should throw error if resource is missing', () => {
      expect(() =>
        buildKey({
          service: 'api',
          resource: '',
          id: 'post-123',
        })
      ).toThrow('service, resource, and id are required for cache key');
    });

    it('should throw error if id is missing', () => {
      expect(() =>
        buildKey({
          service: 'api',
          resource: 'post',
          id: '',
        })
      ).toThrow('service, resource, and id are required for cache key');
    });
  });

  describe('parseKey', () => {
    it('should parse key with all components', () => {
      const components = parseKey('api:post:post-123:views');
      expect(components).toEqual({
        service: 'api',
        resource: 'post',
        id: 'post-123',
        field: 'views',
      });
    });

    it('should parse key without field', () => {
      const components = parseKey('api:post:post-123');
      expect(components).toEqual({
        service: 'api',
        resource: 'post',
        id: 'post-123',
        field: undefined,
      });
    });

    it('should throw error for invalid key format', () => {
      expect(() => parseKey('invalid')).toThrow('Invalid cache key format');
    });

    it('should throw error for key with only two parts', () => {
      expect(() => parseKey('api:post')).toThrow('Invalid cache key format');
    });
  });

  describe('isValidKey', () => {
    it('should return true for valid key', () => {
      expect(isValidKey('api:post:post-123')).toBe(true);
      expect(isValidKey('api:post:post-123:views')).toBe(true);
    });

    it('should return false for invalid key', () => {
      expect(isValidKey('invalid')).toBe(false);
      expect(isValidKey('api:post')).toBe(false);
    });
  });
});
