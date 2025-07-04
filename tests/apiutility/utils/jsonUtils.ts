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

  // Special case: "$" means return the entire object
  if (path === "$") {
    results.push(obj);
    return results;
  }

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


export function findNthValueByKey(obj: any, path: string, n: number): string | undefined {
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
  return results.length >= n ? results[n - 1]?.toString() : undefined;
}

export function findFirstValueByKeyObject(obj: any, path: string): any[] {
  const results: any[] = [];
  const pathSegments = path.split(".");

  function traverse(current: any, remainingPath: string[]) {
    if (remainingPath.length === 0) {
      if (Array.isArray(current)) {
        results.push(...current); // Flatten array contents
      } else {
        results.push(current);
      }
      return;
    }

    const [key, ...restPath] = remainingPath;

    if (Array.isArray(current)) {
      for (const item of current) {
        traverse(item, remainingPath); // still at array level
      }
    } else if (current && typeof current === "object" && key in current) {
      traverse(current[key], restPath);
    }
  }

  traverse(obj, pathSegments);
  return results;
}


export function loadJSON<T>(filePath: string): T {
  const data =  fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
  return JSON.parse(data);
}

export function getNestedValue(
  obj: any,
  path: string,
  equals: any,
  referenceWhereKey?: string,
  isExtract?: boolean
): { value: any; lastKey: string } {
  let keys = path.split('.');
  let current = obj;
  let lastKey = "";

  for (const key of keys) {
    if (current === undefined || current === null) return { value: undefined, lastKey };

    if (Array.isArray(current)) {
      // Search through array of objects for a match on key === equals
      let foundItem = undefined;
      for (const item of current) {
        if (!isExtract) {
          if (item && item[key] != null && item[key] == equals) {
            foundItem = item[key];
            lastKey = key;
            break;
          }
        } else if (isExtract) {
          if (referenceWhereKey !== undefined && item && item[referenceWhereKey] == equals) {
            foundItem = item[key];
            lastKey = key;
            break;
          }
        }
      }
      current = foundItem;
    } else if (typeof current === 'string' || Number(current)) {
      break;
    } else if (typeof current === 'object') {
      current = current[key];
      lastKey = key;
    } else {
      return { value: undefined, lastKey };
    }
    keys = keys.filter(item => item !== key);
  }

  return { value: current, lastKey };
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
      const { value, lastKey } = getNestedValue(current, whereKey, equals);
      
      if (value === equals) {
        const { value, lastKey: extractedKey } = getNestedValue(current, extractKey, equals, lastKey, true);
        console.log(`MATCHED. Extracting '${extractKey}': ${value}`);
        return value;
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

//old Implementation of findRelativeValueMultiCondition
/* export function findRelativeValueMultiCondition(
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
} */

  export function findRelativeValueMultiCondition(data: any, conditions: { path: string; equals: any }[], extractKey: string): any {
  let consumedKeys;
  let matchedResponse: any[] = [];
  let dataMatched = false;
  for (const condition of conditions) {
    const { path, equals } = condition;
    const fullPathParsedKey = path.split(/\./);
    for (const curParsedKey of fullPathParsedKey){
        if (data[curParsedKey] != undefined){
            data = data[curParsedKey];
        }
        else if (Array.isArray(data)){
          for (const curRow of data){
              if (curRow[curParsedKey] == equals){
                matchedResponse.push(curRow);
                dataMatched = true;
              }
              else if (typeof curRow[curParsedKey] === 'object' ){
                const nextKeyIndex = fullPathParsedKey.indexOf(curParsedKey) + 1;
                const nextKey = fullPathParsedKey[nextKeyIndex];
                matchedResponse.push({
                   ...(nextKey !== undefined && curRow[curParsedKey] && typeof curRow[curParsedKey] === 'object'
                  ? { [nextKey]: curRow[curParsedKey][nextKey] }
                  : {}),
                  parent: curRow
                });
                dataMatched = true;
              }
          }
          if (dataMatched){
          data = matchedResponse.slice();
          dataMatched=false;
          matchedResponse.length=0
          }
        }
    }
  }

  // Fix: If no match found or data is not an array, extract directly from root using extractKey
  if (!Array.isArray(data) || data.length === 0 || data[0] === undefined) {
    // Support dot notation in extractKey
    const keys = extractKey.split('.');
    let value = data;
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  }

  if (data[0].parent){
  return data[0].parent[extractKey]
  }
  else{
  return data[0]
  }
}

/**
 * Finds a value in a nested object/array where a key (can be dot notation) matches a value,
 * and extracts another value (can be dot notation) from the same object.
 * @param data The data to search.
 * @param whereKey The key (dot notation allowed) to match.
 * @param equals The value to match.
 * @param extractKey The key (dot notation allowed) to extract.
 * @returns The extracted value, or undefined if not found.
 */
export function findRelativeFlexibleValue(
  data: any,
  whereKey: string,
  equals: any,
  extractKey: string
): any {
  // Helper to get nested value by dot notation
  function getNested(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  // Stack-based DFS for arrays/objects
  const stack = [data];
  while (stack.length) {
    const node = stack.pop();
    if (Array.isArray(node)) {
      stack.push(...node);
    } else if (node && typeof node === 'object') {
      if (getNested(node, whereKey) === equals) {
        return getNested(node, extractKey);
      }
      Object.values(node).forEach(child => {
        if (typeof child === 'object' && child !== null) stack.push(child);
      });
    }
  }
  return undefined;
}

/* /****
 * Finds the value of a nested property in an object within an array of objects, 
 * where another property matches a given value.
 * 
 * @param data - The complete ResponseBody (can be deeply nested)
 * @param matchKey - The key to match on (e.g., "driver")
 * @param matchValue - The value to match (e.g., "grossgmv")
 * @param extractPath - The dot-separated path to extract (e.g., "202605.forecast")
 * @returns The extracted value, or undefined if not found
 */
/* export function findRelativeNestedValue(
  data: any,
  matchKey: string,
  matchValue: any,
  extractPath: string
): any {
  // Recursively search for an array of objects containing matchKey
  function search(node: any): any {
    if (Array.isArray(node)) {
      for (const item of node) {
        if (item && typeof item === 'object' && matchKey in item && item[matchKey] === matchValue) {
          // Found the matching object, extract value by extractPath
          let current = item;
          for (const key of extractPath.split('.')) {
            if (current == null) return undefined;
            current = current[key];
          }
          return current;
        }
        // Recurse into array elements
        const found = search(item);
        if (found !== undefined) return found;
      }
    } else if (node && typeof node === 'object') {
      for (const key in node) {
        const found = search(node[key]);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  }
  return search(data);
}  */


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

















