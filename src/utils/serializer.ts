/**
 * Serialize value to JSON string with Date handling
 * @param value Value to serialize
 * @returns JSON string
 */
export function serialize(value: unknown): string {
  return JSON.stringify(value, (_, val: unknown) => {
    // Handle Date objects
    if (val instanceof Date) {
      return { __type: 'Date', value: val.toISOString() };
    }
    return val;
  });
}

/**
 * Deserialize JSON string with Date handling
 * @param json JSON string
 * @returns Deserialized value
 */
export function deserialize<T>(json: string): T {
  return JSON.parse(json, (_, val: unknown) => {
    // Restore Date objects
    if (
      typeof val === 'object' &&
      val !== null &&
      '__type' in val &&
      val.__type === 'Date' &&
      'value' in val
    ) {
      return new Date(val.value as string);
    }
    return val;
  }) as T;
}
