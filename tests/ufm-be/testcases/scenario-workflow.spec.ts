import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import BAList from "../constants/PBA_SBA_List.json";
import { UfmUtility } from "../fixtures/ufm-utils";

const orgName = BAList.PBAList;
const orgName1 = [BAList.PBAList[7], BAList.PBAList[1], BAList.PBAList[0]];
const orgName2 = [BAList.PBAList[2], BAList.PBAList[4], BAList.PBAList[5]];
const orgName3 = [BAList.PBAList[3]];
const orgName4 = [BAList.PBAList[6]];

let response;

test.describe.configure({ timeout: 3_600_000, mode: "parallel" });
test.describe("Send BA", { tag: "@send_to_review" }, async () => {
  test.describe("Send to BA Review", async () => {
    for (let i = 0; i < orgName1.length; i++) {
      test(`Submit ${orgName1[i]} BA to BA Review`, async ({ request }) => {
        await UfmUtility.createAndSendToBAReview(request, orgName1[i]);
      });
    }
  });
  test.describe("Send to BA Review", async () => {
    for (let i = 0; i < orgName2.length; i++) {
      test(`Submit ${orgName2[i]} BA to BA Review`, async ({ request }) => {
        await UfmUtility.createAndSendToBAReview(request, orgName2[i]);
      });
    }
  });
  test.describe.serial("Send to BA Review", async () => {
    for (let i = 0; i < orgName3.length; i++) {
      test(`Submit ${orgName3[i]} BA to BA Review`, async ({ request }) => {
        await UfmUtility.createAndSendToBAReview(request, orgName3[i]);
      });
    }
  });
  test.describe.serial("Send to BA Review", async () => {
    for (let i = 0; i < orgName4.length; i++) {
      test(`Submit ${orgName4[i]} BA to BA Review`, async ({ request }) => {
        await UfmUtility.createAndSendToBAReview(request, orgName4[i]);
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
          await UfmUtility.changeToStatus(
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
          await UfmUtility.changeToStatus(
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
