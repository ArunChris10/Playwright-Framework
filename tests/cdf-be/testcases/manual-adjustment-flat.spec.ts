import { test, expect } from "../../common/fixtures/test-hook";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import adjustmentData from "../testdata/adjustment-layer-data.json";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
  "Verify Demand Tabular flattened view apis",
  { tag: "@Smoke @verifyManualAdjustmentLayerFlattened @Regression @ibg-service-scenario-financials" },
  () => {
    let layerId,
      demandStackId,
      demandScenarioDetails,
      yearMonths,
      yearMonthsFormatted,
      sbuFilter = adjustmentData.sbuFilter,
      deptartmentFilter = adjustmentData.deptartmentFilter,
      channelFilter = adjustmentData.channelFilter,
      baseForecastData;

    test.beforeAll(async ({ request }) => {
      demandStackId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await AdjustmentUtility.getDemandStackDetails(
        request,
        demandStackId
      );
    });

    test("Verify: get actuals and forecast data all years without filter", async ({
      request,
    }) => {
      const response = await AdjustmentUtility.getAllDemandScenarioForecastData(
        request,
        demandStackId,
        demandScenarioDetails
      );
      let startDate = String(
        parseInt(response.cutOffDate.split("-").join("")) + 1
      );
      yearMonths = [startDate];
      yearMonthsFormatted = startDate.substring(0, 4) + "-" + startDate.substring(4);
      expect(response.forecast).toBeDefined();
      expect(response.forecast[0].childForecast).toBeDefined();
      expect(response.forecast[0].childForecast.length > 0).toBeTruthy(); // sbuCount
      expect(response.forecast[0].childForecast[0].departmentForecast).toBeDefined();
      expect(response.forecast[0].childForecast[0].departmentForecast.length > 0).toBeTruthy(); // deptCount
    });

    test("Verify: get forecast data with deptartmentId channelId, sbuId and cutoff date ", async ({
      request,
    }) => {
      const response = await AdjustmentUtility.getAllDemandScenarioForecastData(
        request,
        demandStackId,
        demandScenarioDetails,
        sbuFilter.sbuName,
        sbuFilter.sbuIds,
        deptartmentFilter.deptName,
        deptartmentFilter.deptIds,
        channelFilter.channelName,
        channelFilter.channelIds,
        yearMonths
      );
      baseForecastData =
        response.forecast[0].childForecast[0].departmentForecast[0].forecast[0];
      expect(response.forecast).toBeDefined();
      expect(response.forecast[0].childForecast).toBeDefined();
      expect(response.forecast[0].childForecast.length == 1).toBeTruthy(); // sbuCount
      expect(response.forecast[0].childForecast[0].departmentForecast).toBeDefined();
      expect(response.forecast[0].childForecast[0].departmentForecast.length == 1).toBeTruthy(); // deptCount

      expect(response.forecast[0].baseChannel == channelFilter.channelName[0]).toBeTruthy();
      expect(response.forecast[0].childForecast[0].sbu == sbuFilter.sbuName[0]).toBeTruthy();
      expect(
        response.forecast[0].childForecast[0].departmentForecast[0]
          .department == deptartmentFilter.deptName[0]
      ).toBeTruthy();
    });

    test("Verify: forecast values are updated with manual adjustment on hold aur.", async ({
      request,
    }) => {
    //   const lockResponse = await AdjustmentUtility.lockUnlockDemandScenario(request, "unlock", demandStackId);
    //   expect(lockResponse).toBeOK();

      const updateDSResponse = await AdjustmentUtility.updateDemandStacksData(
        request,
        demandStackId,
        demandScenarioDetails,
        sbuFilter.sbuName[0],
        sbuFilter.sbuIds[0],
        deptartmentFilter.deptName[0],
        deptartmentFilter.deptIds[0],
        channelFilter.channelName,
        channelFilter.channelIds,
        yearMonthsFormatted,
        false,
        baseForecastData,
        "HOLD_AUR"
      );
      layerId = updateDSResponse[0].layerId
      expect(typeof layerId).toBe("string");

      const response = await AdjustmentUtility.getAllDemandScenarioForecastData(
        request,
        demandStackId,
        demandScenarioDetails,
        sbuFilter.sbuName,
        sbuFilter.sbuIds,
        deptartmentFilter.deptName,
        deptartmentFilter.deptIds,
        channelFilter.channelName,
        channelFilter.channelIds,
        yearMonths,
        [layerId]
      );
      let updatedForecast = response.forecast[0].childForecast[0].departmentForecast[0].forecast[0];
      let expectedUnits = baseForecastData.units + adjustmentData.forecastUpdatePayload.units;
      let expectedGMV = Math.floor(baseForecastData.amount + (baseForecastData.aur * adjustmentData.forecastUpdatePayload.units));
      expect(updatedForecast.aur == baseForecastData.aur).toBe(true);
      expect(updatedForecast.units == expectedUnits).toBe(true);
      expect(Math.floor(updatedForecast.amount) == expectedGMV).toBe(true);
    });

    test("Verify: forecast values are updated with manual adjustment on hold unit.", async ({
        request,
      }) => {
        // const lockResponse = await AdjustmentUtility.lockUnlockDemandScenario(request, "unlock", demandStackId);
        // expect(lockResponse).toBeOK();
  
        const updateDSResponse = await AdjustmentUtility.updateDemandStacksData(
          request,
          demandStackId,
          demandScenarioDetails,
          sbuFilter.sbuName[0],
          sbuFilter.sbuIds[0],
          deptartmentFilter.deptName[0],
          deptartmentFilter.deptIds[0],
          channelFilter.channelName,
          channelFilter.channelIds,
          yearMonthsFormatted,
          false,
          baseForecastData,
          "HOLD_UNITS"
        );
        layerId = updateDSResponse[0].layerId
        expect(typeof layerId).toBe("string");
  
        const response = await AdjustmentUtility.getAllDemandScenarioForecastData(
          request,
          demandStackId,
          demandScenarioDetails,
          sbuFilter.sbuName,
          sbuFilter.sbuIds,
          deptartmentFilter.deptName,
          deptartmentFilter.deptIds,
          channelFilter.channelName,
          channelFilter.channelIds,
          yearMonths,
          [layerId]
        );
        let updatedForecast = response.forecast[0].childForecast[0].departmentForecast[0].forecast[0];
        let expectedGMV = Math.floor(baseForecastData.amount + adjustmentData.forecastUpdatePayload.gmv);
        let expectedAUR = Math.floor((baseForecastData.amount + adjustmentData.forecastUpdatePayload.gmv)/baseForecastData.units);
        expect(updatedForecast.units == baseForecastData.units).toBe(true);
        expect(Math.floor(updatedForecast.amount) == expectedGMV).toBe(true);
        expect(Math.floor(updatedForecast.aur) == expectedAUR).toBe(true);
      });


    test("Verify: forecast values are updated with manual adjustment for input gmv and units.", async ({
        request,
      }) => {
        // const lockResponse = await AdjustmentUtility.lockUnlockDemandScenario(request, "unlock", demandStackId);
        // expect(lockResponse).toBeOK();
  
        const updateDSResponse = await AdjustmentUtility.updateDemandStacksData(
          request,
          demandStackId,
          demandScenarioDetails,
          sbuFilter.sbuName[0],
          sbuFilter.sbuIds[0],
          deptartmentFilter.deptName[0],
          deptartmentFilter.deptIds[0],
          channelFilter.channelName,
          channelFilter.channelIds,
          yearMonthsFormatted,
          false,
          baseForecastData
        );
        layerId = updateDSResponse[0].layerId
        expect(typeof layerId).toBe("string");
  
        const response = await AdjustmentUtility.getAllDemandScenarioForecastData(
          request,
          demandStackId,
          demandScenarioDetails,
          sbuFilter.sbuName,
          sbuFilter.sbuIds,
          deptartmentFilter.deptName,
          deptartmentFilter.deptIds,
          channelFilter.channelName,
          channelFilter.channelIds,
          yearMonths,
          [layerId]
        );
        let updatedForecast = response.forecast[0].childForecast[0].departmentForecast[0].forecast[0];
        let expectedGMV = Math.floor(baseForecastData.amount + adjustmentData.forecastUpdatePayload.gmv);
        let expectedUnits = Math.floor(baseForecastData.units + adjustmentData.forecastUpdatePayload.units);
        let expectedAUR = Math.floor(
            (baseForecastData.amount + 100)/(baseForecastData.units + 10)
        );
        expect(Math.floor(updatedForecast.units) == expectedUnits).toBe(true);
        expect(Math.floor(updatedForecast.amount) == expectedGMV).toBe(true);
        expect(Math.floor(updatedForecast.aur) == expectedAUR).toBe(true);
      });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });
  }
);
