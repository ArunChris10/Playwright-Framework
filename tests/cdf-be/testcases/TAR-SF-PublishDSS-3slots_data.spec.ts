import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import currentDemandData from '../testdata/current-demand.json'
import testdatafile from '../testdata/current-demand.json';
import debug from 'debug';

test.describe("Verify user can select from list of 3 DSS and view data on Current Demand page.", { tag: "@Regression @ibg-service-scenario-financials @Publish @currentDemandDataWithMultiDSS"}, () => {

    const totalNoOfSlots = 3;
    let newDemandId;
    test.afterAll(async ({ request }) => {
            await CdfUtility.deleteScenario(request, newDemandId);
        });

    for(let slotId = 1; slotId <= totalNoOfSlots; slotId++){
        test(`Publish multiple DSS on slot ${slotId} to current Demand and validate data`, async ({ request }) => {

            let demandScenarioData, publishDssResponse, currentDemandResponseBody;

            await test.step("Create new scenario with unique name", async () => {
                newDemandId = await CdfUtility.createScenario(request);
                debug.log("New demand scenario stack created with demand id as : " + newDemandId);
            });

            await test.step("Fetch details of the newly created DSS", async () => {
                demandScenarioData = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(request, newDemandId);
                expect(demandScenarioData).not.toBeNull();
                debug.log("New created demand scenario data is : " + JSON.stringify(demandScenarioData));
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

            await test.step("Fetch current demand on the basis of slotId and extract data", async () => {
                const currentDemandResponse = await CdfUtility.getCurrentDemandBySlotIdWithMinimumDataPayload(request, slotId);
                expect(currentDemandResponse).toBeOK();
                currentDemandResponseBody = await currentDemandResponse.json();
                debug.log("Current demand response body : " + JSON.stringify(currentDemandResponseBody));
                expect(demandScenarioData).not.toBeNull();

            });

            await test.step("User can validate actual and forecast data and is verified", async () => {
                expect(demandScenarioData.forecast.length).toEqual(currentDemandResponseBody.forecast.length);
                    for (let i = 0; i < demandScenarioData.forecast.length; i++){
                        expect(demandScenarioData.forecast[i].forecast.length).toEqual(currentDemandResponseBody.forecast[i].forecast.length);
                        for (let j = 0; j < demandScenarioData.forecast[i].forecast.length; j++) {
                            expect(demandScenarioData.forecast[i].forecast[j].aur).toEqual(currentDemandResponseBody.forecast[i].forecast[j].aur);
                            expect(demandScenarioData.forecast[i].forecast[j].uomValue).toEqual(currentDemandResponseBody.forecast[i].forecast[j].uomValue);
                            expect(demandScenarioData.forecast[i].forecast[j].units).toEqual(currentDemandResponseBody.forecast[i].forecast[j].units);
                            expect(demandScenarioData.forecast[i].forecast[j].sales).toEqual(currentDemandResponseBody.forecast[i].forecast[j].sales);

                        }
                   }
                debug.log("User is able to validate actual and forecast data");
            })

            await test.step("Delete newly created demand scenario", async () => {
                let response = await CdfUtility.deleteScenario(request,newDemandId);
                //asserting the response
                expect(response).toBeOK();
                debug.log("Newly created demand scenario deleted successfully for demandId : " + newDemandId)
            });
        });
    }
});