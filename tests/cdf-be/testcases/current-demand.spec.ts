import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import currentDemandData from '../testdata/current-demand.json'
import testdatafile from '../testdata/current-demand.json';
import debug from 'debug';

test.describe("Verify user can publish to current demand and user is able to see the details of the latest synced DSS", { tag: "@Smoke @currentDemand @ibg-service-scenario-financials @Regression"}, () => {
    let demandId;
    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request);});
    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId);});
    test("Publish DSS to current Demand", async ({ request }) => {

        let demandScenarioData, publishDssResponse, currentDemandResponse, currentDemandResponseBody, demandAmountValue, currentDemandAmountValue;

        await test.step("Fetch details of the newly created DSS", async () => {
            demandScenarioData = await CdfUtility.getDemandScenarioById(request, demandId);
            demandAmountValue = demandScenarioData.forecast
                .filter(map => map.sbu === currentDemandData.sbuToTest)
                .map(map => map.forecast)
                .reduce((acc, val) => acc.concat(val), [])
                .filter(nestedMap => nestedMap.month == currentDemandData.MonthToTest && nestedMap.year == currentDemandData.yearToTest)
                .map(nestedMap => nestedMap.amount)
                .shift();
        
            debug.log(demandAmountValue);
        });

        await test.step("Publish to current demand", async () => {
            publishDssResponse = await CdfUtility.publishDSS(request, demandId, currentDemandData.slotId);
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
            debug.log("Writeback Completed")
        });

        await test.step("fetch current demand data for the published slot", async () => {
            currentDemandResponse = await CdfUtility.currentDemand(request, currentDemandData.slotId);
            expect(currentDemandResponse).toBeOK();
            currentDemandResponseBody = await currentDemandResponse.json();
            debug.log(JSON.stringify(currentDemandResponseBody));

            currentDemandAmountValue = currentDemandResponseBody.forecast
                .filter(map => map.sbu === currentDemandData.sbuToTest)
                .map(map => map.forecast)
                .reduce((acc, val) => acc.concat(val), [])
                .filter(nestedMap => nestedMap.month == currentDemandData.MonthToTest && nestedMap.year == currentDemandData.yearToTest)
                .map(nestedMap => nestedMap.amount)
                .shift();
            
            debug.log(currentDemandAmountValue);
        });

        // assert if demand stack sceanrio data and current demand data are the same
        expect(demandAmountValue).toEqual(currentDemandAmountValue);

    })
})