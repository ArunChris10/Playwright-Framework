import { expect } from '@playwright/test';
import * as payloads from '../expected-payloads/payloads'
import { globalStore } from '../globalStore';
import { JSONPath } from 'jsonpath-plus';
import {AssertionEntry,ApiTestCase} from '../api.test';
import { findAllValuesByKey} from '../utils/jsonUtils';
import fs from 'fs';
import path from 'path';

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
        expect(allPresent).toBeTruthy();
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

  export async function getPayloadByTestCaseName(testCase: any): Promise<any> {
let filePathOfPayload;
    testCase.assertion.forEach(assertionArray => {
      if (assertionArray.assertResponse) {
       filePathOfPayload = assertionArray.assertResponse.filePath;
      } });

    if (!filePathOfPayload) {
      throw new Error(`No payload file path specified for test case ${testCase.name}`);
    }
  
    const filePath = path.resolve(__dirname, '../expected-payloads/'+filePathOfPayload);
  
    if (!fs.existsSync(filePath)) {
      throw new Error(`Payload file not found at path: ${filePath}`);
    }
  
    const fileContent = fs.readFileSync(filePath, 'utf-8');
  
    try {
      return JSON.parse(fileContent);
    } catch (err) {
      throw new Error(`Failed to parse JSON in payload file ${filePath}: ${err}`);
    }
  }
  
  
  export function deepPartialMatch(expected: any, actual: any): boolean {
    if (typeof expected !== typeof actual || expected == undefined) return false;
  
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



  export function validateAssertions(response:any,responseBody: any, assertions: any[], testcase: ApiTestCase) {
    assertions.forEach((assertion) => {
      assertion.forEach(async arrayOfAssertion  => {
        if ('status' in arrayOfAssertion) {
            // Handle status assertion
            const statusCode = arrayOfAssertion.status;
            expect(response.status()).toEqual(statusCode); // Example: Check status code
        }
        else{
          
          for (let i =0; i <= Object.keys(arrayOfAssertion).length; i++){

            if (arrayOfAssertion.assertEquals) {
              // Handle assertEquals
              const { jsonPath, value } = arrayOfAssertion.assertEquals;
              const actualValue = findAllValuesByKey(responseBody, jsonPath); // A helper function to fetch value using jsonPath
              expect(actualValue).toContain(value); // Assert the equality

            } else if (arrayOfAssertion.assertNotEquals) {
              // Handle assertNotEquals
              const { jsonPath, value } = arrayOfAssertion.assertNotEquals;
              const actualValue = findAllValuesByKey(responseBody, jsonPath);
              expect(actualValue).not.toContain(value); // Assert the inequality

            } else if (arrayOfAssertion.assertNull) {
              // Handle assertNull
              const { jsonPath, value } = arrayOfAssertion.assertNull;
              const actualValue = findAllValuesByKey(responseBody, jsonPath);
              expect(actualValue).toBeNull(); // Assert the value is null

            } else if (arrayOfAssertion.assertNotNull) {
              // Handle assertNotNull
              const { jsonPath, value } = arrayOfAssertion.assertNotNull;
              const actualValue = findAllValuesByKey(responseBody, jsonPath);
              expect(actualValue).not.toBeNull(); // Assert the value is not null
            
            } else if (arrayOfAssertion.assertResponse) {
              // Handle assertNotNull
              const selectedPayload = await getPayloadByTestCaseName(testcase);
              let ismatch = deepPartialMatch(selectedPayload, responseBody);
              expect(ismatch).toBeTruthy();
            }
            const firstKey = Object.keys(arrayOfAssertion)[0];
            delete arrayOfAssertion[firstKey];
            i=0;
          }          
        }         
      });     
    });
  }