import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import BAList from "../constants/PBA_SBA_List.json";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";

const orgName = BAList.PBAList;
const orgName1 = [BAList.PBAList[7], BAList.PBAList[1], BAList.PBAList[0]];
const orgName2 = [BAList.PBAList[2], BAList.PBAList[4], BAList.PBAList[5]];
const orgName3 = [BAList.PBAList[3]];
const orgName4 = [BAList.PBAList[6]];

let scenarioId, scenario_details;
let response;
let lobName: string;

test.describe.configure({ timeout: 3_600_000, mode: "parallel" });
test.describe("Send BA", { tag: "@send_to_review" }, async () => {
  test.describe("Send to BA Review", async () => {
    for (let i = 0; i < orgName1.length; i++) {
      test(`Submit ${orgName1[i]} BA to BA Review`, async ({ request }) => {
        await createAndSendToBAReview(request, orgName1[i]);
      });
    }
  });
  test.describe("Send to BA Review", async () => {
    for (let i = 0; i < orgName2.length; i++) {
      test(`Submit ${orgName2[i]} BA to BA Review`, async ({ request }) => {
        await createAndSendToBAReview(request, orgName2[i]);
      });
    }
  });
  test.describe.serial("Send to BA Review", async () => {
    for (let i = 0; i < orgName3.length; i++) {
      test(`Submit ${orgName3[i]} BA to BA Review`, async ({ request }) => {
        await createAndSendToBAReview(request, orgName3[i]);
      });
    }
  });
  test.describe.serial("Send to BA Review", async () => {
    for (let i = 0; i < orgName4.length; i++) {
      test(`Submit ${orgName4[i]} BA to BA Review`, async ({ request }) => {
        await createAndSendToBAReview(request, orgName4[i]);
      });
    }
  });
});

// Sending To Segment review
test.describe.configure({ timeout: 2_100_000 });
test.describe.serial(
  `Send BA to Segment review `,
  { tag: "@send_to_segment_review" },
  async () => {
    for (let i = 0; i < orgName.length; i++) {
      //Sending To Segment review
      test(`Send BA ${orgName[i]} to Segment review  `, async ({ request }) => {
        //Getting Status of BA
        response = await UfmUtility.getIndividualstatus(orgName[i], request);
        //Cheking if status is in BA review, then sending to Segment Review
        if (response.forecastStatus == commonData.BA_Review) {
          let org = await orgName[i];
          await UfmUtility.sendToReview(
            response.scenarioId,
            response.scenarioVersion,
            commonData.Segment_Review,
            commonData.ba_dim_id,
            await UfmUtility.getMapping(org, "dim_val_id", "PBA"),
            request
          );
          Utility.logIt(`Sent ${orgName[i]} to Segment Review`);
        }
      });
    }
  }
);

//Change Request from Segment review
test.describe(
  `Change Request from Segment Review`,
  { tag: "@changerequest" },
  () => {
    test.describe.configure({ timeout: 360_000, mode: "serial" });
    let response;

    test(`Get scenario tracker for Segment Finance `, async ({ request }) => {
      response = await UfmUtility.getProgresstracker(
        "Segment_Finance",
        request
      );
    });

    test(`Send to Change requested`, async ({ request }) => {
      for (let i = 0; i < response.rowData.length; i++) {
        if (response.rowData[i].forecastStatus == commonData.Segment_Review) {
          console.log(
            response.rowData[i].organization,
            response.rowData[i].forecastStatus
          );
          await UfmUtility.sendToReview(
            response.rowData[i].scenarioId,
            response.rowData[i].scenarioVersion,
            commonData.Change_Requested,
            commonData.Segment_Finance.dim_id,
            commonData.Segment_Finance.dim_val_id,
            request
          );
          Utility.logIt(
            `Change request Successful for Org Id - ${response.rowData[i].organization}`
          );
        }
      }
    });
  }
);

export async function createAndSendToBAReview(request, orgName) {
  //Getting Status of all LOB of an Org by progress tracker
  response = await UfmUtility.getProgresstracker(orgName, request);
  Utility.logIt(response.rowData.length);
  for (let j = 0; j < response.rowData.length; j++) {
    let dim_val_id = response.rowData[j].lineOfBusiness;
    lobName = await UfmUtility.getMapping(dim_val_id, "childName");
    Utility.logIt(lobName);

    //checking if status is Not started or draft , then deleting all other and creating new forecast
    if (
      response.rowData[j].forecastStatus != commonData.Segment_Review &&
      response.rowData[j].forecastStatus != commonData.BA_Review
    ) {
      //Deleting forecast created by logged in user
      await ForecastUtility.deleteAllforecastofUser(
        request,
        lobName,
        process.env.ufmUser
      );
      //Creating forecast
      scenarioId = await ForecastUtility.createForecast(lobName, request);

      //Getting current list of forecast
      let currentForecastList = await UfmUtility.getCurrentForecastList(
        lobName,
        request
      );

      //Getting scenario version of created forecast
      scenario_details = await UfmUtility.getScenarioDetails(
        currentForecastList,
        scenarioId
      );

      //Sending created forecast to BA review
      await UfmUtility.sendToReview(
        scenarioId,
        scenario_details["scenarioVersion"],
        commonData.BA_Review,
        commonData.lob_dim_id,
        await UfmUtility.getMapping(lobName, "dim_val_id"),
        request
      );
      Utility.logIt(`Sent ${lobName} to BA Review`);
    }
  }
}
