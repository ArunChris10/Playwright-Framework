import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';

test.describe("Verify Select DataScience scenario view shows list of all  DS Forecasts with radio buttons && Verify  User should be able to switch between Forecast scenarios by selecting a DS forecast", { tag: "@Regression @verifyDifferentForecasts @ibg-service-scenario-financials @DemandOutput" }, () => {

  let demandId;
  let forecastInfoResponseBody;

  test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify is user can see different scenarios", async ({
    request
  }) => {
    await test.step("Verify Select DataScience scenario view shows list of all  DS Forecasts with radio buttons", async () => {
        let forecastInfoResponse;
        forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);

        forecastInfoResponseBody = await forecastInfoResponse.json();

        forecastInfoResponseBody.forEach((forecastInfo) => {
            testDataFileManageRebase.expectedValuesForForecastInfoList.forEach((value) => {
                expect(forecastInfo[value]).toBeDefined();
            })
        });
    })

    await test.step("Verify  User should be able to switch between Forecast scenarios by selecting a DS forecast", async () => {
        let switchBaseDSResponse;
        let forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;

        // Before switching forecast, fetch the forecast version of the new demand stack forecast and store it
        let forecastVersionForSwitchDS;
        if (forecastVersion == forecastInfoResponseBody[0].version) {
          forecastVersionForSwitchDS = forecastInfoResponseBody[1].version;
        } else {
          forecastVersionForSwitchDS = forecastInfoResponseBody[0].version;
        }

        // Get the layerId of the forecast version of the new demand stack forecast
        let forecastLayerIdAfterRebase;
        forecastInfoResponseBody.forEach(function (forecastInfo) {
          if (forecastInfo.version == forecastVersionForSwitchDS) {
            forecastLayerIdAfterRebase = forecastInfo.forecastLayerId;
          }
        });

        switchBaseDSResponse = await ManageRebaseUtility.switchBaseDSResponse(
          request,
          demandId,
          forecastVersionForSwitchDS
        );

        // Wait until the job is completed
        let jobCompletionStatus;
        jobCompletionStatus = await CdfUtility.checkClonedJobStatus(
          request,
          demandId
        );

        // Get the demand scenario details after rebase using `get-demand-scenario-forecast` api
        let getDemandScenarioForecastResponseAfterRebase;

        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterBaseDSRebase.version = forecastVersionForSwitchDS;
        testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterBaseDSRebase.layerIds[0] = forecastLayerIdAfterRebase;

        getDemandScenarioForecastResponseAfterRebase =
          await ManageRebaseUtility.getDemandScenarioForecast(
            request,
            demandId,
            testDataFileManageRebase.endpointForGetDemandScenarioForecast,
            testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterBaseDSRebase
          );

        expect(getDemandScenarioForecastResponseAfterRebase).toBeOK();

        let getDemandScenarioForecastResponseBodyAfterRebase = await getDemandScenarioForecastResponseAfterRebase.json();

        expect (getDemandScenarioForecastResponseBodyAfterRebase).toBeDefined();
    })
  });
})