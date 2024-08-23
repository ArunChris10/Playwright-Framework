import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";

import type { GetDemandScenarioDetailsResponse } from "../types/get-demand-scenario-details-response";
import type { GetDemandScenarioSplitResponse, BaseChannel } from "../types/get-demand-scenario-splits-response";

test.describe.configure({ mode: 'parallel'})
test.describe(
    "Allocation Layer - Net Merch Sales tests", { tag: "@Regression @ibg-service-scenario-financials @Allocation Layer @AllocationLayerNetMerchSales" }, () => {
  let demandId: string,
      demandScenarioDetails: GetDemandScenarioDetailsResponse,
      demandScenarioSplit: GetDemandScenarioSplitResponse,
      sellerFulfilled: BaseChannel,
      marketplaceFulfilled: BaseChannel

  test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await DemandBaseClass.getDemandStackDetails(request, demandId)
      demandScenarioSplit = await AllocationUtils.getDemandScenarioSplits(request, demandId, demandScenarioDetails);

      sellerFulfilled = demandScenarioSplit.overrideForecast[0].baseChannelForecast[0];
      marketplaceFulfilled = demandScenarioSplit.overrideForecast[0].baseChannelForecast[1];
  })

  test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
  })

  test("Verify that the API supports allocations made with GMV units", async ({ request }) => {
      const allocationType = 'DOLLAR'
      const putScenarioSplit = await AllocationUtils.updateDemandScenarioSplit(
          request,
          sellerFulfilled,
          marketplaceFulfilled,
          false,
          null,
          demandId,
          demandScenarioDetails,
          allocationType,
      )

      // checks that some month's entry was modified
      expect(Object.keys(putScenarioSplit[0].monthlySplitsRequest).length).toBeGreaterThan(0);
  })

  test("Verify that the API supports allocations made with CONVERTED_SALES units", async ({ request }) => {
      const allocationType = 'CONVERTED_SALE'
      const putScenarioSplit = await AllocationUtils.updateDemandScenarioSplit(
          request,
          sellerFulfilled,
          marketplaceFulfilled,
          false,
          null,
          demandId,
          demandScenarioDetails,
          allocationType,
      )

      // checks that some month's entry was modified
      expect(Object.keys(putScenarioSplit[0].monthlySplitsRequest).length).toBeGreaterThan(0);
  })
})
