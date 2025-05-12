import { test, expect, request,APIRequestContext } from '@playwright/test';
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import { findAllValuesByKey,findRelativeValue,loadJSON, findFirstValueByKey } from '../apiutility/utils/jsonUtils';
import { validateStatus, validateBody } from '../apiutility/utils/responseValidator';
import { executeRequest } from '../apiutility/utils/requestExecutor';
import {interpolateHeadersObject,validateExtractedValues,generateRandomNumber,getPayloadByTestCaseName,deepPartialMatch,interpolateObject,interpolate,validateAssertions,getRandomFutureDateTimeWithOffset} from '../apiutility/utils/commonUtil'
import {pollForExpectedResponse} from '../apiutility/utils/pollingMechanism';
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
| { assertEquals: {[key: string]: string | number;  }}
| { assertNotEquals: {[key: string]: string | number;  }}
| { assertNull: {[key: string]: string;};}
| { assertNotNull: {[key: string]: string;};}
| { assertResponse: { filePath: string, value: any } }
| { assertValuesAreEqual: (string | number)[] };;

interface ParentConfig {
  headers: { [key: string]: string };
  user: string;
  testFiles: string[];
  coreService :{ baseURL: { [key: string]: string },testCaseName : string} 
  notificationService: { baseURL: { [key: string]: string }, testCaseName: string } 
  reportingService:  { baseURL: { [key: string]: string }, testCaseName: string } 
  nexusService:{ baseURL: { [key: string]: string },testCaseName : string} 
}

export let response;
const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));

function populateGlobalStore() {

  globalStore["token"] = `Bearer ${nexusTokens[parentConfig.user + ""]}`;
  globalStore["randomNumber"] = generateRandomNumber(3);
  globalStore["deadlineDate"] = getRandomFutureDateTimeWithOffset(2,0);
  globalStore["updatedDeadlineDate"] = getRandomFutureDateTimeWithOffset(2,10);

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


parentConfig.testFiles.forEach(testCasePath => {

  const testCase = loadJSON<ApiTestCase[] | ApiTestCase>(path.resolve(__dirname, testCasePath));
  const normalizedCases = Array.isArray(testCase) ? testCase : [testCase];
  
  let requestContext: APIRequestContext | null = null;
  normalizedCases.forEach(testCase =>  {
    
    
    let baseUrl;
    if (testCase.service == "coreService") {
      baseUrl = parentConfig.coreService.baseURL[testCase.environment];
    }
    else if (testCase.service == "notificationService") {
      baseUrl = parentConfig.notificationService.baseURL[testCase.environment];
    } 
    else if (testCase.service == "reportingService") {
      baseUrl = parentConfig.reportingService.baseURL[testCase.environment];
    } 

    else if (testCase.service == "nexusService") {
      baseUrl = parentConfig.nexusService.baseURL[testCase.environment];
    } 
    const interpolatedHeader = interpolateHeadersObject(parentConfig.headers);
    test(testCase.testName, async () =>  {
    const resolvedBaseUrl = baseUrl + parentConfig[testCase.service][testCase.uri] +interpolate(testCase.queryParams);
    console.log(`Resolved Base URL for test case "${testCase.testName}":`, resolvedBaseUrl);
      requestContext = await request.newContext({
        baseURL: resolvedBaseUrl,
        extraHTTPHeaders: interpolatedHeader,
        ignoreHTTPSErrors: true,
      });
      const endpoint = "";
      let responseBody = null;
      let payload = await postProcessInterpolatedPayload(testCase.payload);
      payload = interpolateObject(payload);
      response = await executeRequest(testCase.method, requestContext, endpoint,payload);
      if(response.status() != 204){
       responseBody = await response.json();
      }


      if (testCase.extract) {
        let value;
        for (const globalVar in testCase.extract) {

          if (globalVar == "lastApiResponse"){
            globalStore["lastApiResponse-"+testCase.testName] = responseBody;
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
      if (testCase.extractFirst) {
        let value;
        for (const globalVar in testCase.extractFirst) {
          value = findFirstValueByKey(responseBody, testCase.extractFirst[globalVar].replace(/^body\./, ''));

          if (value == undefined || value.length == 0) {
            throw new Error(`Key ${testCase.extractFirst[globalVar]} not found in response body`);
          }
          globalStore[globalVar] = value;       
        }
      }

      if (testCase.extractRelative) {
        for (const globalVar in testCase.extractRelative) {
          const { whereKey, equals, extractKey } = testCase.extractRelative[globalVar];
          const value = findRelativeValue(responseBody, whereKey, equals, extractKey);
          if (value !== undefined) {
            globalStore[globalVar] = value;
          } else {
            throw new Error(`Could not find relative value where "${whereKey}" == "${equals}" to extract "${extractKey}"`);
          }
        }
      }
      

      if (testCase.validateExtract) {
        for (const globalKey in testCase.validateExtract) {
          const expected = interpolate(testCase.validateExtract[globalKey]);
          const actual = globalStore[globalKey];
          if (globalKey == "lastApiResponse"){
            const selectedPayload = getPayloadByTestCaseName(testCase.testName);
            const actual = globalStore["lastApiResponse-"+testCase.testName];
            let ismatch = deepPartialMatch(selectedPayload, actual);
            expect(ismatch).toBeTruthy();
          }
          else{
          await validateExtractedValues(actual, expected, globalKey);
          }
        }
      }

      if (testCase.assertion) {
        await validateAssertions(response,responseBody, [testCase.assertion],testCase);
      }

      function postProcessInterpolatedPayload(obj: any): any {
        if (obj === null || typeof obj !== 'object') return obj;
      
        const processed = Array.isArray(obj) ? [] : {};
      
        for (const key in obj) {
          const value = obj[key];
      
          if (key === 'scenario_id' || key === 'scenario_version') {
            processed[key] = Number(globalStore[key]);
          }
          else if (Array.isArray(value)) {
            // Check and replace items in the array that include "scenario_id"
            processed[key] = value.map(item => {
              if (typeof item === 'string' && item.includes("scenario_id")) {
                const match = item.match(/\{\{(.*?)\}\}/);
                if (match) {
                  const variableKey = match[1].trim();
                  return globalStore.getValue
                    ? globalStore.getValue(variableKey)
                    : globalStore[variableKey];
                }
              }
              return item; // return original if not matched
            });
          }
          else if (typeof value === 'object') {
            processed[key] = postProcessInterpolatedPayload(value); // recursive call
          } else {
            processed[key] = value;
          }
        }
      
        return processed;
      }
      
      // keeping the below code for future use, if needed

/*       if (testCase.method.toUpperCase() === 'POST' && testCase.polling) {
        response = await pollForExpectedResponse(requestContext, endpoint, testCase.polling);
      }  */    

      // console.log(`Global Store after ${testCase.testName}:`, globalStore);
    });
  });
});