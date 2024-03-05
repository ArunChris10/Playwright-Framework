import { test, expect } from '../../common/fixtures/test-hook';
import testdatafile from "../testdata/screen-details-api.json";
import debug from "debug";

test.describe("Validating the @screenDetails API @Regression", () => {
  let responseBody;
  const testdata = testdatafile.configEndpoint;
  const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
  debug.log(endpointURL);

  test("Checking the screen Details API response ", async ({ context }) => {
    //get request for the screen details
    await test.step("Make a Get Request for screen Details", async () => {
      debug.log("Make a Get Request for screen Details");
      const responseData = await context.request.get(endpointURL);
      responseBody = JSON.parse(await responseData.text());
      debug.log("responseBody", responseBody);
    });
    //Assertion
    await test.step("Check Api response is equal to the testdata ", async () => {
      expect(responseBody).toMatchObject(testdata.expected_response);
    });
  });
});
