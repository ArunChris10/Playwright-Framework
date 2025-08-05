import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/visual-indicator-api.json";
import usersData from "../constants/ufm_users.json";

test.describe(
  "Verify the visualindicator API",
  { tag: "@Smoke @Regression @visualindicator @perf @ibg-ufm-metadata-service @ibg-ufm-core-service" },
  () => {
    const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;
    Utility.logIt(endpointURL);
    const userList = usersData.users;

    userList.forEach((user) => {
      test(`FOR USER: ${user} Verify if the API is returning Actuals, forecast, and extrapolated forecast dates`, async ({
        request,
      }) => {

        // Make a GET request for the visual-indicator
        const responseBody = await test.step(
          "Make a GET request for getting updated dates",
          async () => {
            Utility.logIt("Make a GET request for getting updated dates");
            const response = await request.get(endpointURL, {

              params: { classification_id: testdatafile.classification_id },
            });
            await Utility.assertAndLog(response);
            return JSON.parse(await response.text());
          }
        );

        // Assertion
        await test.step("Check if the response has all 3 dates and their IDs", async () => {
          const datasetTypes = responseBody.map((obj: any) => obj.dataset_type);
          const ids = responseBody.map((obj: any) => obj.id);

          // Check for dataset_type
          testdatafile.visual_indicator_response.forEach((expected) => {
            expect(datasetTypes).toContainEqual(expected.dataset_type);
          });

          // Check for ids
          testdatafile.visual_indicator_response.forEach((expected) => {
            expect(ids).toContainEqual(expected.id);
          });
        });
      });
    });
  }
);
