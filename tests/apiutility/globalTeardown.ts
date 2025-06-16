// globalTeardown.ts
import { clearGlobalStoreFile } from '../apiutility/utils/commonUtil';
import { test } from '@playwright/test';
import commonData from "../ufm-be/constants/common.json";
import { ForecastUtility } from "../ufm-be/fixtures/forecast-utils";
import { loadJSON } from './utils/jsonUtils';
import { ParentConfig} from './types/api.types';
import path from 'path';
import {
  interpolateHeadersObject
} from './utils/commonUtil';


export default async function globalTeardown() {
  console.log('>> Global teardown started');
  clearGlobalStoreFile();
  await deleteAllForecastsForAutomationUser();
  //await verifyAndDeleteForecasts();
  console.log('>> Global teardown completed');
}

import { request as playwrightRequest } from '@playwright/test';


// Example usage of playwrightRequest.newContext inside an async function
export async function createRequestContext(parentConfig: any, interpolatedHeader: any) {
  const requestContext = await playwrightRequest.newContext({
    baseURL: parentConfig.coreService.baseURL[process.env.envName],
    extraHTTPHeaders: interpolatedHeader,
    ignoreHTTPSErrors: true,
  });
  return requestContext;
}

async function deleteAllForecastsForAutomationUser() {
  const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));
  const interpolatedHeader = interpolateHeadersObject(parentConfig.headers);
  let request = await createRequestContext(parentConfig, interpolatedHeader);
  // Use a static list of LOBs if commonData.lob_names does not exist
  const allLobs = [
  "CONSOLIDATED DEMAND",
  "INSTORE AND OTHER",
  "SCHEDULED",
  "UNSCHEDULED AND CORE",
  "IB TRANSPORTATION",
  "OB TRANSPORTATION",
  "E2E DELIVERY",
  "INNOVATION & AUTOMATION",
  "CORE_SERVICES",
  "LAST MILE DELIVERY",
  "FULFILLMENT",
  "SEGMENT",
  "HOME OFFICE",
  "OPERATIONS",
  "REAL ESTATE",
  "FUEL",
  "RX",
  "OPTICAL",
  "ECOMMERCE",
  "MARKETPLACE",
  "CONNECT",
  "MARKETING",
  "DATA VENTURES"
];// Add all relevant LOB names here
  for (let i = 0; i < allLobs.length; i++) {
    try {
      await ForecastUtility.deleteAllforecastofUser(
        request,
        allLobs[i],
        process.env.ufmUser // Make sure this env variable is set to the automation user
      );
      console.log(`Deleted all forecasts for user ${process.env.ufmUser} in LOB: ${allLobs[i]}`);
    } catch (err) {
      console.error(`Error deleting forecasts for LOB ${allLobs[i]}:`, err);
    }
  }
}
