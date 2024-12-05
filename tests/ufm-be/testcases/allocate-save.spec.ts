import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { AllocationUtility } from "../fixtures/allocate-utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";

const lobList = [
  "INSTORE AND OTHER",
  "SCHEDULED",
  "UNSCHEDULED AND CORE",
  "LAST MILE DELIVERY",
];
lobList.forEach((lobName) => {
  let scenario_details;
  let payloadbody, response, responseBody;
  let isNewCreated = false;

  test.describe(
    "Verify allocate and save API",
    { tag: "@Smoke @Regression @allocate_save" },
    async () => {
      test.describe.configure({ timeout: 500_000, mode: "serial" });

      test(`Getting or creating forecast for LOB - ${lobName}`, async ({
        request,
      }) => {
        if (
          (await ForecastUtility.countOfScenario(
            lobName,
            process.env.ufmUser,
            request
          )) >= commonData.MAX_SCENARIO_COUNT
        ) {
          await ForecastUtility.deleteAllforecastofUser(
            request,
            lobName,
            process.env.ufmUser
          );
        }
        //Getting forecast details
        [scenario_details, isNewCreated] =
          await ForecastUtility.getOrCreateForecastIfNotExists(
            lobName,
            request
          );
      });

      test(`Verify if the user is able to allocate and save baseline for LOB - ${lobName}`, async ({
        request,
      }) => {
        const endpointURL = `${process.env.apiBaseURLUFM}/allocate-data`;

        //Creating allocation request payload
        payloadbody = await AllocationUtility.allocation(
          lobName,
          scenario_details["scenarioId"],
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

      test(`Teardown for deleting forecast for lob - ${lobName}`, async ({
        request,
      }) => {
        if (isNewCreated)
          await ForecastUtility.deleteForecast(
            scenario_details["scenarioId"],
            scenario_details["scenarioVersion"],
            commonData.ba_dim_id,
            await UfmUtility.getMapping(lobName, "dim_val_id"),
            request
          );
      });
    }
  );
});
