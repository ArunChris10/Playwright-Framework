import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { AllocationUtility } from "../fixtures/allocate-utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";

const lobName = ["MARKETING", "MERCHOPS", "SCHEDULED", "LAST MILE DELIVERY"];
lobName.forEach((lobName) => {
  test.describe(
    "Verify allocate and save API",
    { tag: "@Smoke @Regression @allocate_save" },
    async () => {
      test.describe.configure({ timeout: 500_000, mode: "serial" });

      let scenarioId: number;
      let scenario_details;
      let dimId = commonData.ba_dim_id;
      let payloadbody, response, responseBody;
      let newCreated = false;

      test(`Delete all created forecast by automation user for LOB - ${lobName}`, async ({
        request,
      }) => {
        if (
          (await ForecastUtility.countOfScenario(lobName, request)) ==
          commonData.MAX_SCENARIO_COUNT
        ) {
          await ForecastUtility.deleteAllforecastofUser(
            request,
            lobName,
            process.env.ufmUser
          );
        }
      });

      test(`Verify if the user is able to create forecast for LOB - ${lobName}`, async ({
        request,
      }) => {
        //Getting current list of forecast
        scenario_details =
          await ForecastUtility.getDraftorChangeRequestforecast(
            lobName,
            request
          );

        //Creating forecast if not present
        if (scenario_details == 0 || scenario_details == undefined) {
          scenarioId = await ForecastUtility.createForecast(lobName, request);
          newCreated = true;
        } else scenarioId = scenario_details["scenarioId"];
      });

      test(`Verify if the user is able to get list of scenarios and scenario version for the LOB - ${lobName}`, async ({
        request,
      }) => {
        let currentForecast = await UfmUtility.getCurrentForecastList(
          lobName,
          request
        );
        Utility.logIt(`No of scenarios present: ${currentForecast.length}`);

        //Get scenario version from scenario id from forecast list
        scenario_details = await UfmUtility.getScenarioDetails(
          currentForecast,
          scenarioId
        );

        Utility.logIt(scenario_details["scenarioVersion"]);
      });

      test(`Verify if the user is able to allocate and save baseline for LOB - ${lobName}`, async ({
        request,
      }) => {
        const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;

        //Creating allocation request payload
        payloadbody = await AllocationUtility.allocation(
          lobName,
          scenarioId,
          commonData["Maintain Ratio"],
          request
        );

        // Calling calculate and setting preview as true
        payloadbody.preview = true;
        response = await request.post(endpointURL, {
          data: payloadbody,
        });
        responseBody = await Utility.assertAndLog(response);

        //Calling Save and setting preview as false
        payloadbody.preview = false;
        response = await request.post(endpointURL, {
          data: payloadbody,
        });

        responseBody = await Utility.assertAndLog(response);
        expect.soft(responseBody).toEqual("Saved successfully");
      });

      test(`Verify if the user is able to delete created forecast for LOB ${lobName}`, async ({
        request,
      }) => {
        if (newCreated)
          await ForecastUtility.deleteForecast(
            scenarioId,
            scenario_details["scenarioVersion"],
            dimId,
            await UfmUtility.getMapping(lobName, "dim_val_id"),
            request
          );
      });
    }
  );
});
