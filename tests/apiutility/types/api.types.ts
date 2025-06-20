export type AssertionEntry =
  | { status: number }
  | { assertEquals: { [key: string]: string | number } }
  | { assertNotEquals: { [key: string]: string | number } }
  | { assertNull: { [key: string]: string } }
  | { assertNotNull: { [key: string]: string } }
  | { assertResponse: { filePath: string, value: any } }
  | { assertValuesAreEqual: (string | number)[] }
  | { assertLength: (string | number)[] };


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
  runInParallel?: boolean;
}

export interface FunctionArgs {
  [key: string]: any;
}

export interface RunFunction {
  functionName: string;
  args: FunctionArgs;
}

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
  utilityService: { baseURL: { [key: string]: string }, testCaseName: string };
  ForceAllParallel : boolean;
  ForceAllSerial : boolean;
}

export let response: any;