import { expect } from '@playwright/test';

export function validateStatus(response: any, expectedStatus: number): void {
  expect(response.status()).toBe(expectedStatus);
}

export function validateBody(responseBody: any, expected: any): void {
  for (const key in expected) {
    expect(responseBody[key]).toEqual(expected[key]);
  }
}
