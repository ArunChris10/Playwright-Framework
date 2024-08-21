import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/metadata-service.json";

test.describe(
  "Validating the metadata service",
  { tag: "@Smoke @Regression @metadata" },
  () => {
    test("Checking the getdimensionconfig response", async ({ request }) => {
      const testdata = testdatafile.configEndpoint;
      const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
      Utility.logIt(endpointURL);
      const responseData = await request.get(endpointURL, {});
      const responseBody = JSON.parse(await responseData.text());
      Utility.logIt(responseBody);
      expect(responseBody).toMatchObject(testdata.expected_response);
    });
  }
);
