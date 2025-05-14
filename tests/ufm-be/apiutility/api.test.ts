import { test, expect, request, APIRequestContext } from '@playwright/test';
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import { findAllValuesByKey, findRelativeValue, loadJSON, findFirstValueByKey } from '../apiutility/utils/jsonUtils';
import { validateStatus, validateBody } from '../apiutility/utils/responseValidator';
import { executeRequest } from '../apiutility/utils/requestExecutor';
import {
  clearGlobalStoreFile,
  getRandomFutureDateTimeWithOffset,
  interpolateHeadersObject,
  validateExtractedValues,
  generateRandomNumber,
  getPayloadByTestCaseName,
  deepPartialMatch,
  interpolateObject,
  interpolate,
  validateAssertions
} from '../apiutility/utils/commonUtil';
import { pollForExpectedResponse } from '../apiutility/utils/pollingMechanism';
import nexusTokens from "../../../secrets/nexus-users-token.json";

export interface ApiTestCase {
  environment: string;
  service: string;
  testName: string;
  uri: string;
  queryParams: string;
  method: string;
  payload?: any;
  assertion?: AssertionEntry;
  extract?: { [key: string]: string };
  extractFirst?: { [key: string]: string };
  validateExtract?: { [key: string]: string };
  polling?: {
    key: string;
    expectedValue: any;
    intervalMs: number;
    timeoutMs: number;
  };
  extractRelative?: {
    [globalVar: string]: {
      whereKey: string;
      equals: any;
      extractKey: string;
    };
  };
}

export type AssertionEntry =
  | { status: number }
  | { assertEquals: { [key: string]: string | number } }
  | { assertNotEquals: { [key: string]: string | number } }
  | { assertNull: { [key: string]: string } }
  | { assertNotNull: { [key: string]: string } }
  | { assertResponse: { filePath: string, value: any } }
  | { assertValuesAreEqual: (string | number)[] };

export interface ParentConfig {
  headers: { [key: string]: string };
  user: string;
  testFiles: string[];
  coreService: { baseURL: { [key: string]: string }, testCaseName: string };
  notificationService: { baseURL: { [key: string]: string }, testCaseName: string };
  reportingService: { baseURL: { [key: string]: string }, testCaseName: string };
  nexusService: { baseURL: { [key: string]: string }, testCaseName: string };
}

export let response;
const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));
const tagsToRun = (parentConfig as any).tagsToRun || [];

function populateGlobalStore() {
  globalStore["token"] = `Bearer ${nexusTokens[parentConfig.user + ""]}`;
}
populateGlobalStore();

parentConfig.testFiles.forEach(testCasePath => {
  const testCase = loadJSON<ApiTestCase[] | ApiTestCase>(path.resolve(__dirname, testCasePath));
  const normalizedCases = Array.isArray(testCase) ? testCase : [testCase];

  let requestContext: APIRequestContext | null = null;

  normalizedCases.forEach(testCase => {
    let baseUrl;
    if (testCase.service === "coreService") {
      baseUrl = parentConfig.coreService.baseURL[testCase.environment];
    } else if (testCase.service === "notificationService") {
      baseUrl = parentConfig.notificationService.baseURL[testCase.environment];
    } else if (testCase.service === "reportingService") {
      baseUrl = parentConfig.reportingService.baseURL[testCase.environment];
    } else if (testCase.service === "nexusService") {
      baseUrl = parentConfig.nexusService.baseURL[testCase.environment];
    }

    const interpolatedHeader = interpolateHeadersObject(parentConfig.headers);
    const caseLabels = (testCase as any).labels || [];

    const isIncluded = tagsToRun.length === 0 || caseLabels
      .map((l: string) => l.toLowerCase())
      .some(label => tagsToRun.map(tag => tag.toLowerCase()).includes(label));

    if (!isIncluded) {
      console.log(`Skipping test "${testCase.testName}" due to tag filtering`);
      return;
    }

    test(testCase.testName, async () => {
      console.log("================================================================================");
      console.log(`STARTING TEST: ${testCase.testName}`);
      console.log(`Labels: ${caseLabels.join(", ")}`);
      console.log(`Environment: ${testCase.environment}`);
      console.log(`Service: ${testCase.service}`);
      console.log("================================================================================");

      const resolvedBaseUrl = baseUrl + parentConfig[testCase.service][testCase.uri] + interpolate(testCase.queryParams);
      console.log(`Resolved URL: ${resolvedBaseUrl}`);

      requestContext = await request.newContext({
        baseURL: resolvedBaseUrl,
        extraHTTPHeaders: interpolatedHeader,
        ignoreHTTPSErrors: true,
      });

      const endpoint = "";
      let responseBody = null;
      let payload = await postProcessInterpolatedPayload(testCase.payload);
      payload = interpolateObject(payload);

      console.log("Request Payload:");
      console.log(JSON.stringify(payload, null, 2));

      response = await executeRequest(testCase.method, requestContext, endpoint, payload);

      console.log(`Response Status: ${response.status()}`);
      if (response.status() !== 204) {
        responseBody = await response.json();
        console.log("Response Body:");
        console.log(JSON.stringify(responseBody, null, 2));
      }

      if (testCase.extract) {
        console.log("Extracting values from response:");
        for (const globalVar in testCase.extract) {
          const value = findAllValuesByKey(responseBody, testCase.extract[globalVar].replace(/^body\./, ''));
          if (!value || value.length === 0) {
            throw new Error(`Key ${testCase.extract[globalVar]} not found in response body`);
          }
          globalStore.setValue(globalVar, value);
          console.log(`Extracted ${globalVar}: ${JSON.stringify(value)}`);
        }
      }

      if (testCase.extractFirst) {
        console.log("Extracting first matching values:");
        for (const globalVar in testCase.extractFirst) {
          const value = findFirstValueByKey(responseBody, testCase.extractFirst[globalVar].replace(/^body\./, ''));
          if (!value) {
            throw new Error(`Key ${testCase.extractFirst[globalVar]} not found in response body`);
          }
          globalStore.setValue(globalVar, value);
          console.log(`Extracted ${globalVar}: ${JSON.stringify(value)}`);
        }
      }

      if (testCase.extractRelative) {
        console.log("Extracting relative values:");
        for (const globalVar in testCase.extractRelative) {
          const { whereKey, equals, extractKey } = testCase.extractRelative[globalVar];
          const value = findRelativeValue(responseBody, whereKey, equals, extractKey);
          if (value !== undefined) {
            globalStore.setValue(globalVar, value);
            console.log(`Extracted ${globalVar}: ${JSON.stringify(value)}`);
          } else {
            throw new Error(`Could not find relative value where "${whereKey}" == "${equals}" to extract "${extractKey}"`);
          }
        }
      }

      if (testCase.validateExtract) {
        console.log("Validating extracted values:");
        for (const globalKey in testCase.validateExtract) {
          const expected = interpolate(testCase.validateExtract[globalKey]);
          const actual = globalStore[globalKey];
          await validateExtractedValues(actual, expected, globalKey);
          console.log(`Validated ${globalKey}: actual = ${actual}, expected = ${expected}`);
        }
      }

      if (testCase.assertion) {
        console.log("Running assertions:");
        await validateAssertions(response, responseBody, [testCase.assertion], testCase);
        console.log("Assertions passed");
      }

      console.log(`ENDING TEST: ${testCase.testName}`);
      console.log("================================================================================\n");
    });
  });
});

function postProcessInterpolatedPayload(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;

  const processed = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    const value = obj[key];

    if (key.includes('scenario_id') || key.includes('scenario_version') || key.includes('"scenario_version_timestamp"')) {
      const rawValue = globalStore.getValue(value.replace('{{', '').replace('}}', ''));
      const numericValue = Number(rawValue);
      processed[key] = isNaN(numericValue) ? rawValue : numericValue;
    } else if (Array.isArray(value)) {
      processed[key] = value.map(item => {
        if (typeof item === 'string' && item.includes("scenario_id")) {
          const match = item.match(/\{\{(.*?)\}\}/);
          if (match) {
            const variableKey = match[1].trim();
            return globalStore.getValue(variableKey);
          }
        }
        return item;
      });
    } else if (typeof value === 'object') {
      processed[key] = postProcessInterpolatedPayload(value);
    } else {
      processed[key] = value;
    }
  }

  return processed;

        // keeping the below code for future use, if needed

/*       if (testCase.method.toUpperCase() === 'POST' && testCase.polling) {
        response = await pollForExpectedResponse(requestContext, endpoint, testCase.polling);
      }  */  
}
