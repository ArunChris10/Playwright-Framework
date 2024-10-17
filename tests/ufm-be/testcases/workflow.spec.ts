import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import BAList from "../constants/PBA_SBA_List.json";
import { UfmUtility } from "../fixtures/ufm-utils";

const orgName = BAList.PBAList[7];

let response, scenario_details;

test.describe.configure({ timeout: 3_600_000, mode: "serial" });
test.describe(
  "Verify complete scenario workflow",
  { tag: "@e2e_workflow" },
  async () => {
    //Sending to BA review
    test(`Submit ${orgName} LOB to BA Review`, async ({ request }) => {
      await UfmUtility.createAndSendToBAReview(request, orgName);
    });
    //Change Request from BA screen
    test(`Submit ${orgName} LOB to Change Request from BA screen`, async ({
      request,
    }) => {
      await UfmUtility.changeRequest(request, orgName, 1);
    });
    // //Sending to BA review
    test(`Submit ${orgName} LOB to BA Review`, async ({ request }) => {
      let currentForecastList = await UfmUtility.getCurrentForecastList(
        orgName,
        request
      );
      await UfmUtility.changeToStatus(
        scenario_details["scenarioId"],
        scenario_details["scenarioVersion"],
        commonData.BA_Review,
        commonData.lob_dim_id,
        await UfmUtility.getMapping(orgName, "dim_val_id"),
        request
      );
    });

    //Recall LOB from BA Review
    test(`Recall LOB to Change Request from BA review`, async ({ request }) => {
      await UfmUtility.changeToStatus(
        response.scenarioId,
        response.scenarioVersion,
        commonData.Draft,
        commonData.lob_dim_id,
        await UfmUtility.getMapping(orgName, "dim_val_id"),
        request
      );
    });

    //Sending to BA review
    test(`Submit ${orgName} LOB to BA Review`, async ({ request }) => {
      await UfmUtility.createAndSendToBAReview(request, orgName);
    });
    // Sending To Segment review
    test(`Send BA ${orgName} to Segment review  `, async ({ request }) => {
      //Getting Status of BA
      response = await UfmUtility.getIndividualstatus(orgName, request);
      //Cheking if status is in BA review, then sending to Segment Review
      if (response.forecastStatus == commonData.BA_Review) {
        let org = await orgName;
        await UfmUtility.changeToStatus(
          response.scenarioId,
          response.scenarioVersion,
          commonData.Segment_Review,
          commonData.ba_dim_id,
          await UfmUtility.getMapping(org, "dim_val_id", "PBA"),
          request
        );
        Utility.logIt(`Sent ${orgName} to Segment Review`);
      } else {
        Utility.logIt(`${orgName} is not in BA Review`);
      }
    });
    //Change Request from Segment review
    test(`Submit ${orgName} LOB to Change Request from segment screen`, async ({
      request,
    }) => {
      await UfmUtility.changeRequest(request, orgName, 1);
    });
  }
);
