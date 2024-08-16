import { test } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../fixtures/ufm-utils";
import commonData from "../testdata/common.json";

let lobName: string;
let response;
let orgName = [
  "BA_Merch",
  "H&W",
  "CUSTOMER & REVENUE",
  "BA_Operations",
  "Supply Chain",
  "BA_Segment",
  "BA_Ecomm",
];

for (let i = 0; i < orgName.length; i++) {
  test.describe(
    `Submit ${orgName[i]} BAs to Segment Review`,
    { tag: "@sendtoreview" },
    async () => {
      test.describe.configure({ timeout: 3_600_000, mode: "serial" });
      let scenario_id, scenario_version;

      test(`Get scenario tracker for ${orgName[i]} BA `, async ({
        request,
      }) => {
        response = await UfmUtility.getProgresstracker(orgName[i], request);
      });

      test(`Send ${orgName[i]} to BA review`, async ({ request }) => {
        console.log(response.rowData.length);
        for (let j = 0; j < response.rowData.length; j++) {
          let dim_val_id = response.rowData[j].lineOfBusiness;
          lobName = commonData[dim_val_id];
          lobName = lobName.toLowerCase();
          console.log(lobName);
          //checking if status is Not started or draft , then creating forecast
          if (
            response.rowData[j].forecastStatus != commonData.Segment_Review &&
            response.rowData[j].forecastStatus != commonData.BA_Review
          ) {
            // console.log("inside if");

            scenario_id = await UfmUtility.createForecast(lobName, request);

            let currentForecastList = await UfmUtility.getCurrentForecastList(
              lobName,
              request
            );
            scenario_version = await UfmUtility.getScenarioVersion(
              currentForecastList,
              scenario_id
            );

            //Sending created forecast to BA review
            await UfmUtility.sendToReview(
              scenario_id,
              scenario_version,
              commonData.BA_Review,
              commonData.lob_dim_id,
              commonData[lobName].dim_val_id,
              request
            );
            console.log(`Sent ${lobName} to BA Review`);
          }
        }
      });

      //Sending To Segment review
      test(`Send BA ${orgName[i]} to Segment review  `, async ({ request }) => {
        response = await UfmUtility.getIndividualstatus(orgName[i], request);
        if (response.forecastStatus == commonData.BA_Review) {
          let org = await orgName[i];
          await UfmUtility.sendToReview(
            response.scenarioId,
            response.scenarioVersion,
            commonData.Segment_Review,
            commonData.ba_dim_id,
            commonData[org].dim_val_id,
            request
          );
          console.log(`Sent ${orgName[i]} to Segment Review`);
        }
      });
    }
  );
}
