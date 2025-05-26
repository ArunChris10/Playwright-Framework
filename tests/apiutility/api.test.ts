import { test, expect, request, APIRequestContext } from '@playwright/test';
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import { findAllValuesByKey, findRelativeValue, loadJSON, findFirstValueByKey,findRelativeValueMultiCondition} from '../apiutility/utils/jsonUtils';
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
  validateAssertions,
  validateExtractedValuesContains
} from '../apiutility/utils/commonUtil';
import { pollForExpectedResponse } from '../apiutility/utils/pollingMechanism';
import nexusTokens from "../../secrets/nexus-users-token.json";
import { console } from 'inspector/promises';

export interface ApiTestCase {
  environment: string;
  service: string;
  testStep?: string; 
  testName?: string; 
  uri: string;
  queryParams: string;
  method: string;
  payload?: any;
  assertion?: AssertionEntry;
  extract?: { [key: string]: string };
  extractFirst?: { [key: string]: string };
  validateExtractContains?: { [key: string]: string};
  validateExtract?: { [key: string]: string };
  polling?: {
    extractRelative: {
      WhereKey: string;
      Equals: any;
      Findkey: string;
    };
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
   extractRelativeMultipleCondition?: {
    [globalVar: string]: {
      conditions: {
        path: string;
        equals: any;
      }[];
      extractKey: string;
    };
  };
  labels?: string[];
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
  currentDemandService: { baseURL: { [key: string]: string }, testCaseName: string };
  dataForgeService: { baseURL: { [key: string]: string }, testCaseName: string };
}

export let response;
const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));
const tagsToRun = (parentConfig as any).tagsToRun || [];

function populateGlobalStore() {
  globalStore["token"] = `Bearer ${nexusTokens[parentConfig.user + ""]}`;
}
populateGlobalStore();

parentConfig.testFiles.forEach(testCasePath => {
  const rawTestData = loadJSON<{ [testName: string]: ApiTestCase[] }>(
    path.resolve(__dirname, testCasePath)
  );

  for (const [testName, steps] of Object.entries(rawTestData)) {
    let caseLabels;
    try{
    caseLabels = (steps[0] as any).labels || [];
    }catch (error) {
      throw new Error(`Test case "${steps}" does not have the correct format.: ${error}`);
    }


    const isIncluded =
      tagsToRun.length === 0 ||
      caseLabels
        .map((l: string) => l.toLowerCase())
        .some(label => tagsToRun.map(tag => tag.toLowerCase()).includes(label));

    if (!isIncluded) {
      console.log(`Skipping test "${testName}" due to tag filtering`);
      continue;
    }

    test(testName, async () => {
      console.log("================================================================================");
      console.log(`STARTING TEST: ${testName}`);
      console.log(`Labels: ${caseLabels.join(", ")}`);
      console.log("================================================================================");

      for (const step of steps) {
        const stepName = step.testStep || step.testName || "Unnamed Step";
        console.log(`--- Executing step: ${stepName} ---`);

        let baseUrl;
        if (step.service === "coreService") {
          baseUrl = parentConfig.coreService.baseURL[step.environment];
        } else if (step.service === "notificationService") {
          baseUrl = parentConfig.notificationService.baseURL[step.environment];
        } else if (step.service === "reportingService") {
          baseUrl = parentConfig.reportingService.baseURL[step.environment];
        } else if (step.service === "nexusService") {
          baseUrl = parentConfig.nexusService.baseURL[step.environment];
        } else if (step.service === "currentDemandService") {
          baseUrl = parentConfig.currentDemandService.baseURL[step.environment];
        }
        else if(step.service === "dataForgeService") {
          baseUrl = parentConfig.dataForgeService.baseURL[step.environment];
        }

        const interpolatedHeader = interpolateHeadersObject(parentConfig.headers);
        const resolvedBaseUrl = baseUrl + parentConfig[step.service][step.uri] + interpolate(step.queryParams);

        const requestContext = await request.newContext({
          baseURL: resolvedBaseUrl,
          extraHTTPHeaders: interpolatedHeader,
          ignoreHTTPSErrors: true,
        });

        console.log(`Resolved URL: ${resolvedBaseUrl}`);

        let responseBody = null;
        let payload = await postProcessInterpolatedPayload(step.payload);
        payload = interpolateObject(payload);

        console.log("Request Payload:");
        console.log(JSON.stringify(payload, null, 2));

        response = await executeRequest(step.method, requestContext, "", payload);

        console.log(`Response Status: ${response.status()}`);
        if (response.status() !== 204) {
          responseBody = await response.json();
          console.log("Response Body:");
          console.log(JSON.stringify(responseBody, null, 2));
        }

        if (step.extract) {
          for (const globalVar in step.extract) {
            const value = findAllValuesByKey(responseBody, interpolate(step.extract[globalVar].replace(/^body\./, '')));
            if (!value || value.length === 0) throw new Error(`Key ${step.extract[globalVar]} not found`);
            globalStore.setValue(globalVar, value);
            console.log(`Extracted ${globalVar}: ${JSON.stringify(value)}`);
          }
        }

        if (step.extractFirst) {
          for (const globalVar in step.extractFirst) {
            const value = findFirstValueByKey(responseBody, step.extractFirst[globalVar].replace(/^body\./, ''));
            if (!value) throw new Error(`Key ${step.extractFirst[globalVar]} not found`);
            globalStore.setValue(globalVar, value);
            console.log(`Extracted ${globalVar}: ${JSON.stringify(value)}`);
          }
        }

        if (step.extractRelative) {
          for (const globalVar in step.extractRelative) {
            const { whereKey, equals, extractKey } = step.extractRelative[globalVar];
            const value = findRelativeValue(responseBody, interpolate(whereKey), interpolate(equals), interpolate(extractKey));
            if (value !== undefined) {
              globalStore.setValue(globalVar, value);
              console.log(`Extracted ${globalVar}: ${JSON.stringify(value)}`);
            } else {
              throw new Error(`Could not find relative value where "${whereKey}" == "${equals}"`);
            }
          }
        }


        if (step.extractRelativeMultipleCondition) {
          for (const globalVar in step.extractRelativeMultipleCondition) {
            const { conditions, extractKey } = step.extractRelativeMultipleCondition?.[globalVar] ?? {};
          if (conditions && extractKey) {
            const result = findRelativeValueMultiCondition(responseBody, conditions, extractKey);
            globalStore.setValue(globalVar, result);
          } else {
            console.warn(`No valid extractRelative config found for globalVar: ${globalVar}`);
          }
          }
        }


        if (step.validateExtract) {
          for (const globalKey in step.validateExtract) {
            const expected = interpolate(step.validateExtract[globalKey]);
            const actual = globalStore[globalKey];
            await validateExtractedValues(actual, expected, globalKey);
            console.log(`Validated ${globalKey}: actual = ${actual}, expected = ${expected}`);
          }
        }

        if (step.validateExtractContains) {
          console.log("Validating extracted values being contained:");
          for (const globalKey in step.validateExtractContains) {
            const expected = interpolate(step.validateExtractContains[globalKey]);
            const actual = globalStore.getValue(globalKey);
            await validateExtractedValuesContains(actual, expected, globalKey);
            console.log(`Validated ${globalKey}: actual = ${actual}, expected = ${expected}`);
          }
        }

        if (step.assertion) {
          console.log("Running assertions:");
          await validateAssertions(response, responseBody, [step.assertion].flat(), step);
          console.log("Assertions passed");
        }

        if (step.method.toUpperCase() === 'POST' && step.polling) {
          response = await pollForExpectedResponse(requestContext, resolvedBaseUrl, interpolateObject(step.polling), step.method, payload);
        }
      }

      console.log(`ENDING TEST: ${testName}`);
      console.log("================================================================================\n");
    });
  }
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


}
