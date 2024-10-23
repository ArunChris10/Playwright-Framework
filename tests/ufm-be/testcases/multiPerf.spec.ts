import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import usersData from "../constants/ufm_users.json";
import testdatafile from "../testdata/visual-indicator-api.json";

test.describe(
  "Verify the visualindicator API using multi user",
  { tag: "@multiPerf" },
  () => {
    let responseBody;
    const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;
    Utility.logIt(endpointURL);
    let userList = usersData.users;
    userList.forEach((user) => {
      // let nexusTokens = await Utility.getNexusFakeToken(user, request);
      // responseBody = await request.get(endpointURL, {
      //   headers: {
      //     Authorization: nexusTokens,
      //   },
      //   params: { classification_id: testdatafile.classification_id },
      // });

      test(`Verify if the api is returning Actuals, forecast and extrapolated forecast dates for user -> ${user}`, async ({
        request,
      }) => {
        // ------------ Main Home Page ------------
        await test.step("Get metadata ", async () => {
          // https://ibgworkbench2.stg.walmart.com/api/ufm/get-metadata
        });
        await test.step("Get homedimension ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-home-dimensions
        });
        await test.step("Get homedimension ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-all-dimensions-mappings
        });
        await test.step("Get scenario configs ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-scenario-configs
        });
        await test.step("Preference api ", async () => {
          //https://nexus-wizard-manager.api.stg.walmart.com/v1/chat/application/preference?appId=ufm-v2
        });

        // ------------ Current Forecast List page ------------
        await test.step("Get current Forecast ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-current-forecast
        });
        await test.step("Get screen id ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-screenId
        });
        await test.step("Get forecast deadline date ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-forecastsDeadlineDate
        });
        await test.step("List historicals ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/list-historicals
        });
        await test.step("Get segment submission date ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-segment-submission-date
        });
        await test.step("Visual indicator api", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-visual-indicator
        });
        await test.step("Get last locked scenario ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-last-locked-scenario
        });
        await test.step("Progress tracker ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-progress-tracker
        });
        await test.step("Mappings ", async () => {
          //https://ibg-ufm-core-service.stg.ibg.walmart.com/metadata/dimensions/mappings?dim_val_id=120003&dim_id=12&classification_id=12
        });
        await test.step("Canned Report Get Reports ", async () => {
          //https://ibg-ufm-canned-reports.stg.walmart.com/api/canned-reports/get-report
        });
        await test.step("Individual status ", async () => {
          //https://ibg-ufm-canned-reports.stg.walmart.com/api/workflow/individual-status
        });
        await test.step("Filter data dimension basis ", async () => {
          //https://ibg-shared-ui.stg.walmart.com/api/ufm/filters/get-filter-data
        });
        await test.step("Filter data lob/BA basis ", async () => {
          //https://ibg-shared-ui.stg.walmart.com/api/ufm/filters/get-filter-data
        });

        // ------------ Create Forecast ------------
        await test.step("Get base Forecast ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-base-forecast
        });
        await test.step("Create Forecast ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/create-forecast
        });
        await test.step("Get current Forecast ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-current-forecast
        });
        await test.step("Progress tracker ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/get-progress-tracker
        });

        // ------------ KPI Landing page ------------
        await test.step("Filter data lob basis ", async () => {});
        await test.step("Mappings ", async () => {
          //https://ibg-ufm-core-service.stg.ibg.walmart.com/metadata/dimensions/mappings?dim_val_id=110019&dim_id=11&classification_id=12
        });
        await test.step("Drivers ", async () => {
          //https://ibg-ufm-core-service.stg.ibg.walmart.com/metadata/drivers
        });

        // ------------ Add drivers ------------
        await test.step("Get KPI List with driver loaded", async () => {
          // https://ibgworkbench2.stg.walmart.com/api/ufm/get-kpiforecastList
        });

        // ------------ Allocation ------------
        await test.step("Allocate Calculation ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/allocate-data
        });
        await test.step("Allocate Save ", async () => {
          //https://ibgworkbench2.stg.walmart.com/api/ufm/allocate-data
        });
        await test.step("Get KPI ", async () => {
          // https://ibgworkbench2.stg.walmart.com/api/ufm/get-kpiforecastList
        });
      });
    });
  }
);
