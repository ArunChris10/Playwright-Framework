import { expect, test } from "../../../common/fixtures/test-hook";
import { Utility } from "../../../common/fixtures/utils";
import testdatafile from "../../testdata/new-aop-version.json";
import usersData from "../../constants/ufm_users.json";
import { AOPUtils } from '../../fixtures/aop-utils';

test.describe.skip(
  "Verify the aop publish API",
  { tag: "@Smoke @Regression @aop @aopNewVersion" },
  () => {
  
    let responseBody;
    let utilResponse;
    let utilResponseToBeVerified;
    const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;
  
    Utility.logIt(endpointUploadURL);
    let userList = usersData.users;

    test(`Verify if publishing AOP is returning a new version`, async ({
      request,
    }) => {
      //get request for data-science-info api
      utilResponse = await AOPUtils.getAOPVersion(request);

      await test.step("Make a get Request for fetching AOP details", async () => {
        Utility.logIt("Make a get Request for fetching AOP details");
        utilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(utilResponse);
        utilResponse = JSON.parse(await utilResponse.text());
      });

      const scenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

      const payload = {
        scenario_id: scenarioAOPDetails.scenario_id,
        scenario_version: scenarioAOPDetails.scenario_version,
      };

      // post request for publishing AOP
      await test.step("Make a Post Request for publishing AOP", async () => {
        Utility.logIt("Make a Post Request for publishing AOP");
        responseBody = await request.post(endpointUploadURL, {
          data: payload,
        });
        if (!responseBody.ok()) {
          console.error(`API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`);
        }
        await Utility.assertAndLog(responseBody);
        responseBody = JSON.parse(await responseBody.text());
      });

      //Assertion
      await test.step("Check if the response is successful", async () => {
        utilResponseToBeVerified = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(utilResponseToBeVerified);
        utilResponseToBeVerified = JSON.parse(await utilResponseToBeVerified.text());

        const responseToBeVerified = utilResponseToBeVerified.find(item => item.classification_id === testdatafile.classification_id);

        expect(responseToBeVerified.scenario_id).toEqual(scenarioAOPDetails.scenario_id);

        expect(responseToBeVerified.scenario_version).not.toEqual(scenarioAOPDetails.scenario_version);
      });
    });
  }
);
