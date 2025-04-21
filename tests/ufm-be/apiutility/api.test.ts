import { test, expect, request,APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import { findAllValuesByKey,findRelativeValue } from '../apiutility/utils/jsonUtils';
import { validateStatus, validateBody } from '../apiutility/utils/responseValidator';
import { executeRequest } from '../apiutility/utils/requestExecutor';
import {validateExtractedValues,generateRandomNumber,getPayloadByTestCaseName,deepPartialMatch,interpolateObject,interpolate} from '../apiutility/utils/commonUtil'
import * as payloads from '../apiutility/expected-payloads/payloads'
import {pollForExpectedResponse} from '../apiutility/utils/pollingMechanism';

interface ApiTestCase {
  testName: string;
  testIdentifier: string;
  baseURL:string;
  uri: string;
  method: string;
  headers: { [key: string]: string };
  payload?: any;
  assertions: {
    status: number;
    bodyContains?: any;
  };
  extract?: { [key: string]: string };
  validateExtract?: { [key: string]: string };
  polling?: {
    key: string;           // e.g. 'data.status' or 'status'
    expectedValue: any;    // e.g. 'completed'
    intervalMs: number;    // e.g. 2000
    timeoutMs: number;     // e.g. 30000
  };
  extractRelative?: {
    [globalVar: string]: {
      whereKey: string;
      equals: any;
      extractKey: string;
    };
  };
}

interface ParentConfig {
  baseURL: string;
  headers: { [key: string]: string };
  runTags?: string[];
  testFiles: string[];
}

export let response;

function populateGlobalStore() {
  globalStore["randomNumber"] = generateRandomNumber(3);
  globalStore["token"] = payloads.bearerToken;

}
populateGlobalStore();

// Pre-hook: Runs before all test cases
test.beforeAll(async () => {
  console.log('Global Setup Started');
});

// Pre-hook: Runs before each test
test.beforeEach(async ({}, testInfo) => {
  console.log(`Starting test: ${testInfo.title}`);

});

// Post-hook: Runs after each test
test.afterEach(async ({}, testInfo) => {
  console.log(`Completed test: ${testInfo.title}`);

});

// Post-hook: Runs once after all tests are done
test.afterAll(async () => {
  console.log('Global Teardown Completed');

});



function loadJSON<T>(filePath: string): T {
  const data =  fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8');
  return JSON.parse(data);
}

const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));

parentConfig.testFiles.forEach(testCasePath => {

  const testCase = loadJSON<ApiTestCase[] | ApiTestCase>(path.resolve(__dirname, testCasePath));
  const normalizedCases = Array.isArray(testCase) ? testCase : [testCase];
  
  let requestContext: APIRequestContext | null = null;
  normalizedCases.forEach(testCase =>  {
    const resolvedBaseUrl = parentConfig.baseURL[testCase.baseURL];
    const interpolatedHeader = interpolateObject(parentConfig.headers);
    test(testCase.testName, async () =>  {
      requestContext = await request.newContext({
        baseURL: resolvedBaseUrl,
        extraHTTPHeaders: interpolatedHeader,
        ignoreHTTPSErrors: true,
      });
      const endpoint = interpolate(testCase.uri);
      const payload = interpolateObject(testCase.payload);
      response = await executeRequest(testCase.method, requestContext, endpoint, payload);
      const responseBody = await response.json();

      if (testCase.assertions.status) {
        validateStatus(response, testCase.assertions.status);
      }


      if (testCase.assertions.bodyContains) {
        validateBody(responseBody, testCase.assertions.bodyContains);
      }

      if (testCase.extract) {
        let value;
        for (const globalVar in testCase.extract) {

          if (globalVar == "lastApiResponse"){
            globalStore["lastApiResponse-"+testCase.testIdentifier] = responseBody;
          }
          else
          {
          value = findAllValuesByKey(responseBody, testCase.extract[globalVar].replace(/^body\./, ''));

          if (value == undefined || value.length == 0) {
            throw new Error(`Key ${testCase.extract[globalVar]} not found in response body`);
          }
          globalStore[globalVar] = value;
          }          
        }
      }

      if (testCase.extractRelative) {
        for (const globalVar in testCase.extractRelative) {
          const { whereKey, equals, extractKey } = testCase.extractRelative[globalVar];

          if (!whereKey || !extractKey) {
            throw new Error(`Missing whereKey or extractKey in extractRelative for "${globalVar}"`);
          }

          const value = findRelativeValue(responseBody, whereKey, equals, extractKey);

          if (value !== undefined) {
            globalStore[globalVar] = value;
          } else {
            throw new Error(
              `Unable to extract value using extractRelative for "${globalVar}" with condition ${whereKey} == ${equals}`
            );
          }
        }
}

      if (testCase.validateExtract) {
        for (const globalKey in testCase.validateExtract) {
          const expected = interpolate(testCase.validateExtract[globalKey]);
          const actual = globalStore[globalKey];
          if (globalKey == "lastApiResponse"){
            const selectedPayload = getPayloadByTestCaseName("lastApiResponse-"+testCase.testIdentifier);
            let ismatch = deepPartialMatch(selectedPayload, actual);
            expect(ismatch).toBeTruthy(); // all expected items must exist in actual
          }
          else{
          await validateExtractedValues(actual, expected, globalKey);
          }
        }
      }

/*       if (testCase.method.toUpperCase() === 'POST' && testCase.polling) {
        response = await pollForExpectedResponse(requestContext, endpoint, testCase.polling);
      }  */    

      console.log(`Global Store after ${testCase.testName}:`, globalStore);
    });
  });
});