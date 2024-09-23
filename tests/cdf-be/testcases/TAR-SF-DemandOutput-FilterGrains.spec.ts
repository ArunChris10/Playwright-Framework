import { debug } from "debug";
import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import testData from "../testdata/adjustment-layer-data.json";

test.describe(
  "Verify user can filter the view at any of the defined grains.",
  {
    tag: "@Regression @ibg-service-scenario-financials @verifyDSOutputFiltersGrains",
  },
  () => {
    let demandStackId, demandScenarioDetails;
    test.describe.configure({ mode: "serial" });
    test.beforeAll(async ({ request }) => {
      demandStackId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await DemandBaseClass.getDemandStackDetails(
        request,
        demandStackId
      );
    });

    test("Verify Channel filter in Month View", async ({ request }) => {
      const response = await DemandBaseClass.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "MONTH",
        "BASE_CHANNEL",
        [],
        testData.channelFilter.channelName,
        testData.channelFilter.channelIds
      );
      debug.log(response);
      expect(response.forecast).toHaveLength(1);
      expect(response.forecast[0].baseChannel).toEqual(
        testData.channelFilter.channelName[0]
      );
      expect(response.forecast[0].baseChannelId).toEqual(
        testData.channelFilter.channelIds[0]
      );
      expect(response.forecast[0].forecast[0].month).toBeDefined();
      expect(typeof response.forecast[0].forecast[0].month).toBe("number");
    });

    test("Verify Channel filter in Quarter View", async ({ request }) => {
      const response = await DemandBaseClass.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "QUARTER",
        "BASE_CHANNEL",
        [],
        testData.channelFilter.channelName,
        testData.channelFilter.channelIds
      );
      debug.log(response);
      expect(response.quarterlyForecast).toHaveLength(1);
      expect(response.quarterlyForecast[0].baseChannel).toEqual(
        testData.channelFilter.channelName[0]
      );
      expect(response.quarterlyForecast[0].baseChannelId).toEqual(
        testData.channelFilter.channelIds[0]
      );
      expect(response.quarterlyForecast[0].forecast[0].month).toBeUndefined();
      expect(typeof response.quarterlyForecast[0].forecast[0].quarter).toBe("number");
    });

    test("Verify Channel filter in Year View", async ({ request }) => {
      const response = await DemandBaseClass.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "YEAR",
        "BASE_CHANNEL",
        [],
        testData.channelFilter.channelName,
        testData.channelFilter.channelIds
      );
      debug.log(response);
      expect(response.yearlyForecast).toHaveLength(1);
      expect(response.yearlyForecast[0].baseChannel).toEqual(
        testData.channelFilter.channelName[0]
      );
      expect(response.yearlyForecast[0].baseChannelId).toEqual(
        testData.channelFilter.channelIds[0]
      );
      expect(response.yearlyForecast[0].forecast[0].month).toBeUndefined();
      expect(response.yearlyForecast[0].forecast[0].quarter).toBeUndefined();
      expect(typeof response.yearlyForecast[0].forecast[0].year).toBe("number");
    });

    test("Verify SBU and department filter in Month View", async ({
      request,
    }) => {
      const response = await DemandBaseClass.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "MONTH",
        "SBU",
        [],
        [],
        [],
        testData.sbuFilter.sbuName,
        testData.sbuFilter.sbuIds,
        testData.deptartmentFilter.deptName,
        testData.deptartmentFilter.deptIds
      );
      debug.log(response);
      expect(response.forecast).toHaveLength(1);
      expect(response.forecast[0].sbu).toEqual(testData.sbuFilter.sbuName[0]);
      expect(response.forecast[0].sbuId).toEqual(testData.sbuFilter.sbuIds[0]);
      expect(response.forecast[0].forecast[0].month).toBeDefined();
      expect(typeof response.forecast[0].forecast[0].month).toBe("number");
    });

    test("Verify SBU and department filter in Quarter View", async ({
      request,
    }) => {
      const response = await DemandBaseClass.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "QUARTER",
        "SBU",
        [],
        [],
        [],
        testData.sbuFilter.sbuName,
        testData.sbuFilter.sbuIds,
        testData.deptartmentFilter.deptName,
        testData.deptartmentFilter.deptIds
      );
      debug.log(response);
      expect(response.quarterlyForecast).toHaveLength(1);
      expect(response.quarterlyForecast[0].sbu).toEqual(testData.sbuFilter.sbuName[0]);
      expect(response.quarterlyForecast[0].sbuId).toEqual(testData.sbuFilter.sbuIds[0]);
      expect(response.quarterlyForecast[0].forecast[0].month).toBeUndefined();
      expect(typeof response.quarterlyForecast[0].forecast[0].quarter).toBe("number");
    });

    test("Verify SBU and department filter in Year View", async ({
      request,
    }) => {
      const response = await DemandBaseClass.getDemandScenarioForecast(
        request,
        demandStackId,
        demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        "YEAR",
        "SBU",
        [],
        [],
        [],
        testData.sbuFilter.sbuName,
        testData.sbuFilter.sbuIds,
        testData.deptartmentFilter.deptName,
        testData.deptartmentFilter.deptIds
      );
      debug.log(response);
      expect(response.yearlyForecast).toHaveLength(1);
      expect(response.yearlyForecast[0].sbu).toEqual(testData.sbuFilter.sbuName[0]);
      expect(response.yearlyForecast[0].sbuId).toEqual(testData.sbuFilter.sbuIds[0]);
      expect(response.yearlyForecast[0].forecast[0].month).toBeUndefined();
      expect(response.yearlyForecast[0].forecast[0].quarter).toBeUndefined();
      expect(typeof response.yearlyForecast[0].forecast[0].year).toBe("number");
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });
  }
);
