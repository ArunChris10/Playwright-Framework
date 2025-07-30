import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/screen-details-api.json";

test.describe(
  "Validating the screenDetails API ",
  { tag: "@Smoke @Regression @screenDetails ibg-ufm-metadata-service ibg-ufm-core-service" },
  () => {
    let responseBody;
    const testdata = testdatafile.configEndpoint;
    const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
    Utility.logIt(endpointURL);

    test("Checking the screen Details API response ", async ({ request }) => {
      //get request for the screen details
      await test.step("Make a Get Request for screen Details", async () => {
        Utility.logIt("Make a Get Request for screen Details");
        const responseData = await request.get(endpointURL, {
          params: {
            dim_id: testdatafile.configEndpoint.dim_id,
            dim_val_id: testdatafile.configEndpoint.dim_val_id,
          },
        });
        responseBody = JSON.parse(await responseData.text());
        Utility.logIt(`responseBody : ${JSON.stringify(responseBody)}`);
      });
      //Assertion
      await test.step("Check Api response is equal to the testdata ", async () => {
        expect(responseBody).toMatchObject(testdata.expected_response);
      });
    });
  }
);
