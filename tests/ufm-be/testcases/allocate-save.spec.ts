import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { AllocationUtility } from "../fixtures/allocate-utils";
import { UfmUtility } from "../fixtures/ufm-utils";

const lobName = ["marketing"];
for (let i = 0; i < lobName.length; i++) {
  test.describe(
    "Verify allocate and save API",
    { tag: "@Smoke @Regression @allocate_save" },
    async () => {
      test.describe.configure({ timeout: 500_000, mode: "serial" });

      let scenarioId: number;
      let scenario_details;
      let dimId = commonData.ba_dim_id;
      let dimValId = commonData[lobName[i]].dim_val_id;
      let payloadbody, response, responseBody;

      test(`Delete all created forecast by automation user for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        await UfmUtility.deleteAllforecastofUser(
          request,
          lobName[i],
          process.env.ufmUser
        );
      });

      test(`Verify if the user is able to create forecast for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        scenarioId = await UfmUtility.createForecast(lobName[i], request);
      });

      test(`Verify if the user is able to get list of scenarios and scenario version for the LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        let currentForecast = await UfmUtility.getCurrentForecastList(
          lobName[i],
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

      test(`Verify if the user is able to allocate and save baseline for LOB - ${lobName[i]}`, async ({
        request,
      }) => {
        const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;

        //Creating allocation request payload
        payloadbody = await AllocationUtility.allocation(
          lobName[i],
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

      test(`Verify if the user is able to delete created forecast for LOB ${lobName[i]}`, async ({
        request,
      }) => {
        await UfmUtility.deleteForecast(
          scenarioId,
          scenario_details["scenarioVersion"],
          dimId,
          dimValId,
          request
        );
      });
    }
  );
}
