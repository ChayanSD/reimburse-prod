export function safeJsonParse<T>(value: any, defaultValue: T): T {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'object') {
    return value as T;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error("Failed to parse JSON string:", value, e);
      return defaultValue;
    }
  }

  return defaultValue;
}
