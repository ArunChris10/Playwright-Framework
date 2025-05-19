import { expect, test } from "../../../common/fixtures/test-hook";
import { Utility } from "../../../common/fixtures/utils";
import testdatafile from "../../testdata/new-aop-version.json";

test.describe(
  "Verify the aop publish failed with api error",
  { tag: "@Smoke @Regression @aop_publish_error" },
  () => {
    const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;

    Utility.logIt(endpointUploadURL);

    test(`Verify if user can see publish error when request data is invalid`, async ({
      request,
    }) => {
      // invalid payload
      const invalidPayload = {
        scenario_id: -1,
        scenario_version: -1,
      };

      await test.step("Simulate failure when publishing AOP", async () => {
        Utility.logIt("Simulate failure when publishing AOP");

        try {
          const errorResponse = await request.post(endpointUploadURL, {
            data: invalidPayload,
          });

          expect(errorResponse.ok()).toBeFalsy();
          expect(errorResponse.status()).toBeGreaterThanOrEqual(400);
          expect(errorResponse.status()).not.toEqual(200);

          const errorText = await errorResponse.text();
          Utility.logIt(`Error response: ${errorText}`);
          expect(errorText).toContain(
            "Something went wrong. Please Try Again Later"
          );

          const contentType = errorResponse.headers()["content-type"];
          expect(contentType).toContain("application/json");
        } catch (error) {
          Utility.logIt(`Unexpected error occurred: ${error.message}`);
          throw error;
        }
      });
    });
  }
);
