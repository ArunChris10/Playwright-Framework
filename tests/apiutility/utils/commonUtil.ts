import { expect } from '@playwright/test';
import { globalStore } from '../globalStore';
import { JSONPath } from 'jsonpath-plus';
import {AssertionEntry,ApiTestCase} from '../types/api.types';
import { findAllValuesByKey} from '../utils/jsonUtils';
import fs from 'fs';
import path from 'path';
import { awaitvalidateDriversContainsData as validateDriversContainsData, replaceNodeNames,validateReportWithUFM } from '../helperFunctions/helperFunctions'

import { validateNodesDataWithBQ } from '../helperFunctions/bigQueryHelper';

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

export function validateExtractedValuesContains(actual: any, expected: any, key: string) {
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
      expect(actual).toContain(expected);
    }
  }
}

export async function getPayloadByTestCaseName(testCase: any): Promise<any> {
  let filePathOfPayload;
  testCase.assertions.forEach(assertionArray => {
    if (assertionArray.assertResponse) {
      filePathOfPayload = assertionArray.assertResponse.filePath;
    }
  });

  if (!filePathOfPayload) {
    throw new Error(`No payload file path specified for test case ${testCase.name}`);
  }

  const filePath = path.resolve(__dirname, '../expected-payloads/' + filePathOfPayload);

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

export function deepPartialMatch(
  expected: any,
  actual: any,
  strict: boolean = false
): boolean {
  // Wildcard always matches
  if (expected === '*') {
    return true;
  }

  // Interpolate expected value using globalStore
  expected = interpolate(expected);

  // If types differ (unless expected is '*'), fail
  if (typeof expected !== typeof actual || expected === undefined) return false;

  // If it's an object or array (and not null), handle recursively
  if (typeof expected === 'object' && expected !== null) {

    // --- ARRAY LOGIC ---
    if (Array.isArray(expected) && Array.isArray(actual)) {
      if (!strict) {
        // Original behavior: each expected item must appear somewhere in actual
        return expected.every(expItem =>
          actual.some((actItem: any) => deepPartialMatch(expItem, actItem, strict))
        );
      } else {
        // Strict order: compare each index in sequence
        if (expected.length !== actual.length) return false;
        for (let i = 0; i < expected.length; i++) {
          if (!deepPartialMatch(expected[i], actual[i], strict)) {
            return false;
          }
        }
        return true;
      }
    }

    // --- OBJECT LOGIC ---
    if (!Array.isArray(expected) && !Array.isArray(actual)) {
      if (!strict) {
        // Original behavior: all expected keys must exist in actual
        return Object.keys(expected).every(key =>
          deepPartialMatch(expected[key], actual[key], strict)
        );
      } else {
        // Strict order: compare entries in the exact key order
        const expectedEntries = Object.entries(expected);
        const actualEntries = Object.entries(actual);
        if (expectedEntries.length !== actualEntries.length) return false;
        for (let i = 0; i < expectedEntries.length; i++) {
          const [expKey, expVal] = expectedEntries[i];
          const [actKey, actVal] = actualEntries[i];
          if (interpolate(expKey) !== actKey) {
            return false;
          }
          if (!deepPartialMatch(expVal, actVal, strict)) {
            return false;
          }
        }
        return true;
      }
    }

    // If one is an array and the other isn't, no match
    return false;
  }
  if (expected !== actual) {
    console.log(`Expected: ${expected}, Actual: ${actual}`);
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
  if (typeof value === 'string' && !value.includes("AsObject") &&!value.includes('-roundoff')) {
    return value.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const trimmedKey = key.trim();
      if (globalStore.getValue) {
        return globalStore.getValue?.(trimmedKey) ?? globalStore[trimmedKey] ?? '';
      }
      return globalStore[trimmedKey] ?? '';
    });
  }
  else if (typeof value === 'string' && (value.includes("AsObject") || value.includes('-roundoff}}'))) {
    const fullMatch = value.match(/^{{\s*(.*?)\s*}}$/);
    if (fullMatch) {
      // Whole string is a placeholder, return raw value from globalStore
      const key = fullMatch[1].trim();
      if (globalStore.getValue) {
        return globalStore.getValue(key) ?? globalStore[key];
      }
      return globalStore[key];
    }
  }
  else {
    return value;
  }
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


export async function validateAssertions(response: any, responseBody: any, assertions: any[], testcase: ApiTestCase) {
  for (const arrayOfAssertion of assertions) {
    if ('status' in arrayOfAssertion) {
      const statusCode = arrayOfAssertion.status;
      try {
        expect(response.status()).toEqual(statusCode);
      } catch (err: any) {
        throw new Error(`Assertion failed for status: ${err.message} Responsebody: ${JSON.stringify(responseBody)}`);
      }
    } else {
      for (let i = 0; i <= Object.keys(arrayOfAssertion).length; i++) {
        if (arrayOfAssertion.assertEquals) {
          const keys = Object.keys(arrayOfAssertion.assertEquals);
          for (let index = 0; index < keys.length; index += 2) {
            const jsonPathKey = keys[index];
            const valueKey = keys[index + 1];
            const jsonPath = interpolate(arrayOfAssertion.assertEquals[jsonPathKey]);
            const expectedValue = arrayOfAssertion.assertEquals[valueKey];
            const actualValue = findAllValuesByKey(responseBody, jsonPath);
            try {
              expect(actualValue).toContain(expectedValue);
            } catch (err: any) {
              throw new Error(`Assertion failed for assertEquals at path "${jsonPath}": ${err.message}`);
            }
          }

        } else if (arrayOfAssertion.assertApproxEquals) {
          const jsonPathOrValue = interpolate(arrayOfAssertion.assertApproxEquals.jsonPath);
          let actualValueRaw = findAllValuesByKey(responseBody, jsonPathOrValue);

          // If we found something in the response using jsonPath, use it. Otherwise treat input as a hardcoded value.
          const actualValue = actualValueRaw && actualValueRaw.length > 0
            ? parseFloat(actualValueRaw[0])
            : parseFloat(jsonPathOrValue);

          const expectedValue = parseFloat(interpolate(arrayOfAssertion.assertApproxEquals.expected));
          const acceptedDifference = parseFloat(arrayOfAssertion.assertApproxEquals.acceptedDifference);

          const difference = Math.abs(actualValue - expectedValue);
          try {
            expect(difference).toBeLessThanOrEqual(acceptedDifference);
          } catch (err: any) {
            throw new Error(`Assertion failed for assertApproxEquals: ${err.message}`);
          }

        } else if (arrayOfAssertion.assertNotEquals) {
          const keys = Object.keys(arrayOfAssertion.assertNotEquals);
          for (let index = 0; index < keys.length; index += 2) {
            const jsonPathKey = keys[index];
            const valueKey = keys[index + 1];
            const jsonPath = arrayOfAssertion.assertNotEquals[jsonPathKey];
            const expectedValue = arrayOfAssertion.assertNotEquals[valueKey];
            const actualValue = findAllValuesByKey(responseBody, jsonPath);
            try {
              expect(actualValue).not.toContain(expectedValue);
            } catch (err: any) {
              throw new Error(`Assertion failed for assertNotEquals at path "${jsonPath}": ${err.message}`);
            }
          }

        } else if (arrayOfAssertion.assertNull) {
          const keys = Object.keys(arrayOfAssertion.assertNull);
          for (let index = 0; index < keys.length; index += 2) {
            const jsonPathKey = keys[index];
            const jsonPath = arrayOfAssertion.assertNull[jsonPathKey];
            const actualValue = findAllValuesByKey(responseBody, jsonPath);
            try {
              expect(actualValue).toBeNull();
            } catch (err: any) {
              throw new Error(`Assertion failed for assertNull at path "${jsonPath}": ${err.message}`);
            }
          }

        } else if (arrayOfAssertion.assertNotNull) {
          const keys = Object.keys(arrayOfAssertion.assertNotNull);
          for (let index = 0; index < keys.length; index += 2) {
            const jsonPathKey = keys[index];
            const jsonPath = arrayOfAssertion.assertNotNull[jsonPathKey];
            const actualValue = findAllValuesByKey(responseBody, jsonPath);
            try {
              expect(actualValue).not.toBeNull();
            } catch (err: any) {
              throw new Error(`Assertion failed for assertNotNull at path "${jsonPath}": ${err.message}`);
            }
          }

        } else if (arrayOfAssertion.assertValuesAreEqual) {
          if (arrayOfAssertion.assertValuesAreEqual.length < 2) {
            throw new Error('assertValuesAreEqual requires at least two values.');
          }
          const firstValue = interpolate(arrayOfAssertion.assertValuesAreEqual[0]);
          const firstValueAsNumber = !isNaN(Number(firstValue)) ? parseFloat(firstValue) : null;
          for (let i = 1; i < arrayOfAssertion.assertValuesAreEqual.length; i++) {
            const curValue = interpolate(arrayOfAssertion.assertValuesAreEqual[i]);
            if (firstValueAsNumber) {
              try {
                expect(parseFloat(curValue)).toBeCloseTo(firstValueAsNumber, 3);
              } catch (err) {
                throw new Error(`Assertion failed: Expected "${curValue}" to be close to "${firstValueAsNumber}" (3 decimals).`);
              }
            } else {
              try {
                expect(curValue).toEqual(firstValue);
              } catch (err) {
                throw new Error(`Assertion failed: Expected "${curValue}" to equal "${firstValue}".`);
              }
            }
          }

        } else if (arrayOfAssertion.assertResponse) {
          const selectedPayload = arrayOfAssertion.assertResponse.payload
            ? arrayOfAssertion.assertResponse.payload
            : await getPayloadByTestCaseName(testcase);
          const strict = arrayOfAssertion.assertResponse.strict == true;
          try {
            expect(deepPartialMatch(selectedPayload, responseBody, strict)).toBeTruthy();
          } catch (err: any) {
            throw new Error(`Assertion failed for assertResponse: ${err.message}`);
          }
        } else if (arrayOfAssertion.assertResponseByCalculation) {
          const value1 = parseFloat(interpolate(arrayOfAssertion.assertResponseByCalculation.value1));
          const value2 = parseFloat(interpolate(arrayOfAssertion.assertResponseByCalculation.value2));
          const sign = arrayOfAssertion.assertResponseByCalculation.sign; // Get the operation type
          const expected = parseFloat(interpolate(arrayOfAssertion.assertResponseByCalculation.expected));
          let expectedValue: number;

          // Perform the calculation based on the sign
          switch (sign) {
            case '-':
              expectedValue = value1 - value2;
              break;
            case '+':
              expectedValue = value1 + value2;
              break;
            case '%':
              if (value2 === 0) {
                throw new Error("Division by zero is not allowed for percentage calculation.");
              }
              expectedValue = ((value1 - value2) / value2) * 100;
              break;
            default:
              throw new Error(`Invalid operation type: ${sign}. Supported types are '-', '+', '%'`);
          }

          // const actualValue = parseFloat(interpolate(arrayOfAssertion.assertResponseByCalculation.actualValue));
          const acceptedDifference = parseFloat(arrayOfAssertion.assertResponseByCalculation.acceptedDifference);

          // Calculate the difference and validate
          const difference = Math.abs(expected - expectedValue);
          try {
            expect(difference).toBeLessThanOrEqual(acceptedDifference);
          } catch (err: any) {
            throw new Error(`Assertion failed for assertResponseByCalculation: ${err.message}`);
          }
        } else if(arrayOfAssertion.assertResponseByCalculationForSign) {
          const sign = arrayOfAssertion.assertResponseByCalculationForSign.sign; // Get the operation type
          try {
            expect(sign).toEqual('%');
          } catch (err: any) {
            throw new Error(`Assertion failed for assertResponseByCalculationForSign: ${err.message}`);
          }

        } else if (arrayOfAssertion.assertLength) {
          const jsonPath = interpolate(arrayOfAssertion.assertLength.jsonPath); // Interpolate the JSON path
          const expectedLength = parseFloat(interpolate(arrayOfAssertion.assertLength.expectedLength));
          try {
            expect(jsonPath.length).toEqual(expectedLength); // Validate the length
          } catch (err: any) {
            throw new Error(`Assertion failed for assertLength`);
          }
        }

        const firstKey = Object.keys(arrayOfAssertion)[0];
        delete arrayOfAssertion[firstKey];
        i = 0;
      }
    }
  }
}


export function getRandomFutureDateTimeWithOffset(daysFromNow: number, hoursOffset: number = 0): string {
  const now = new Date();


  now.setHours(2, 0, 0, 0); // 1 AM, 0 minutes, 0 seconds, 0 milliseconds


  // Add random number of days
  const randomDays = Math.floor(Math.random() * daysFromNow) + 1;
  now.setDate(now.getDate() + randomDays);

  // Add optional hours
  now.setHours(now.getHours() + hoursOffset);

  // Format components
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  let hours = now.getHours() % 12 || 12; // Convert to 12-hour format
  const formattedHours = hours.toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${formattedHours}:${minutes}`;
}
export function getRandomFutureDateTimeWithOffsetISOFormat(deadlineDate: string): string {
  const input = deadlineDate;
  const formatted = input.replace(" ", "T") + ":00";
  console.log(formatted); // "2025-05-21T11:14:00"
  return formatted;
}

export async function clearGlobalStoreFile() {
  const STORE_FILE = path.resolve(__dirname, '../.globalStore.json');
  if (fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, '{}', 'utf-8');
    console.log('Cleared .globalStore.json after all tests.');
  }
}

export function getCurrentDateWithHour(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Ensure 2-digit month
  const day = now.getDate().toString().padStart(2, '0'); // Ensure 2-digit day
  const hour = now.getHours().toString().padStart(2, '0'); // Ensure 2-digit hour
  return `${year}-${month}-${day}T${hour}`; // Return the date-time in the desired format
}

export async function runFunctions(functionName: string, params: any, payload?) {
  switch (functionName) {
    case 'validateDriversContainsData':
      await validateDriversContainsData(payload);
      break;
    case 'replaceNodeNames':
      let param1 = interpolate(params[0][0])
      let param2 = interpolate(params[0][1])
      await replaceNodeNames(param1, param2,false);
      break;
    case 'validateReportWithUFM':
      let reportNodesDataAsObject = interpolate(params[0][0])
      let UfmDataAsObject = interpolate(params[0][1])
      await validateReportWithUFM(reportNodesDataAsObject, UfmDataAsObject)
      break;
    default:
      throw new Error(`Function "${functionName}" is not recognized.`);
  }
}

