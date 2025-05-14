// globalSetup.ts
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import nexusTokens from "../../../secrets/nexus-users-token.json";
import { getRandomFutureDateTimeWithOffset, generateRandomNumber } from '../apiutility/utils/commonUtil';
import fs from 'fs';

export default async function globalSetup() {
  console.log('Global Setup (runs once before all tests)');

  const parentConfigPath = path.resolve(__dirname, './parent-config.json');
  const parentConfig = JSON.parse(fs.readFileSync(parentConfigPath, 'utf-8'));


  globalStore.setValue(['randomNumber'], generateRandomNumber(3));
  globalStore.setValue(['deadlineDate'], getRandomFutureDateTimeWithOffset(2, 0));
  globalStore.setValue(['updatedDeadlineDate'], getRandomFutureDateTimeWithOffset(2, 10));
}
