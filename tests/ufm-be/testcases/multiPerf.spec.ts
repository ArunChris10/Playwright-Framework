import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import usersData from "../constants/ufm_users.json";
import { UfmPerfUtility } from "../fixtures/multiPerf-utils";
import BAList from "../constants/PBA_SBA_List.json";

const lobName = [
  "E2E DELIVERY",
  "LAST MILE DELIVERY",
  "CORE_SERVICES",
  "CONNECT",
  "OPERATIONS",
];
for (let i = 0; i < lobName.length; i++) {
  test.describe(
    "Verify API performance using multi user ",
    { tag: "@multiPerf @perf" },
    () => {
      let userList = usersData.users;

      userList.forEach(async (user) => {
        test(`Verify the multiple APIs are working fine for multiple user -> ${user} in LOB: ${lobName[i]}`, async ({
          request,
        }) => {
          let nexusTokens = await Utility.getNexusFakeToken(user, request);
          test.setTimeout(600000);
          await test.step("Get metadata ", async () => {
            await UfmPerfUtility.getApiData(request, nexusTokens, "metadata");
          });
          await test.step("Get homedimension ", async () => {
            await UfmPerfUtility.getApiData(
              request,
              nexusTokens,
              "homedimension"
            );
          });
          await test.step("Get scenario configs ", async () => {
            await UfmPerfUtility.getConfig(request, nexusTokens);
          });
          await test.step("Preference api ", async () => {
            // await UfmPerfUtility.userPreference(request,nexusTokens);
          });
          // ------------ Current Forecast List page ------------
          await test.step("Get current Forecast ", async () => {
            await UfmPerfUtility.getCurrentForecast(
              request,
              nexusTokens,
              lobName[i]
            );
          });
          await test.step("Get screen id ", async () => {
            await UfmPerfUtility.getScreenDetails(request, nexusTokens);
          });
          await test.step("Get forecast deadline date ", async () => {
            await UfmPerfUtility.getDeadlineDate(request, nexusTokens);
          });
          // await test.step("List historicals ", async () => {
          //   //https://ibgworkbench2.stg.walmart.com/api/ufm/list-historicals
          // });
          // await test.step("Get segment submission date ", async () => {
          // //   //https://ibgworkbench2.stg.walmart.com/api/ufm/get-segment-submission-date
          // });
          await test.step("Visual indicator api", async () => {
            await UfmPerfUtility.getVisualIndicator(request, nexusTokens);
          });
          await test.step("Get last locked scenario ", async () => {
            await UfmPerfUtility.getLastLocked(request, nexusTokens);
          });
          await test.step("Progress tracker ", async () => {
            await UfmPerfUtility.getProgressStatusTracker(
              "Segment_Finance",
              request,
              nexusTokens
            );
          });
          await test.step("Mappings ", async () => {
            await UfmPerfUtility.getMappingDetails(request, nexusTokens);
          });
          // await test.step("Canned Report Get Reports ", async () => {
          //   //https://ibg-ufm-canned-reports.stg.walmart.com/api/canned-reports/get-report
          // });
          await test.step("Individual status ", async () => {
            const orgName = BAList.PBAList[7];
            await UfmPerfUtility.getTheIndividualstatus(
              orgName,
              request,
              nexusTokens
            );
            //https://ibg-ufm-canned-reports.stg.walmart.com/api/workflow/individual-status
          });
          // await test.step("Filter data dimension basis ", async () => {
          //   //https://ibg-shared-ui.stg.walmart.com/api/ufm/filters/get-filter-data
          // });
          // await test.step("Filter data lob/BA basis ", async () => {
          //   //https://ibg-shared-ui.stg.walmart.com/api/ufm/filters/get-filter-data
          // });

          // ------------ Create Forecast ------------
          await test.step(`Get base Forecast for ${lobName[i]}`, async () => {
            await UfmPerfUtility.getBaseForecast(
              lobName[i],
              request,
              nexusTokens
            );
          });
          await test.step(`Create Forecast for ${lobName[i]}`, async () => {
            await UfmPerfUtility.deleteTheForecastForParticularLob(
              request,
              nexusTokens,
              lobName[i],
              user
            );

            await UfmPerfUtility.getCreateForecast(
              request,
              nexusTokens,
              lobName[i]
            );
          });
          await test.step("Get current Forecast ", async () => {
            //https://ibgworkbench2.stg.walmart.com/api/ufm/get-current-forecast
          });
          // await test.step("Progress tracker ", async () => {
          //   //https://ibgworkbench2.stg.walmart.com/api/ufm/get-progress-tracker
          // });

          // // ------------ KPI Landing page ------------
          // await test.step("Filter data lob basis ", async () => { });
          await test.step("Mappings ", async () => {
            await UfmPerfUtility.getFilterMappingDetails(request, nexusTokens);
          });
          await test.step(`Drivers ${lobName}`, async () => {
            await UfmPerfUtility.getInputNodes(
              lobName[i],
              request,
              nexusTokens
            );
          });

          // // //   // ------------ Add drivers ------------
          await test.step("Get KPI List with driver loaded", async () => {
            await UfmPerfUtility.getKpiForecastList(request, nexusTokens);
          });

          //   // ------------ Allocation ------------
          //   await test.step("Allocate Calculation ", async () => {
          //     //https://ibgworkbench2.stg.walmart.com/api/ufm/allocate-data
          //   });
          //   await test.step("Allocate Save ", async () => {
          //     //https://ibgworkbench2.stg.walmart.com/api/ufm/allocate-data
          //   });
          //   await test.step("Get KPI ", async () => {
          //     // https://ibgworkbench2.stg.walmart.com/api/ufm/get-kpiforecastList
          //   });
          // });
        });
      });
    }
  );
}
