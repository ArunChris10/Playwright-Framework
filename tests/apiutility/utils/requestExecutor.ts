import { request } from '@playwright/test';

export async function executeRequest(method: string, context: any, endpoint: string, payload?: any) {
  method = method.toUpperCase();
try{
  switch (method) {
    case 'GET':
      return await context.get(endpoint);
    case 'POST':
      return await context.post(endpoint, { data: payload });
    case 'PUT':
      return await context.put(endpoint, { data: payload });
    case 'PATCH':
      return await context.patch(endpoint, { data: payload });
    case 'DELETE':
      return await context.delete(endpoint,{ data: payload });
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}
catch (error) {
  console.error(`Error executing ${method} request to ${endpoint}:`, error);
  throw error; // Rethrow the error after logging it
}}
