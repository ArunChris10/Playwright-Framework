// globalSetup.ts
import { globalStore } from '../apiutility/globalStore';

import { getRandomFutureDateTimeWithOffset, generateRandomNumber } from '../apiutility/utils/commonUtil';


export default async function globalSetup() {

  
  console.log('Global Setup (runs once before all tests)');


  globalStore.setValue('randomNumber', generateRandomNumber(3));
  globalStore.setValue('deadlineDate', getRandomFutureDateTimeWithOffset(2, 0));
  globalStore.setValue('updatedDeadlineDate', getRandomFutureDateTimeWithOffset(2, 10));


  console.log('globalSetup completed');
  };

