import fs from 'fs';
import path from 'path';
import {interpolate} from '../utils/commonUtil'
import { expect } from 'playwright/test';
import { get } from 'http';
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
  const keys = path.split('.');
  let current = obj;
 
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
 
    if (Array.isArray(current)) {
      // Search through array of objects for a match on key === equals
      let foundItem = undefined;
      for (const item of current) {
        if (item && item[key] != null && item[key] == equals) {
          foundItem = item;
          break;
        }
        else if(item[key]!=null)
        {
          getNestedValue(item[key],key,equals)
        }
      }
      if (!foundItem) return undefined;
      current = foundItem;
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









