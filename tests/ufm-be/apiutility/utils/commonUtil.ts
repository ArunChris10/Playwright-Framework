import { expect } from '@playwright/test';
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

  export function interpolateHeaders(value: any): any {
    if (typeof value === 'string') {
      return value.replace(/\{\{(.*?)\}\}/g, (_, key) => globalStore[key.trim()] ?? '');
    }
    return value;
  }

  export function interpolate(value: any): any {
    if (typeof value === 'string') {
      return value.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        const trimmedKey = key.trim();
        if (globalStore.getValue) {
          return globalStore.getValue(trimmedKey) ?? '';
        }
        return globalStore[trimmedKey] ?? '';
      });
    }
    return value;
  }
  
  export function interpolateObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
  
    const interpolated: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      const val = obj[key];
      const interpolatedKey = interpolate(key);
      const interpolatedVal = typeof val === 'object' ? interpolateObject(val) : interpolate(val);
      interpolated[interpolatedKey] = interpolatedVal;
    }
    return interpolated;
  }

  export function interpolateHeadersObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
  
    const interpolated: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      const val = obj[key];
      interpolated[key] = typeof val === 'object' ? interpolateHeadersObject(val) : interpolateHeaders(val);
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

              const keys = Object.keys(arrayOfAssertion.assertEquals);
              for (let index = 0; index < keys.length; index += 2) {
                const jsonPathKey = keys[index];
                const valueKey = keys[index + 1];
                let jsonPath = interpolate(arrayOfAssertion.assertEquals[jsonPathKey]);
                const expectedValue = arrayOfAssertion.assertEquals[valueKey];
                const actualValue = findAllValuesByKey(responseBody, jsonPath);
                expect(actualValue).toContain(expectedValue); // Assert the equality
              }

            } else if (arrayOfAssertion.assertNotEquals) {
              const keys = Object.keys(arrayOfAssertion.assertNotEquals);
              for (let index = 0; index < keys.length; index += 2) {
                const jsonPathKey = keys[index];
                const valueKey = keys[index + 1];
        
                const jsonPath = arrayOfAssertion.assertNotEquals[jsonPathKey];
                const expectedValue = arrayOfAssertion.assertNotEquals[valueKey];
                const actualValue = findAllValuesByKey(responseBody, jsonPath);
                expect(actualValue).not.toContain(expectedValue); // Assert the equality
              }

            } else if (arrayOfAssertion.assertNull) {
              // Handle assertNull
              const keys = Object.keys(arrayOfAssertion.assertNull);
              for (let index = 0; index < keys.length; index += 2) {
                const jsonPathKey = keys[index];
        
                const jsonPath = arrayOfAssertion.assertNull[jsonPathKey];
                const actualValue = findAllValuesByKey(responseBody, jsonPath);
                expect(actualValue).toBeNull(); // Assert the equality
              }

            } else if (arrayOfAssertion.assertNotNull) {
              // Handle assertNotNull
              const keys = Object.keys(arrayOfAssertion.assertNotNull);
              for (let index = 0; index < keys.length; index += 2) {
                const jsonPathKey = keys[index];
       
                const jsonPath = arrayOfAssertion.assertNotNull[jsonPathKey];
                const actualValue = findAllValuesByKey(responseBody, jsonPath);
                expect(actualValue).not.toBeNull(); // Assert the equality
              }

            } else if (arrayOfAssertion.assertValuesAreEqual) {
              // Handle assertValuesAreEqual
              if (arrayOfAssertion.assertValuesAreEqual.length < 2) {
                throw new Error('assertValuesAreEqual requires at least two values.');
              }              
              const firstValue = interpolate(arrayOfAssertion.assertValuesAreEqual[0]);
              for (let i = 1; i < arrayOfAssertion.assertValuesAreEqual.length; i++) {
                const curValue = interpolate(arrayOfAssertion.assertValuesAreEqual[i]);
                  expect(curValue).toEqual(firstValue);
              }
              }
            
            else if (arrayOfAssertion.assertResponse) {
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

  export function getRandomFutureDateTimeWithOffset(daysFromNow: number, hoursOffset: number = 0): string {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * daysFromNow) + 1; // Random number of days within the range
    now.setDate(now.getDate() + randomDays); // Add random days to the current date
    now.setHours(now.getHours() + hoursOffset); // Add the specified hours offset
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
    const day = now.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
    const hours = now.getHours().toString().padStart(2, '0'); // Ensure 2-digit hour
    const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure 2-digit minute
    return `${year}-${month}-${day} ${hours}:${minutes}`; // Return the date-time in the desired format
  }