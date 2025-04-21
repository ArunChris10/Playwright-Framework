import { expect } from '@playwright/test';
import * as payloads from '../expected-payloads/payloads'
import { globalStore } from '../globalStore';

export function generateRandomNumber(length: number): number {
    if (length <= 0) {
      throw new Error("Length must be a positive integer.");
    }
  
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export function validateExtractedValues(actual: any, expected: any, key: string) {
    if (Array.isArray(expected)) {
      if (Array.isArray(actual)) {
        const allPresent = expected.every(exp => actual.includes(exp));
        expect(allPresent).toBeTruthy(); // all expected items must exist in actual
      } else {
        throw new Error(`Expected array from extract for key "${key}", but got a non-array.`);
      }
    } else {
      if (Array.isArray(actual)) {
        expect(actual).toContain(expected);
      } else {
        expect(actual).toEqual(expected);
      }
    }
  }

  export function getPayloadByTestCaseName(name: string) {
    return (payloads as Record<string, unknown>)[name];
  }
  
  export function deepPartialMatch(expected: any, actual: any): boolean {
    if (typeof expected !== typeof actual) return false;
  
    if (typeof expected === 'object' && expected !== null) {
      if (Array.isArray(expected)) {
        // Check if every item in expected array is in actual array (deeply)
        return expected.every(expItem =>
          actual.some((actItem: any) => deepPartialMatch(expItem, actItem))
        );
      } else {
        // Check all expected keys exist in actual and match
        return Object.keys(expected).every(key =>
          deepPartialMatch(expected[key], actual[key])
        );
      }
    }
  
    // Primitive comparison (string, number, etc.)
    return expected === actual;
  }

  export function interpolate(value: any): any {
    if (typeof value === 'string') {
      return value.replace(/\{\{(.*?)\}\}/g, (_, key) => globalStore[key.trim()] ?? '');
    }
    return value;
  }
  
  export function interpolateObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
  
    const interpolated: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      const val = obj[key];
      interpolated[key] = typeof val === 'object' ? interpolateObject(val) : interpolate(val);
    }
    return interpolated;
  }