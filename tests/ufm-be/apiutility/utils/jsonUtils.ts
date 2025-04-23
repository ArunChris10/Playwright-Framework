import { equal } from "assert";

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

function getNestedValue(obj: any, path: string,equals:string): any {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!current) return undefined;

    if (Array.isArray(current)) {
      // Search through array of objects
      let found = undefined;
      let foundResponse = undefined;
      for (const item of current) {
        if (item && key in item) {
          if ( item[key] == equals){
            found = item[key];
            foundResponse = item;
            break;
          }

        }
      }
      current = foundResponse;
    } else if (typeof current === 'object') {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current;
}

export function findRelativeValue(
  data: any,
  whereKey: string,
  equals: any,
  extractKey: string
): any {
  const stack: any[] = [data];

  while (stack.length) {
    const current = stack.pop();

    if (typeof current === 'object' && current !== null) {
      const whereValue = getNestedValue(current, whereKey,equals);
      console.log(`Checking object:\n${JSON.stringify(current, null, 2)}`);
      console.log(`whereKey: "${whereKey}", value: "${whereValue}", expected: "${equals}"`);
      
      const hasValue = Object.values(whereValue).includes(equals);
      if (hasValue) {
        const extractedValue = getNestedValue(whereValue, extractKey,equals);
        console.log(`MATCHED. Extracting '${extractKey}': ${extractedValue}`);
        return extractedValue;
      }

      // Traverse nested structures
      for (const key in current) {
        if (typeof current[key] === 'object') {
          stack.push(current[key]);
        }
      }
    }
  }

  console.warn(`❌ No match found for whereKey: "${whereKey}" == "${equals}"`);
  return undefined;
}










