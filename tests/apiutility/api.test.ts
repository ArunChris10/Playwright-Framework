import { test, request } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { globalStore } from '../apiutility/globalStore';
import { findFirstValueByKeyObject, findAllValuesByKey, findRelativeValue, loadJSON, findFirstValueByKey, findRelativeValueMultiCondition, findRelativeFlexibleValue } from '../apiutility/utils/jsonUtils';
import { validateStatus, validateBody } from '../apiutility/utils/responseValidator';
import { executeRequest } from '../apiutility/utils/requestExecutor';
import {
  interpolateHeadersObject,
  validateExtractedValues,
  interpolateObject,
  interpolate,
  validateAssertions,
  validateExtractedValuesContains,
  runFunctions
} from '../apiutility/utils/commonUtil';
import { pollForExpectedResponse } from '../apiutility/utils/pollingMechanism';
import nexusTokens from "../../secrets/nexus-users-token.json";
import { console } from 'inspector/promises';
import globalSetup from './globalSetup';
import globalTeardown from './globalTeardown';
import { Utility } from '../common/fixtures/utils';

export interface FunctionArgs {
  [key: string]: any;
}

export interface RunFunction {
  functionName: string;
  args: FunctionArgs;
}

export interface ApiTestCase {
  environment: string;
  service: string;
  testStep?: string;
  testName?: string;
  uri: string;
  queryParams: string;
  method: string;
  replacePayloadAsObject?: boolean;
  payload?: any;
  assertions?: AssertionEntry;
  extract?: { [key: string]: string };
  extractFirst?: { [key: string]: string };
  validateExtractContains?: { [key: string]: string };
  validateExtract?: { [key: string]: string };
  validateExtractToBeNotNull?: { [key: string]: string };
  validateExtractToBeApprox?: {
    [globalKey: string]: {
      expected: string | number;
      tolerance: number;
    };
  };
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
  runFunctions?: RunFunction[];
  extractObject?: { [key: string]: string };
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

export let response: any;
const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));
const tagsToRun = process.env.tag ? [process.env.tag] : (parentConfig as any).tagsToRun;

function populateGlobalStore(request) {
  // Utility.getNexusFakeToken(parentConfig.user + "", request);
  globalStore["token"] = `Bearer ${nexusTokens[parentConfig.user + ""]}`;
}
// globalSetup()
populateGlobalStore(request);

let testCaseFiles

if (!process.env.CI) {
  const testCasesFolder = path.resolve(__dirname, 'testcases');

  function getAllFilePathsRecursively(folderPath: string, basePath: string): string[] {
    const filePaths: string[] = [];
    const items = fs.readdirSync(folderPath);

    items.forEach(item => {
      const fullPath = path.resolve(folderPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        // Recursively fetch files from the nested folder
        filePaths.push(...getAllFilePathsRecursively(fullPath, basePath));
      } else if (fs.statSync(fullPath).isFile()) {
        // Add relative path instead of full path
        filePaths.push(path.relative(basePath, fullPath));
      }
    });

    return filePaths;
  }

  testCaseFiles = getAllFilePathsRecursively(testCasesFolder, __dirname);
}
else {
  testCaseFiles = parentConfig.testFiles
}

// console.log('Test case files:', testCaseFiles);

// parentConfig.testFiles.forEach(testCasePath => {
testCaseFiles.forEach(testCasePath => {
  const rawTestData = loadJSON<{ [testName: string]: ApiTestCase[] }>(
    path.resolve(__dirname, testCasePath)
  );

  for (const [testName, steps] of Object.entries(rawTestData)) {
    let caseLabels: string[] = [];
    try {
      caseLabels = (steps[0] as any).labels || [];
    } catch (error) {
      console.error(`Test case "${testCasePath}" does not have the correct format.: ${error}`);
    }

    const isIncluded: boolean =
      tagsToRun.length === 0 ||
      caseLabels
        .map((l: string) => l.toLowerCase())
        .some((label: string) => tagsToRun.map((tag: string) => tag.toLowerCase()).includes(label));

    if (!isIncluded) {
      console.log(`Skipping test "${testName}" due to tag filtering`);
      continue;
    }

    test.describe.parallel(testName, () => {
      test(testName, async () => {
        console.log("================================================================================");
        console.log(`STARTING TEST: ${testName}`);
        console.log(`Labels: ${caseLabels.join(", ")}`);
        console.log("================================================================================");

        for (const step of steps) {
          const stepName = step.testStep || step.testName || "Unnamed Step";
          console.log(`--- Executing step: ${stepName} ---`);

          let baseUrl: string | undefined;
          if (step.service === "coreService") {
            baseUrl = parentConfig.coreService.baseURL[process.env.ENV];
          } else if (step.service === "notificationService") {
            baseUrl = parentConfig.notificationService.baseURL[process.env.ENV];
          } else if (step.service === "reportingService") {
            baseUrl = parentConfig.reportingService.baseURL[process.env.ENV];
          } else if (step.service === "nexusService") {
            baseUrl = parentConfig.nexusService.baseURL[process.env.ENV];
          } else if (step.service === "currentDemandService") {
            baseUrl = parentConfig.currentDemandService.baseURL[process.env.ENV];
          } else if (step.service === "dataForgeService") {
            baseUrl = parentConfig.dataForgeService.baseURL[process.env.ENV];
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
                if (globalVar.includes('asString')) {
                  globalStore.setValue(globalVar, value.toString());
                } else {
                  globalStore.setValue(globalVar, value);
                }
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

          if (step.extractObject) {
            for (const globalVar in step.extractObject) {
              const value = findFirstValueByKeyObject(responseBody, interpolate(step.extractObject[globalVar].replace(/^body\./, '')));
              if (!value || value.length === 0) throw new Error(`Key ${step.extractObject[globalVar]} not found`);
              globalStore.setValue(globalVar, value);
              console.log(`Extracted ${globalVar}: ${JSON.stringify(value)}`);
            }
          }

          if (step.validateExtract) {
            for (const globalKey in step.validateExtract) {
              const expected = interpolate(step.validateExtract[globalKey]);
              const actual = globalStore[globalKey];
              validateExtractedValues(actual, expected, globalKey);
              console.log(`Validated ${globalKey}: actual = ${actual}, expected = ${expected}`);
            }
          }

          if (step.validateExtractToBeNotNull) {
            for (const key in step.validateExtractToBeNotNull) {
              const globalKey = step.validateExtractToBeNotNull[key];
              const actual = globalStore.getValue(globalKey);
              if (actual === null || actual === undefined) {
                throw new Error(`Expected ${globalKey} to be not null or undefined, but got ${actual}`);
              }
              console.log(`Validated ${globalKey} is not null or undefined: actual = ${actual}`);
            }
          }

          if (step.validateExtractContains) {
            console.log("Validating extracted values being contained:");
            for (const globalKey in step.validateExtractContains) {
              const expected = interpolate(step.validateExtractContains[globalKey]);
              const actual = globalStore.getValue(globalKey);
              validateExtractedValuesContains(actual, expected, globalKey);
              console.log(`Validated ${globalKey}: actual = ${actual}, expected = ${expected}`);
            }
          }

          if (step.runFunctions) {
            console.log("Validating extracted values being contained:");
            for (let singleFunction in step.runFunctions) {
              const { functionName, args } = step.runFunctions[singleFunction];
              await runFunctions(functionName, [args], responseBody);
            }
          }

          if (step.assertions) {
            console.log("Running assertions:");
            await validateAssertions(response, responseBody, [step.assertions].flat(), step);
            console.log("Assertions passed");
          }

          if (step.method.toUpperCase() === 'POST' && step.polling) {
            response = await pollForExpectedResponse(requestContext, resolvedBaseUrl, interpolateObject(step.polling), step.method, payload);
          }

          if (step.validateExtractToBeApprox) {
            console.log("Validating extracted values to be approximately equal:");
            for (const globalKey in step.validateExtractToBeApprox) {
              const { expected, tolerance } = step.validateExtractToBeApprox[globalKey];
              const actual = globalStore.getValue(globalKey);
              const interpolatedExpected = Number(interpolate(expected));
              const interpolatedActual = Number(actual);
              if (isNaN(interpolatedExpected) || isNaN(interpolatedActual)) {
                throw new Error(`Cannot compare non-numeric values for ${globalKey}: actual=${actual}, expected=${expected}`);
              }
              const diff = Math.abs(interpolatedActual - interpolatedExpected);
              if (diff > tolerance) {
                throw new Error(`Value for ${globalKey} (${interpolatedActual}) is not within ${tolerance} of expected (${interpolatedExpected})`);
              }
              console.log(`Validated ${globalKey}: actual = ${interpolatedActual}, expected ≈ ${interpolatedExpected}, tolerance = ${tolerance}`);
            }
          }
        }

        console.log(`ENDING TEST: ${testName}`);
        console.log("================================================================================\n");
      });
    });

    // tes.afterAll(async () => {
    //   globalTeardown()
    // })

  }
});

// globalTeardown()


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
