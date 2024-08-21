import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/visual-indicator-api.json";

test.describe(
  "Verify the visualindicator API",
  { tag: "@Smoke @Regression @visualindicator" },
  () => {
    let responseBody;
    const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;
    Utility.logIt(endpointURL);

    test("Verify if the api is returning Actuals, forecast and extrapolated forecast dates", async ({
      request,
    }) => {
      //get request for the visual-indicator
      await test.step("Make a Get Request for getting updated dates", async () => {
        Utility.logIt("Make a Get Request for getting updated dates");
        responseBody = await request.get(endpointURL, {
          params: { classification_id: testdatafile.classification_id },
        });
        await Utility.assertAndLog(responseBody);
        responseBody = JSON.parse(await responseBody.text());
      });
      //Assertion
      await test.step("Check if the response has all 3 dates", async () => {
        const dataset_type: String[] = responseBody.map(
          (obj: any) => obj.dataset_type
        );
        expect(dataset_type).toContainEqual(
          testdatafile.visual_indicator_response[0].dataset_type
        );
        expect(dataset_type).toContainEqual(
          testdatafile.visual_indicator_response[1].dataset_type
        );
        expect(dataset_type).toContainEqual(
          testdatafile.visual_indicator_response[2].dataset_type
        );
      });
    });
  }
);
