import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";

test.describe(
  "Validating the user preference service api",
  { tag: "@Smoke @Regression @user_preference" },
  () => {
    test("Checking the user preference response and status to be 200", async ({
      request,
    }) => {
      const endpointURL = `${process.env.userPreferenceAPIURL}/user-preferences/${process.env.ufmUser}`;
      const responseData = await request.get(endpointURL);
      Utility.assertAndLog(responseData);
    });
  }
);
