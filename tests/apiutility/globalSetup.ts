// globalSetup.ts
import path from 'path';
import { globalStore } from '../apiutility/globalStore';
import { request, expect, APIRequestContext } from '@playwright/test';
import nexusTokens from "../../secrets/nexus-users-token.json";
import { getRandomFutureDateTimeWithOffset, generateRandomNumber,getRandomFutureDateTimeWithOffsetISOFormat ,getCurrentDateWithHour} from '../apiutility/utils/commonUtil';

import fs from 'fs';
import { ForecastUtility } from "../ufm-be/fixtures/forecast-utils";
import commonData from "../ufm-be/constants/common.json";
import { UfmUtility } from "../ufm-be/fixtures/ufm-utils";
import {interpolateHeadersObject} from '../apiutility/utils/commonUtil'
import { loadJSON } from '../apiutility/utils/jsonUtils';
import {ParentConfig} from '../apiutility/api.test'
import { Utility } from "../common/fixtures/utils";

export default async function globalSetup() {

  process.env.apiBaseURLUFM =  'https://ibg-ufm-core-service.qa.ibg.walmart.com';
  
  console.log('Global Setup (runs once before all tests)');
  const parentConfig = loadJSON<ParentConfig>(path.resolve(__dirname, 'parent-config.json'));
  //await Utility.getNexusFakeToken(parentConfig.user + "", request);
  globalStore["token"] = `Bearer ${nexusTokens[parentConfig.user + ""]}`;
  const interpolatedHeader = interpolateHeadersObject(parentConfig.headers);

  globalStore.setValue('randomNumber', generateRandomNumber(3));
  globalStore.setValue('deadlineDate', getRandomFutureDateTimeWithOffset(2, 0));
  globalStore.setValue('updatedDeadlineDate', getRandomFutureDateTimeWithOffset(2, 10));
  globalStore.setValue('currentDateWithHour',getCurrentDateWithHour());

  globalStore.setValue('deadlineDateISO', getRandomFutureDateTimeWithOffsetISOFormat(globalStore.getValue('deadlineDate')));
  globalStore.setValue('updatedDeadlineDateISO', getRandomFutureDateTimeWithOffsetISOFormat(globalStore.getValue('updatedDeadlineDate')));

/*   const apiRequestContext: APIRequestContext = await request.newContext({
    extraHTTPHeaders: interpolatedHeader,
    ignoreHTTPSErrors: true,
  });

  const forecastCount = await ForecastUtility.countOfScenario(
    'HOME OFFICE',
    parentConfig.user,
    apiRequestContext
  );

  if (forecastCount >= commonData.MAX_SCENARIO_COUNT) {
    console.log('Cleaning up existing forecasts...');
    await ForecastUtility.deleteAllforecastofUser(
      apiRequestContext,
      'HOME OFFICE',
      parentConfig.user
    );
  }

  // Create scenario and validate duplicate creation message
  const currentForecastList = await UfmUtility.getCurrentForecastList(
    'HOME OFFICE',
    apiRequestContext
  );

  const scenarioId = await ForecastUtility.createForecast(
    'HOME OFFICE',
    apiRequestContext
  );

  const scenarioDetails = await UfmUtility.getScenarioDetails(
    currentForecastList,
    scenarioId
  ); */


  //await apiRequestContext.dispose();
  console.log('globalSetup completed');
  };

