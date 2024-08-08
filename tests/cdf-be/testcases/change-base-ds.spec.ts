import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import baseDSForecast from '../testdata/base-ds-forecast.json'
import debug from "debug";

test.describe("Base DS Forecast Change", { tag: "@Smoke @changeBaseDSForecast @ibg-service-scenario-financials @Regression"}, () => {
    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify if user switch the Base DS Forecast", async ({ request }) => {
        let jobId;
        await test.step("Switch base DS to a different version", async () => {
            let switchBaseDSResponse;
            switchBaseDSResponse = await CdfUtility.switchBaseDSResponse(request, demandId);
            expect(switchBaseDSResponse).toBeOK();
            let switchBaseDSResponseBody = await switchBaseDSResponse.json();

            jobId = switchBaseDSResponseBody.jobId;
            expect(switchBaseDSResponseBody).toEqual({
                jobId: jobId,
                jobMessage: baseDSForecast.expected_response.jobMessagePart1 + 
                            jobId + 
                            baseDSForecast.expected_response.jobMessagePart3
            });
            debug.log("Base DS is starting to update  : ", demandId);
        });

        await test.step("Wait for DS version to be updated", async () => {
            let statusResponse;
            statusResponse = await CdfUtility.checkClonedJobStatus(request, demandId);
            debug.log("Base DS is updated  : ", demandId);
        });
    })
})