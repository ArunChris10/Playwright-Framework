import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import currentDemandSlotTestData from "../testdata/get-currentdemand-scenario-slot-forecast.json";

test.describe(
  "Verify user is able to get all current demand forecast on currentdemand page",
  { tag: "@Smoke @currentDemandSlots @ibg-service-scenario-financials @Regression" },
  () => {
    test.describe.configure({ timeout: 120_000, mode: "serial" });
    let currentDemandScenario;

    currentDemandSlotTestData.slots.forEach((slot) => {
      test("Current Demand Forecast SBU Data Validation for Slot "+slot, async ({
        request,
      }) => {
        currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
          request,
          slot,
          currentDemandSlotTestData.viewType[0]
        );
        CdfUtility.validatePublishCurrentDemandSbuData(currentDemandScenario);
      });

      test("Current Demand Forecast BASE_CHANNEL Data Validation for Slot "+slot, async ({
        request,
      }) => {
        currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
          request,
          slot,
          currentDemandSlotTestData.viewType[1]
        );
        CdfUtility.validatePublishCurrentDemandChannelData(currentDemandScenario);
      });

    }) 

   
  }
);
