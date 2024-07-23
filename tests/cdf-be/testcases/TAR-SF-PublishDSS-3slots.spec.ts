import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import currentDemandData from '../testdata/current-demand.json'
import testdatafile from '../testdata/current-demand.json';
import debug from 'debug';

test.describe("Verify user can publish multiple (upto 3) DSS onto Current Demand view only page and it replaces the forecast from the selected slot and the name should appear in the dropdown", { tag: "@Regression @ibg-service-scenario-financials @Publish @currentDemandWithMultiDSS"}, () => {

    const totalNoOfSlots = 3;
    let newDemandId;
    test.afterAll(async ({ request }) => {
            await CdfUtility.deleteScenario(request, newDemandId);
        });

    for(let slotId = 1; slotId <= totalNoOfSlots; slotId++){
        test(`Publish multiple DSS on slot ${slotId} to current Demand`, async ({ request }) => {

            let demandScenarioData, publishDssResponse, currentDemandName, currentDemandDescription;

            await test.step("Create new scenario with unique name", async () => {
                newDemandId = await CdfUtility.createScenario(request);
                debug.log("New demand scenario stack created with demand id as : " + newDemandId);
            });

            await test.step("Fetch details of the newly created DSS", async () => {
                demandScenarioData = await CdfUtility.getDemandScenarioById(request, newDemandId);
                debug.log("New created demand scenario data is : " + JSON.stringify(demandScenarioData));
            });

            await test.step("Fetch current demand data and extract name and description", async () => {
                const currentDemandResponse = await CdfUtility.currentDemand(request);
                expect(currentDemandResponse).toBeOK();
                const currentDemandResponseBody = await currentDemandResponse.json();
                debug.log(JSON.stringify(currentDemandResponseBody));
                currentDemandName = currentDemandResponseBody.demandStackScenarioName;
                currentDemandDescription = currentDemandResponseBody.demandStackScenarioDescription;
                debug.log("Current demand scenario name is %s and description is %s", currentDemandName, currentDemandDescription);
            });

            await test.step("Publish newly created demand scenario on the given slot id", async () => {
                publishDssResponse = await CdfUtility.publishDSS(request, newDemandId, slotId);
                debug.log(publishDssResponse);
                expect(publishDssResponse).toBeOK();
                let publishDssResponseBody = await publishDssResponse.json();
                debug.log(JSON.stringify(publishDssResponseBody));
                expect(publishDssResponseBody.message).toEqual(testdatafile.expected_response.message);
                debug.log("User is able to publish filter to current demand");
            });

            await test.step("Get publish status", async () => {
                let statusResponseBody = await CdfUtility.pollPublishData(request)
                expect(statusResponseBody.jobStatus).toEqual(testdatafile.expected_status_response);
                debug.log("Writeback Completed");
            });

            await test.step("Again fetch current demand data and extract and assert name & description", async () => {
                const currentDemandResponse = await CdfUtility.currentDemand(request);
                expect(currentDemandResponse).toBeOK();
                const currentDemandResponseBody = await currentDemandResponse.json();
                debug.log(JSON.stringify(currentDemandResponseBody));
                const currentDemandNameAfterPublish = currentDemandResponseBody.demandStackScenarioName;
                const currentDemandDescriptionAfterPublish = currentDemandResponseBody.demandStackScenarioDescription;
                debug.log("Previous current demand scenario name and description are %s and %s", currentDemandName, currentDemandDescription);
                debug.log("After publish current demand scenario name and description are %s and %s", currentDemandNameAfterPublish, currentDemandDescriptionAfterPublish);
                expect(currentDemandName).not.toEqual(currentDemandNameAfterPublish);
                expect(currentDemandDescription).not.toEqual(currentDemandDescriptionAfterPublish);
                currentDemandName = currentDemandNameAfterPublish;
                currentDemandDescription = currentDemandDescriptionAfterPublish;
            });

            await test.step("Fetch all slots data", async () => {
                let response = await CdfUtility.fetchSlots(request);
                //asserting the response
                expect(response).toBeOK();
                let responseBody = await response.json();
                debug.log(JSON.stringify(responseBody));
                debug.log("All slots fetch successfully.");

                let scenarioDisplayNameFromSlotResponse = responseBody
                .filter(slot => slot.slotId === String(slotId))
                .map(slot => slot.demandScenarioName);

                expect(scenarioDisplayNameFromSlotResponse).not.toBeNull();
                expect(scenarioDisplayNameFromSlotResponse[0]).toEqual(currentDemandName);

            });

            await test.step("Delete newly created demand scenario", async () => {
                let response = await CdfUtility.deleteScenario(request,newDemandId);
                //asserting the response
                expect(response).toBeOK();
                debug.log("Newly created demand scenario deleted successfully for demandId : " + newDemandId)
            });
        });
    }
});