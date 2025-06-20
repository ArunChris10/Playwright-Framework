import { APIRequestContext } from '@playwright/test';
import { findRelativeValue } from './jsonUtils';
import {response} from '../../apiutility/types/api.types';

export async function pollForExpectedResponse(
  requestContext: APIRequestContext,
  endpoint: string,
  polling: {
    extractRelative:{
    WhereKey: string;
    Equals: any;
    Findkey: string;
    }
    expectedValue: any;
    intervalMs: number;
    timeoutMs: number;
  },
  apiMethod: string,
  payload? : string []

): Promise<Response> {
  const startTime = Date.now();
  
  // Check if roundoff is required
  let roundoffRequired = false;
  let actualFindkey = polling.extractRelative.Findkey;
  
  if (polling.extractRelative.Findkey.includes('-roundoff')) {
    roundoffRequired = true;
    actualFindkey = polling.extractRelative.Findkey.split('-')[0];
  }
  
  while (Date.now() - startTime < polling.timeoutMs) {
    const res = await requestContext.post(endpoint, { data: payload });;
    const body = await res.json();

    let currentValue = findRelativeValue(body, polling.extractRelative.WhereKey, polling.extractRelative.Equals, actualFindkey);
  
    // Apply roundoff logic if required
    if (roundoffRequired && typeof currentValue === 'number') {
      // Round to 5 decimal places first, then to nearest integer if close enough
      const rounded5Decimal = Math.round(currentValue * 100000) / 100000;
      const roundedInteger = Math.round(rounded5Decimal);
      
      // If the difference between the 5-decimal rounded value and integer is very small, round to integer
      if (Math.abs(rounded5Decimal - roundedInteger) < 0.00001) {
        currentValue = roundedInteger;
      } else {
        currentValue = rounded5Decimal;
      }
    }
  
    console.log(`Polling key: ${actualFindkey}, Current value: ${currentValue}, Expected value: ${polling.expectedValue}`);
  
    if (currentValue === polling.expectedValue) {
    console.log(`Expected value '${polling.expectedValue}' found for key '${actualFindkey}'.`);
    return response;
    }
  
    await new Promise(resolve => setTimeout(resolve, polling.intervalMs));
  }
  
  throw new Error(`Polling timeout: '${actualFindkey}' did not become '${polling.expectedValue}' within ${polling.timeoutMs}ms`);
}