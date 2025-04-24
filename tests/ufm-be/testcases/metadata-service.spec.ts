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
      Utility.logIt(`Endpoint URL: ${endpointURL}`);
      
      const response = await request.get(endpointURL, {});
      Utility.assertAndLog(response);
      
      const responseData = await response.json();
      Utility.logIt("Validating response JSON with expected response");
      
      expect(response.status()).toBe(200);
      expect(responseData).toEqual(testdata.expected_response);
    });
  }
);
