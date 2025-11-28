import { serialize, deserialize } from '../../src/utils/serializer';

describe('Serializer', () => {
  describe('serialize', () => {
    it('should serialize simple objects', () => {
      const obj = { foo: 'bar', num: 42 };
      const result = serialize(obj);
      expect(result).toBe(JSON.stringify(obj));
    });

    it('should serialize Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const obj = { createdAt: date };
      const result = serialize(obj);
      const parsed = JSON.parse(result);
      expect(parsed.createdAt).toEqual({
        __type: 'Date',
        value: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should serialize nested objects with Dates', () => {
      const obj = {
        user: {
          name: 'John',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
      };
      const result = serialize(obj);
      const parsed = JSON.parse(result);
      expect(parsed.user.createdAt).toEqual({
        __type: 'Date',
        value: '2024-01-01T00:00:00.000Z',
      });
    });
  });

  describe('deserialize', () => {
    it('should deserialize simple objects', () => {
      const json = JSON.stringify({ foo: 'bar', num: 42 });
      const result = deserialize<{ foo: string; num: number }>(json);
      expect(result).toEqual({ foo: 'bar', num: 42 });
    });

    it('should deserialize Date objects', () => {
      const json = JSON.stringify({
        createdAt: {
          __type: 'Date',
          value: '2024-01-01T00:00:00.000Z',
        },
      });
      const result = deserialize<{ createdAt: Date }>(json);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should deserialize nested objects with Dates', () => {
      const json = JSON.stringify({
        user: {
          name: 'John',
          createdAt: {
            __type: 'Date',
            value: '2024-01-01T00:00:00.000Z',
          },
        },
      });
      const result = deserialize<{
        user: { name: string; createdAt: Date };
      }>(json);
      expect(result.user.createdAt).toBeInstanceOf(Date);
      expect(result.user.name).toBe('John');
    });

    it('should handle arrays', () => {
      const json = JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }]);
      const result = deserialize<Array<{ id: number }>>(json);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
    });
  });

  describe('round-trip serialization', () => {
    it('should preserve data through serialize/deserialize cycle', () => {
      const original = {
        id: 'test-123',
        name: 'Test',
        count: 42,
        active: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        metadata: {
          tags: ['tag1', 'tag2'],
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      };

      const serialized = serialize(original);
      const deserialized = deserialize<typeof original>(serialized);

      expect(deserialized.id).toBe(original.id);
      expect(deserialized.name).toBe(original.name);
      expect(deserialized.count).toBe(original.count);
      expect(deserialized.active).toBe(original.active);
      expect(deserialized.createdAt).toBeInstanceOf(Date);
      expect(deserialized.createdAt.toISOString()).toBe(
        original.createdAt.toISOString()
      );
      expect(deserialized.metadata.tags).toEqual(original.metadata.tags);
      expect(deserialized.metadata.updatedAt).toBeInstanceOf(Date);
      expect(deserialized.metadata.updatedAt.toISOString()).toBe(
        original.metadata.updatedAt.toISOString()
      );
    });
  });
});
