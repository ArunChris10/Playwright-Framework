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
    
    while (Date.now() - startTime < polling.timeoutMs) {
      const res = await requestContext.post(endpoint, { data: payload });;
      const body = await res.json();
      const currentValue = findRelativeValue(body, polling.extractRelative.WhereKey, polling.extractRelative.Equals, polling.extractRelative.Findkey);
    
      console.log(`Polling key: ${polling.extractRelative.Findkey}, Current value: ${currentValue}, Expected value: ${polling.expectedValue}`);
    
      if (currentValue === polling.expectedValue) {
      console.log(`Expected value '${polling.expectedValue}' found for key '${polling.extractRelative.Findkey}'.`);
      return response;
      }
    
      await new Promise(resolve => setTimeout(resolve, polling.intervalMs));
    }
    
    throw new Error(`Polling timeout: '${polling.extractRelative.Findkey}' did not become '${polling.expectedValue}' within ${polling.timeoutMs}ms`);
  }