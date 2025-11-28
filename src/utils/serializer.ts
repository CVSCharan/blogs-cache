/**
 * Serialize value to JSON string with Date handling
 * @param value Value to serialize
 * @returns JSON string
 */
export function serialize(value: unknown): string {
  // Helper function to recursively convert Dates to wrapped objects
  const convertDates = (obj: unknown): unknown => {
    if (obj instanceof Date) {
      return { __type: 'Date', value: obj.toISOString() };
    }
    if (Array.isArray(obj)) {
      return obj.map(convertDates);
    }
    if (obj !== null && typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(obj)) {
        result[key] = convertDates(val);
      }
      return result;
    }
    return obj;
  };

  return JSON.stringify(convertDates(value));
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
