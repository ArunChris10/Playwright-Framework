import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/savedviews.json";

test.describe(
  "Validating the saved views functionality",
  { tag: "@Smoke @Regression @savedview" },
  async () => {
    test("Checking the response of getViews API", async ({ request }) => {
      const testdata = testdatafile.configEndpoint;

      const endpointURL = `${process.env.nexusPreference}${testdata.endpoint}/dimValId_userId/entityValue/110027_LB-ibg-ufm-auto`;
      const responseData = await request.get(endpointURL);
      Utility.assertAndLog(responseData);
    });

    test("Retrieving views with invalid request parameter", async ({
      request,
    }) => {
      const testdata = testdatafile.configEndpoint;

      const endpointURL = `${process.env.nexusPreference}${testdata.endpoint}/dimValId_userId/entityValue/INVALID_URL`;
      let responseData = await request.get(endpointURL);

      Utility.assertAndLog(responseData);
      await responseData.json().then((data) => {
        expect(responseData.status()).toBe(200);
        expect(data.preferenceType).toEqual("SavedView");
        expect(data.entityTypeValue).toEqual("INVALID_URL");
        expect(data.preferenceConfigs).toEqual([]);
      });
    });

    test("Retrieving views with Empty List", async ({ request }) => {
      const testdata = testdatafile.configEndpoint;

      // Ensuring atleast one view is created.
      const createEndpointURL = testdata.createEndpoint;
      const createResponse = await request.post(createEndpointURL, {
        data: {
            ...testdata.create_payload,
            entityTypeValue: `110029_LB-ibg-ufm-auto`,
          },
      });
      Utility.logIt("validating createResponseData");
      expect(createResponse.status()).toBe(200);

      let newlyCreatedPrefConfigId: any;

      await createResponse.json().then((data) => {
        // Empty preferenceConfig signifies failed create view
        expect(data.preferenceConfig).not.toEqual([]);
        newlyCreatedPrefConfigId = data.preferenceConfigId;
      });

      // Get all views to get preference config IDs
      const getEndpointURL = `${process.env.nexusPreference}${testdata.endpoint}/dimValId_userId/entityValue/110029_LB-ibg-ufm-auto`;
      let getViewsList: any = [];
      let getResponseData = await request.get(getEndpointURL);

      await getResponseData.json().then((data) => {
        data.preferenceConfigs.forEach((obj) => {
          getViewsList.push(obj.preferenceConfigId);
        });
      });

      Utility.logIt(
        "Validating if newly added view is present in the getAllViews list" +
          getViewsList
      );

      expect(getViewsList).toContain(newlyCreatedPrefConfigId);

      // Iterating through getViewsList and call delete endpoint
      for (const id of getViewsList) {
        const deleteEndpointURL = `${testdata.deleteEndpoint}/${id}`;
        const deleteResponse = await request.delete(deleteEndpointURL);
        expect(deleteResponse.status()).toBe(200);
      }

      // Get all views again to validate nothing should be present
      getResponseData = await request.get(getEndpointURL);
      await getResponseData.json().then((data) => {
        expect(data.preferenceConfigs).toEqual([]);
      });
    });
  }
);
