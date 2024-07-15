import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import currentDemandSlotTestData from "../testdata/get-currentdemand-scenario-slot-forecast.json";

test.describe(
  "Verify user is able to get all current demand forecast on currentdemand page",
  { tag: "@Smoke @currentDemandSlots" },
  () => {
    test.describe.configure({ timeout: 120_000, mode: "serial" });
    let currentDemandScenario;

    test("Current Demand Forecast SBU Data Validation for Slot 1", async ({
      request,
    }) => {
      currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
        request,
        currentDemandSlotTestData.slots[0],
        currentDemandSlotTestData.viewType[0]
      );
      CdfUtility.validatePublishCurrentDemandSbuData(currentDemandScenario);
    });
    test("Current Demand Forecast SBU Data Validation for Slot 2", async ({
      request,
    }) => {
      currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
        request,
        currentDemandSlotTestData.slots[1],
        currentDemandSlotTestData.viewType[0]
      );
      CdfUtility.validatePublishCurrentDemandSbuData(currentDemandScenario);
    });
    test("Current Demand Forecast SBU Data Validation for Slot 3", async ({
      request,
    }) => {
      currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
        request,
        currentDemandSlotTestData.slots[2],
        currentDemandSlotTestData.viewType[0]
      );
      CdfUtility.validatePublishCurrentDemandSbuData(currentDemandScenario);
    });
    test("Current Demand Forecast BASE_CHANNEL Data Validation for Slot 1", async ({
      request,
    }) => {
      currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
        request,
        currentDemandSlotTestData.slots[0],
        currentDemandSlotTestData.viewType[1]
      );
      CdfUtility.validatePublishCurrentDemandChannelData(currentDemandScenario);
    });
    test("Current Demand Forecast BASE_CHANNEL Data Validation for Slot 2", async ({
      request,
    }) => {
      currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
        request,
        currentDemandSlotTestData.slots[1],
        currentDemandSlotTestData.viewType[1]
      );
      CdfUtility.validatePublishCurrentDemandChannelData(currentDemandScenario);
    });
    test("Current Demand Forecast BASE_CHANNEL Data Validation for Slot 3", async ({
      request,
    }) => {
      currentDemandScenario = await CdfUtility.getCurrentDemandSlotsForecast(
        request,
        currentDemandSlotTestData.slots[2],
        currentDemandSlotTestData.viewType[1]
      );
      CdfUtility.validatePublishCurrentDemandChannelData(currentDemandScenario);
    });
  }
);
