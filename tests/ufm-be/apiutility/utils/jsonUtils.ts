import fs from 'fs';
import path from 'path';

/**
 * Recursively finds all values for a given key in a deeply nested JSON object,
 * traversing arrays and nested objects fully.
 * 
 * @param obj - The JSON object or array
 * @param targetKey - The key to search for
 * @returns An array of all matched values for the given key
 */
export function findAllValuesByKey(obj: any, path: string): any[] {
  const results: any[] = [];
  const pathSegments = path.split(".");

  function traverse(current: any, remainingPath: string[]) {
    if (remainingPath.length === 0) {
      results.push(current);
      return;
    }

    const [key, ...restPath] = remainingPath;

    if (Array.isArray(current)) {
      for (const item of current) {
        traverse(item, remainingPath); // don't consume key yet, we are still at array level
      }
    } else if (current && typeof current === "object" && key in current) {
      traverse(current[key], restPath);
    }
  }

  traverse(obj, pathSegments);
  return results;
}

export function findFirstValuesByKey(obj: any, path: string): any[] {
  const results: any[] = [];
  const pathSegments = path.split(".");

  function traverse(current: any, remainingPath: string[]) {
    if (remainingPath.length === 0) {
      results.push(current);
      return;
    }

    const [key, ...restPath] = remainingPath;

    if (Array.isArray(current)) {
      for (const item of current) {
        traverse(item, remainingPath); // don't consume key yet, we are still at array level
      }
    } else if (current && typeof current === "object" && key in current) {
      traverse(current[key], restPath);
    }
  }

  traverse(obj, pathSegments);
  return results.length > 0 ? results[0] : results;
}
export function loadJSON<T>(filePath: string): T {
  const data =  fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
  return JSON.parse(data);
}

export function getNestedValue(obj: any, path: string,equals:string): any {
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

  console.warn(`No match found for whereKey: "${whereKey}" == "${equals}"`);
  return undefined;
}










