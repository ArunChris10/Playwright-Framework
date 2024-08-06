import debug from "debug";
import { test, expect } from "../../common/fixtures/test-hook";
import testdatafile from "../testdata/metadata-service.json";

test.describe("Validating the @metadata service @Regression", () => {
  test("Checking the @getdimensionconfig response @Regression", async ({
    request,
  }) => {
    const testdata = testdatafile.configEndpoint;
    const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
    debug.log(endpointURL);
    const responseData = await request.get(endpointURL, {});
    const responseBody = JSON.parse(await responseData.text());
    debug.log(responseBody);
    expect(responseBody).toMatchObject(testdata.expected_response);
  });
});
