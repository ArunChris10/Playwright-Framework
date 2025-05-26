import fs from 'fs';
import path from 'path';
import {interpolate} from '../utils/commonUtil'
import { expect } from 'playwright/test';
import { equal } from 'assert';

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

export function findFirstValueByKey(obj: any, path: string): string[] {
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
  return results.length > 0 ? results[0].toString() : results;
}
export function loadJSON<T>(filePath: string): T {
  const data =  fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
  return JSON.parse(data);
}

export function getNestedValue(obj: any, path: string, equals: any): any {
  let keys = path.split('.');
  let current = obj;
 
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;


    if (Array.isArray(current)) {
      // Search through array of objects for a match on key === equals
      let foundItem = undefined;
      for (const item of current) {
        if (item && item[key] != null && item[key] == equals) {
          foundItem = item[key];
          break;
        }
        else if (item && item[key] != null) {
          let updatedItem = item[key];
          keys = keys.filter(item => item !== key);    ;
          foundItem = getNestedValue(updatedItem, keys[0], equals);
          if (foundItem !== undefined) break;
        }
      }

      current = foundItem;
    } else if (typeof current === 'string' || Number(current)) {
      break;
    } else if (typeof current === 'object') {
      current = current[key];

    } else {
      return undefined;
    }
    keys = keys.filter(item => item !== key);
    
  }
 
  return current;
}


export function findRelativeValue(
  data: any,
  whereKey: string,
  equals: any,
  extractKey: string
): any {
  const stack: any[] = Array.isArray(data) ? [...data] : [data];
  while (stack.length) {
    const current = stack.pop();
 
    if (typeof current === 'object' && current !== null) {
      const whereValue = getNestedValue(current, whereKey,equals);
      
      if (whereValue === equals) {
        const extractedValue = getNestedValue(current, extractKey,equals);
        console.log(`MATCHED. Extracting '${extractKey}': ${extractedValue}`);
        return extractedValue;
      }
      // Traverse nested objects
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

export function getNestedValueMultiCondition(obj: any, path: string): any {
  const keys = path.split('.');

  function resolve(current: any, keyIndex: number): any {
    if (current === undefined || current === null) return undefined;

    if (keyIndex >= keys.length) return current;

    const key = keys[keyIndex];

    if (Array.isArray(current)) {
      // Try to resolve recursively through each item in the array
      for (const item of current) {
        const result = resolve(item, keyIndex);
        if (result !== undefined) return result;
      }
      return undefined;
    }

    if (typeof current === 'object') {
      return resolve(current[key], keyIndex + 1);
    }

    return undefined;
  }

  return resolve(obj, 0);
}


/* export function findRelativeValueMultiCondition(
  data: any,
  conditions: { path: string; equals: any }[],
  extractKey: string
): any {
  const stack: any[] = Array.isArray(data) ? [...data] : [data];

  while (stack.length) {
    const current = stack.pop();

    if (typeof current === 'object' && current !== null) {
      // Check if all conditions match
      const allMatch = conditions.every(cond => {
        const value = getNestedValueMultiCondition(current, cond.path);
        return value === cond.equals;
      });

      if (allMatch) {
        const extractedValue = getNestedValueMultiCondition(current, extractKey);
        console.log(`MATCHED ALL CONDITIONS. Extracting '${extractKey}': ${extractedValue}`);
        return extractedValue;
      }

      // Traverse nested objects
      for (const key in current) {
        if (typeof current[key] === 'object') {
          stack.push(current[key]);
        }
      }
    }
  }

  console.warn(`No match found for all conditions`);
  return undefined;
} */
export interface MatchedNode {
  value: any;
  parent: any;
  key: string;
  fullPath: string;
}

export function findRelativeValueMultiCondition(
  data: any,
  conditions: { path: string; equals: any }[],
  extractKey: string
): any {
  const stack: { node: any; path: string }[] = [{ node: data, path: '' }];

  while (stack.length > 0) {
    const { node, path } = stack.pop()!;

    if (typeof node === 'object' && node !== null) {
      // Check if all conditions match in this subtree
      const matches = conditions.map(cond => getNestedValueFromRoot(node, cond.path));
      const allMatch = matches.every(m => m && m.value === conditions[matches.indexOf(m)].equals);

      if (allMatch) {
        // Get the object where all conditions matched — use first matched parent (or refine this logic as needed)
        const matchNode = matches[0];
        const extractFrom = matchNode?.parent ?? node;
        const extract = getNestedValueFromRoot(extractFrom, extractKey);

        if (extract) {
          console.log(`Matched at path: "${path}", Extracted: ${extract.value}`);
          return extract.value;
        }
      }

      // Traverse deeper
      for (const key in node) {
        if (typeof node[key] === 'object') {
          const childPath = path ? `${path}.${key}` : key;
          stack.push({ node: node[key], path: childPath });
        }
      }
    }
  }

  console.warn(`No match found for conditions`);
  return undefined;
}




export function getNestedValueFromRoot(obj: any, path: string): MatchedNode | undefined {
  const keys = path.split('.');
  let current = obj;
  let parent: any = null;
  let fullPath = '';
  
  for (let i = 0; i < keys.length; i++) {
    if (current === undefined || current === null) return undefined;

    const key = keys[i];
    fullPath = fullPath ? `${fullPath}.${key}` : key;

    // Handle array with numeric index
    if (Array.isArray(current)) {
      if (!isNaN(Number(key))) {
        parent = current;
        current = current[Number(key)];
      } else {
        for (const item of current) {
          const result = getNestedValueFromRoot(item, keys.slice(i).join('.'));
          if (result) return result;
        }
        return undefined;
      }
    } else if (typeof current === 'object') {
      parent = current;
      current = current[key];
    } else {
      return undefined;
    }
  }

  return { value: current, parent, key: keys[keys.length - 1], fullPath };
}
















