import { test } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../fixtures/ufm-utils";
import commonData from "../testdata/common.json";

let orgName = [
  // "BA_Merch",
  // "H&W",
  // "CUSTOMER & REVENUE",
  // "BA_Operations",
  // "Supply Chain",
  // "BA_Segment",
  "BA_Ecomm",
];
let lobName: string;

orgName.forEach((orgName) => {
  test.describe(
    `Submit ${orgName} BAs to Segment Review`,
    { tag: "@sendtoreview" },
    async () => {
      test.describe.configure({ timeout: 600_000, mode: "serial" });
      let scenario_id, scenario_version, response;

      test(`Send ${orgName} to BA review`, async ({ request }) => {
        console.log(`Get scenario progress tracker`);

        await test.step(`Get scenario and send to BA review if not already`, async () => {
          response = await UfmUtility.getProgresstracker(orgName, request);

          response.rowData.forEach((rowData) => {
            //checking if status is Not started or draft , then creating forecast
            console.log("inside for each");
            if (rowData.forecastStatus != 22 && rowData.forecastStatus != 23) {
              console.log("inside if");
              let dim_val_id = rowData.lineOfBusiness;
              lobName = commonData[dim_val_id];
              lobName = lobName.toLowerCase();
              scenario_id = UfmUtility.createForecast(lobName, request);

              let currentForecastList = UfmUtility.getCurrentForecastList(
                lobName,
                request
              );
              scenario_version = UfmUtility.getScenarioVersion(
                currentForecastList,
                scenario_id
              );
              UfmUtility.sendToReview(
                scenario_id,
                scenario_version,
                commonData.BA_Review,
                commonData.lob_dim_id,
                commonData[lobName].dim_val_id,
                request
              );
              console.log(`Sent ${lobName} to BA Review`);
            }
          });
        });

        await test.step(`Send BA ${orgName} to Segment review  `, async () => {
          let response = await UfmUtility.getIndividualstatus(orgName, request);
          if (response.forecastStatus == 22) {
            await UfmUtility.sendToReview(
              response.scenario_id,
              response.scenario_version,
              commonData.Segment_Review,
              commonData.ba_dim_id,
              commonData[orgName].dim_val_id,
              request
            );
            console.log(`Sent to Segment Review - ${orgName}`);
          }
        });
      });
    }
  );
});
