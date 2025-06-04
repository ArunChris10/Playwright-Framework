// globalSetup.ts
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import { request, expect, APIRequestContext } from '@playwright/test';
import nexusTokens from "../../secrets/nexus-users-token.json";
import { getRandomFutureDateTimeWithOffset, generateRandomNumber, getRandomFutureDateTimeWithOffsetISOFormat, getCurrentDateWithHour } from '../apiutility/utils/commonUtil';

import fs from 'fs';
import { ForecastUtility } from "../ufm-be/fixtures/forecast-utils";
import commonData from "../ufm-be/constants/common.json";
import { UfmUtility } from "../ufm-be/fixtures/ufm-utils";
import { interpolateHeadersObject } from '../apiutility/utils/commonUtil'
import { loadJSON } from '../apiutility/utils/jsonUtils';
import { ParentConfig } from '../apiutility/api.test'
import { Utility } from "../common/fixtures/utils";

export default async function globalSetup() {

  process.env.apiBaseURLUFM = 'https://ibg-ufm-core-service.qa.ibg.walmart.com';

  console.log('Global Setup (runs once before all tests)');
  const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));
  // await Utility.getNexusFakeToken(parentConfig.user + "", request);
  globalStore["token"] = `Bearer ${nexusTokens[parentConfig.user + ""]}`;
  const interpolatedHeader = interpolateHeadersObject(parentConfig.headers);

  globalStore.setValue('randomNumber', generateRandomNumber(4));
  globalStore.setValue('randomDateOffset', generateRandomNumber(1));
  const randomDateOffset = globalStore.getValue('randomDateOffset');
  globalStore.setValue('deadlineDate', getRandomFutureDateTimeWithOffset(randomDateOffset, 0));
  globalStore.setValue('updatedDeadlineDate', getRandomFutureDateTimeWithOffset(randomDateOffset, 10));
  globalStore.setValue('currentDateWithHour', getCurrentDateWithHour());

  globalStore.setValue('deadlineDateISO', getRandomFutureDateTimeWithOffsetISOFormat(globalStore.getValue('deadlineDate')));
  globalStore.setValue('updatedDeadlineDateISO', getRandomFutureDateTimeWithOffsetISOFormat(globalStore.getValue('updatedDeadlineDate')));


  console.log('globalSetup completed');
};

