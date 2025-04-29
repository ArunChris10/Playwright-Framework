import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/savedviews.json";

test.describe.configure({ mode: "serial" });

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

test.describe(
  "Validating the edits in saved views functionality",
  { tag: "@Smoke @Regression @savedview" },
  async () => {
    const testdata = testdatafile.configEndpoint;
    let newlyCreatedPrefConfigId: any;

    // This 'beforeAll' ensures only one view is present and subsequent tests will ensure the edits on this view.
    test.beforeAll(async ({ request }) => {
      // Get all views to get preference config IDs
      const getEndpointURL = `${process.env.nexusPreference}${testdata.endpoint}/dimValId_userId/entityValue/110029_LB-ibg-ufm-auto`;
      let getViewsList: any = [];
      let getResponseData = await request.get(getEndpointURL);

      await getResponseData.json().then((data) => {
        data.preferenceConfigs.forEach((obj) => {
          getViewsList.push(obj.preferenceConfigId);
        });
      });

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

      // Creating a view.
      const createEndpointURL = testdata.createEndpoint;
      const createResponse = await request.post(createEndpointURL, {
        data: {
          ...testdata.create_payload,
          entityTypeValue: `110029_LB-ibg-ufm-auto`,
        },
      });
      Utility.logIt("validating createResponseData");
      expect(createResponse.status()).toBe(200);

      await createResponse.json().then((data) => {
        // Empty preferenceConfig signifies failed create view
        expect(data.preferenceConfig).not.toEqual([]);
        newlyCreatedPrefConfigId = data.preferenceConfigId;
      });

      // Get all views to get preference config IDs
      getResponseData = await request.get(getEndpointURL);

      Utility.logIt(
        "Validating if newly added view is present in the getAllViews list" +
          getViewsList
      );

      await getResponseData.json().then((data) => {
        data.preferenceConfigs.forEach((obj) => {
          getViewsList.push(obj.preferenceConfigId);
        });
      });
      expect(getViewsList).toContain(newlyCreatedPrefConfigId);
    });

    test.afterAll(async ({ request }) => {
      const getEndpointURL = `${process.env.nexusPreference}${testdata.endpoint}/dimValId_userId/entityValue/110029_LB-ibg-ufm-auto`;
      let getViewsList: any = [];
      let getResponseData = await request.get(getEndpointURL);

      await getResponseData.json().then((data) => {
        data.preferenceConfigs.forEach((obj) => {
          getViewsList.push(obj.preferenceConfigId);
        });
      });

      // Iterating through getViewsList and call delete endpoint
      for (const id of getViewsList) {
        const deleteEndpointURL = `${testdata.deleteEndpoint}/${id}`;
        const deleteResponse = await request.delete(deleteEndpointURL);
        expect(deleteResponse.status()).toBe(200);
      }
    });


    test("Editing a view name with very long name length", async ({
      request,
    }) => {
      const endpointURL = `${process.env.nexusPreference}/api/v1/preferences/configs/${newlyCreatedPrefConfigId}`;
      const editResponseData = await request.put(endpointURL, {
        data: {
          ...testdata.edit_payload,
          preferenceConfig: {
            name: testdata.name,
          },
          preferenceConfigId: newlyCreatedPrefConfigId,
        },
      });
      Utility.assertAndLog(editResponseData);

      await editResponseData.json().then((data) => {
        expect(data.preferenceConfig).not.toEqual([]);
        expect(data.preferenceConfig.name).toEqual(testdata.name);
        expect(data.preferenceConfigId).toEqual(newlyCreatedPrefConfigId);
      });
    });

    test("Editing a view name with non-existent ID", async ({ request }) => {
      const nonExistentPrefConfigId = 0;
      const endpointURL = `${process.env.nexusPreference}/api/v1/preferences/configs/${nonExistentPrefConfigId}`;
      const editResponseData = await request.put(endpointURL, {
        data: {
          ...testdata.edit_payload,
          preferenceConfig: {
            name: testdata.name,
          },
          preferenceConfigId: nonExistentPrefConfigId,
        },
      });

      expect(editResponseData.ok()).toBeFalsy();
      expect(editResponseData.status()).not.toEqual(200);
      expect(editResponseData.status()).toBeGreaterThanOrEqual(500);

      await editResponseData.json().then((data) => {
        expect(data.message).toEqual(`PreferenceConfig not found for id: ${nonExistentPrefConfigId}`);
        expect(data.error).toEqual(`PreferenceConfig not found for id: ${nonExistentPrefConfigId}`);
      });
    });

    test("Editing a view name with special chars in name", async ({
      request,
    }) => {
      const specialCharName = "@#$%^&*()!~";
      const endpointURL = `${process.env.nexusPreference}/api/v1/preferences/configs/${newlyCreatedPrefConfigId}`;
      const editResponseData = await request.put(endpointURL, {
        data: {
          ...testdata.edit_payload,
          preferenceConfig: {
            name: specialCharName,
          },
          preferenceConfigId: newlyCreatedPrefConfigId,
        },
      });

      await editResponseData.json().then((data) => {
        expect(data.preferenceConfig).not.toEqual([]);
        expect(data.preferenceConfig.name).toEqual(specialCharName);
        expect(data.preferenceConfigId).toEqual(newlyCreatedPrefConfigId);
      });
    });
  }
);
