
import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import debug from "debug";
import testdatafile from '../testdata/current-demand.json';
test.describe(
    "Verify star icon is displayed when a DSS is published",
    {
        tag: "@Regression @ibg-service-scenario-financials @Publish",
    },
    () => {
      
        let demandId, publishDssResponse, demandScenarioData, currentDemandName, currentDemandDescription, slotId = 1

        test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });
        
        test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

        test("Verify if user can see the star icon", async ({ request }) => {
            await test.step("Fetch details of the newly created DSS", async () => {
                demandScenarioData = await CdfUtility.getDemandScenarioById(request, demandId);
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
            
            await test.step("Publish newly created demand scenario on slot id = 1", async () => {
                publishDssResponse = await CdfUtility.publishDSS(request, demandId, slotId);
                debug.log(publishDssResponse);
                expect(publishDssResponse).toBeOK();
                let publishDssResponseBody = await publishDssResponse.json();
                debug.log(JSON.stringify(publishDssResponseBody));
                expect(publishDssResponseBody.message).toEqual(testdatafile.expected_response.message);
                debug.log("User is able to publish filter to current demand");
            });

            await test.step("Get publish status", async () => {
                let demandStackScenario;
                let publishStatus;

                let response = await CdfUtility.getDemandStackScenarioTotalList(request, false)
                demandStackScenario = response.find(element => {
                    if (element.demandStackScenarioId === demandId) {
                        return element
                    }
                });
                publishStatus = await CdfUtility.pollPublishData(request)
                if (publishStatus.jobStatus === testdatafile.expected_status_response) {
                    expect(demandStackScenario.syncDate).not.toBeNull();
                }
                debug.log("StarIcon displayed");
            });

            await test.step("Delete newly created demand scenario", async () => {
                let response = await CdfUtility.deleteScenario(request, demandId);
                //asserting the response
                expect(response).toBeOK();
                debug.log("Newly created demand scenario deleted successfully for demandId : " + demandId)
            });
        })
    }
);