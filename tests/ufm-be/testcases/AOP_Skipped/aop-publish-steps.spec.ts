import { expect, test } from "../../../common/fixtures/test-hook";
import { Utility } from "../../../common/fixtures/utils";
import testdatafile from "../../testdata/new-aop-version.json";
import { AOPUtils } from '../../fixtures/aop-utils';
import { executeAOPSteps } from '../../fixtures/aop-publish-steps-utils';
import adjustmentData from "../../testdata/adjustment.json";
import aopEdits from "../../testdata/aop-edits.json";
import forecastData from "../../testdata/forecast-api.json";
export interface NodeDimension { };


test.describe.skip('Execute and validate AOP publish iterations sequentially', 
  { tag: "@Smoke @Regression @aop @aoppublishthirdItr" },
  () => {
  // pre-condition
  test('Run AOP publish iteration 1', async ({ request }) => {
    await test.step('Run first iteration for AOP publish', async () => {
      await executeAOPSteps(request, aopEdits.allocation_payload.allocation_request.edits);
    });
  });
  
  //test 1
  test('Run AOP publish iterations 2', async ({ request }) => {
    await test.step('Run second iteration for AOP publish', async () => {
      await executeAOPSteps(request, aopEdits.secondIterationEditsPayload);
    });
  });

  //test 2
    test('Run AOP publish iterations 3', async ({ request }) => {
      await test.step('Run third iteration for AOP publish', async () => {
        await executeAOPSteps(request, aopEdits.thirdIterationEditsPayload);
      });
    });
});
  