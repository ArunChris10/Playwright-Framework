/**
 * Recursively finds all values for a given key in a deeply nested JSON object,
 * traversing arrays and nested objects fully.
 * 
 * @param obj - The JSON object or array
 * @param targetKey - The key to search for
 * @returns An array of all matched values for the given key
 */
export function findAllValuesByKey(obj: any, targetKey: string): any[] {
  const results: any[] = [];

  function search(current: any) {
    if (current === null || typeof current !== 'object') return;

    if (Array.isArray(current)) {
      for (const item of current) {
        search(item);
      }
    } else {
      for (const [key, value] of Object.entries(current)) {
        if (key.trim() === targetKey.trim()) {
          results.push(value);
        }
        search(value); // Dive deeper
      }
    }
  }

  search(obj);
  return results;
}

export function findRelativeValue(
  responseBody: any,
  whereKey: string,
  equals: any,
  extractKey: string
): any {
  const getValueByPath = (obj: any, path: string): any =>
    path.split('.').reduce((acc, key) => acc?.[key], obj);

  let matchedItem: any;

  // Handle array of objects or a single object
  const items = Array.isArray(responseBody)
    ? responseBody
    : typeof responseBody === 'object'
    ? Object.values(responseBody)
    : [];

  matchedItem = items.find((item: any) => getValueByPath(item, whereKey) === equals);

  if (matchedItem) {
    return getValueByPath(matchedItem, extractKey);
  }

  return undefined;
}

