import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { ManageRebaseUtility } from "../fixtures/manage-rebase-utils";
import testDataFileManageRebase from "../testdata/manage-rebase.json";
import testDataGetDemandForecast from "../testdata/allocation-layer-generate-preview.json";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import testdata from "../testdata/percentage-to-absolute.json";

test.describe(
  "Verify Net Move Values is saved and displayed when user opens an EMT Layer",
  {
    tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT",
  },
  () => {
    let demandId;
    let forecastVersion;
    const metrics = testdata.metrics;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify net moves value is updated on percentage change", async ({
      request,
    }) => {
      await test.step("Fetch the forecast version for the demand stack", async () => {
        forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;
      });

      let getDemandScenarioForecastResponse;
      let getDemandScenarioForecastResponseBody;
      let absoluteBody;

      testDataGetDemandForecast.payloadForGetDemandScenarioForecast.version =
        forecastVersion;
      testDataGetDemandForecast.payloadForGetDemandScenarioForecast.layerIds =
        [];
      testDataGetDemandForecast.payloadForGetDemandScenarioForecast.baseChannel =
        [];
      testDataGetDemandForecast.payloadForGetDemandScenarioForecast.baseChannelIds =
        [];

      await test.step("Fetch the get-demand-scenario-forecast initially for channel view", async () => {
        getDemandScenarioForecastResponse =
          await ManageRebaseUtility.getDemandScenarioForecast(
            request,
            demandId,
            testDataFileManageRebase.endpointForGetDemandScenarioForecast,
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast
          );

        getDemandScenarioForecastResponseBody =
          await getDemandScenarioForecastResponse.json();
      });

      await test.step("Get value from percentage Channel and verify it is correct for all metrics", async () => {
        for (const metric of metrics) {
          testdata.payloadCHANNEL.allocationType = metric[0];
          absoluteBody = await AdjustmentUtility.percentageToAbsolute(
            request,
            demandId,
            testdata.payloadCHANNEL,
            testdata.endpoint
          );
          const forecast = getDemandScenarioForecastResponseBody.forecast;
          for (const forecastItem of forecast) {
            const channelId = forecastItem.baseChannelId;
            const channelPayload = testdata.payloadCHANNEL.baseChannels.find(
              (sbu) => sbu.id === channelId
            );
            const channelResultant = absoluteBody.baseChannels.find(
              (channel) => channel.id === channelId
            );
            expect(Math.round(channelResultant.value)).toBe(
              Math.round(
                forecastItem.forecast[0][metric[1]] *
                  (channelPayload?.value || 0)
              )
            );
          }
        }
      });

      await test.step("Fetch the get-demand-scenario-forecast initially for sbu view", async () => {
        testDataGetDemandForecast.payloadForGetDemandScenarioForecast.organizationalLevel =
          "SBU";
        getDemandScenarioForecastResponse =
          await ManageRebaseUtility.getDemandScenarioForecast(
            request,
            demandId,
            testDataFileManageRebase.endpointForGetDemandScenarioForecast,
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast
          );

        getDemandScenarioForecastResponseBody =
          await getDemandScenarioForecastResponse.json();
      });

      await test.step("Get value from percentage SBU and verify it is correct for all metrics", async () => {
        for (const metric of metrics) {
          testdata.payloadSBU.allocationType = metric[0];
          absoluteBody = await AdjustmentUtility.percentageToAbsolute(
            request,
            demandId,
            testdata.payloadSBU,
            testdata.endpoint
          );
          const forecast = getDemandScenarioForecastResponseBody.forecast;
          for (const forecastItem of forecast) {
            const sbuId = forecastItem.sbuId;
            const sbuPayload = testdata.payloadSBU.sbus.find(
              (sbu) => sbu.id === sbuId
            );
            const sbuResultant = absoluteBody.sbus.find(
              (sbu) => sbu.id === sbuId
            );
            expect(Math.round(sbuResultant.value)).toBe(
              Math.round(
                forecastItem.forecast[0][metric[1]] * (sbuPayload?.value || 0)
              )
            );
          }
        }
      });

      await test.step("Fetch the get-demand-scenario-forecast initially for department view", async () => {
        testDataGetDemandForecast.payloadForGetDemandScenarioForecast.organizationalLevel =
          "DEPARTMENT";
        getDemandScenarioForecastResponse =
          await ManageRebaseUtility.getDemandScenarioForecast(
            request,
            demandId,
            testDataFileManageRebase.endpointForGetDemandScenarioForecast,
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast
          );

        getDemandScenarioForecastResponseBody =
          await getDemandScenarioForecastResponse.json();
      });

      await test.step("Get value from percentage DEPARTMENT and verify it is correct for all metrics", async () => {
        for (const metric of metrics) {
          testdata.payloadDEPARTMENT.allocationType = metric[0];
          absoluteBody = await AdjustmentUtility.percentageToAbsolute(
            request,
            demandId,
            testdata.payloadDEPARTMENT,
            testdata.endpoint
          );
          const forecast = getDemandScenarioForecastResponseBody.forecast;
          for (const forecastItem of forecast) {
            const departmentId = forecastItem.departmentId;
            const departmentPayload =
              testdata.payloadDEPARTMENT.departments.find(
                (department) => department.id === departmentId
              );
            const departmentResultant = absoluteBody.departments.find(
              (department) => department.id === departmentId
            );

            const expected =
              forecastItem.forecast[0][metric[1]] *
              (departmentPayload?.value || 0);
            const actual = departmentResultant.value;
            const allowedDiff = 1;
            const diff = Math.abs(Math.round(actual) - Math.round(expected));
            expect(diff <= allowedDiff).toBe(true);
          }
        }
      });
    });
  }
);
