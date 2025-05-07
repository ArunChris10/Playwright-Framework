import { test, expect, request,APIRequestContext } from '@playwright/test';
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import { findAllValuesByKey,findRelativeValue,loadJSON } from '../apiutility/utils/jsonUtils';
import { validateStatus, validateBody } from '../apiutility/utils/responseValidator';
import { executeRequest } from '../apiutility/utils/requestExecutor';
import {validateExtractedValues,generateRandomNumber,getPayloadByTestCaseName,deepPartialMatch,interpolateObject,interpolate,validateAssertions, getDynamicMonth} from '../apiutility/utils/commonUtil'
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
| { assertResponse: { filePath: string, value: any } };

interface ParentConfig {
  headers: { [key: string]: string };
  user: string;
  testFiles: string[];
  coreService :{ baseURL: { [key: string]: string },testCaseName : string} 
  notificationService :{ baseURL: { [key: string]: string },testCaseName : string} 
  nexusService:{ baseURL: { [key: string]: string },testCaseName : string} 
}

export let response;
const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));

function populateGlobalStore() {

  globalStore["token"] = `Bearer ${nexusTokens[parentConfig.user + ""]}`;
  globalStore["randomNumber"] = generateRandomNumber(3);
  globalStore["dynamicMonth"] = getDynamicMonth();

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
    else if (testCase.service == "nexusService") {
      baseUrl = parentConfig.nexusService.baseURL[testCase.environment];
    } 
    const resolvedBaseUrl = baseUrl + parentConfig[testCase.service][testCase.uri] +interpolate(testCase.queryParams);
    const interpolatedHeader = interpolateObject(parentConfig.headers);
    test(testCase.testName, async () =>  {
      requestContext = await request.newContext({
        baseURL: resolvedBaseUrl,
        extraHTTPHeaders: interpolatedHeader,
        ignoreHTTPSErrors: true,
      });
      const endpoint = "";
      const payload = interpolateObject(testCase.payload);
      response = await executeRequest(testCase.method, requestContext, endpoint,payload);
      const responseBody = await response.json();

      if (testCase.assertion) {
        await validateAssertions(response,responseBody, [testCase.assertion],testCase);
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

      // keeping the below code for future use, if needed

/*       if (testCase.method.toUpperCase() === 'POST' && testCase.polling) {
        response = await pollForExpectedResponse(requestContext, endpoint, testCase.polling);
      }  */    

      // console.log(`Global Store after ${testCase.testName}:`, globalStore);
    });
  });
});