import { APIRequestContext } from '@playwright/test';
import { findAllValuesByKey } from './jsonUtils';
import {response} from '../api.test';

export async function pollForExpectedResponse(
    requestContext: APIRequestContext,
    endpoint: string,
    polling: {
      key: string;
      expectedValue: any;
      intervalMs: number;
      timeoutMs: number;
    }
  ): Promise<Response> {
    const startTime = Date.now();
  
    while (Date.now() - startTime < polling.timeoutMs) {
      const res = await requestContext.get(endpoint);
      const body = await res.json();
      const currentValue = findAllValuesByKey(body, polling.key);
  
      if (currentValue === polling.expectedValue) {
        return response;
      }
  
      await new Promise(resolve => setTimeout(resolve, polling.intervalMs));
    }
  
    throw new Error(`Polling timeout: '${polling.key}' did not become '${polling.expectedValue}' within ${polling.timeoutMs}ms`);
  }