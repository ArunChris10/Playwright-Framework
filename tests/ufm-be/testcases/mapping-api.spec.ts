import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/mapping-api.json";
import usersData from "../constants/ufm_users.json";

test.describe(
  "Validating the dimension mapping details",
  { tag: "@Smoke @Regression @mapping @perf ibg-ufm-metadata-service ibg-ufm-core-service" },
  () => {
    // API endpoint URL
    const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;
    Utility.logIt(endpointURL);
    let userList = usersData.users;
    userList.forEach(async (user) => {
      test(`Checking the dimension mapping API for All dim grp ids for ${user}`, async ({
        request,
      }) => {
        //get request for the dimension mapping details includes all dim group ids
        await test.step("Make a Get Request for dimension mapping Details for all dim group ids", async () => {
          Utility.logIt(
            "Make a Get Request for dimension mapping Details for all dim group ids"
          );
          //API Request
          const responseData = await request.get(endpointURL, {
            params: {
              dimension_group_id: testdatafile.dimension_group_id,
            },

          });
          //Extracting the response body
          Utility.assertAndLog(responseData);
        });
      });
      // testdatafile.dim_group_id_data.forEach(testdata => {
      //   test('Checking the dimension mapping API for ' + testdata.name + '', async ({ context }) => {
      //     //get request for the dimension mapping details includes SBU department
      //     await test.step("Make a Get Request for dimension mapping Details for " + testdata.name, async () => {
      //       debug.log("Make a Get Request for dimension mapping Details for " + testdata.name);
      //       //API Request
      //       const responseData = await context.request.get(endpointURL,
      //         {
      //           params: { "dimension_group_id": testdata.queryParams.dim_grp_id }

      //         });
      //       //Extracting the response body
      //       const responseBody = JSON.parse(await responseData.text());
      //       expect(responseBody).toMatchObject(testdata.expected_response);
      //     }
      //     );
      //   });
      // });
    });
  }
);
