import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';


export async function fetchAndStoreAuthToken(appUrl:string,userName:string,password:string) {
  
  try
  {const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(appUrl);

  await page.fill('#username', userName);
  await page.fill('#password', password);
  await page.click('#login-button');

  await page.waitForLoadState('networkidle'); // or wait for a specific element

  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  const tokenPath = path.resolve(__dirname, '../secure/token.json');
  fs.writeFileSync(tokenPath, JSON.stringify({ authToken: token }));

  console.log('Auth token saved to:', tokenPath);
  await browser.close();
    }
    catch (error) {
      console.error('Error fetching auth token:', error);

    }
}