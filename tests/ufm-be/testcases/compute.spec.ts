import { test, expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../testdata/scenarioIds.json";
import debug from "debug";

let orgName = [
  //"Segment_Finance",
  "BA_Merch",
  "H&W",
  "CUSTOMER & REVENUE",
  "BA_Operations",
  "Supply Chain",
  "BA_Segment",
  "BA_Ecomm",
  "Optical",
  "RX",
  "Merch",
  "E2E_Delivery",
  "Core_Service",
  "Fulfillment",
  "I&A",
  "LMD",
  "Connect",
  "Marketing",
  "Data_Ventures",
  "Ecommerce",
  "Operations",
  "Real_Estate",
  "Fuel",
  "Segment",
  "Home_Office",
];

orgName.forEach((orgName) => {
  test.describe("Run recompute for all scenarios", { tag: "@compute" }, () => {
    test.describe.configure({ timeout: 600_000, mode: "parallel" });

    const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;

    console.log(endpointURL);

    test(`Run compute for ${orgName} scenario`, async ({ request }) => {
      console.log(`Run compute for ${orgName} scenario`);
      //retrying untill passes
      // await expect(async () => {
      const response = await request.post(endpointURL, {
        data: testdata.payloads[orgName],
      });

      // asserting the response
      let responseBody = await Utility.assertAndLog(response);
      await expect.soft(responseBody).toEqual(testdata.successMessage);
      console.log(
        responseBody +
          " for " +
          orgName +
          " with " +
          JSON.stringify(testdata.payloads[orgName])
      );
      debug.log(
        JSON.stringify(
          responseBody +
            " for " +
            orgName +
            "with " +
            JSON.stringify(testdata.payloads[orgName])
        )
      );
      // }).toPass({ timeout: 600_000 });
    });
  });
});
