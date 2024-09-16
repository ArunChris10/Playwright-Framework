import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import downloadScenarioData from '../testdata/downloadscenario.json';
import { DemandBaseClass } from '../fixtures/demand-common-utils';
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe("Verify default unit is GMV while downloaded", { tag: "@Smoke @downloadScenario @ibg-service-scenario-financials @Regression" }, () => {

    let demandId;
    let forecastVersion
    test.beforeAll(async ({ request }) => { 
        demandId = await CdfUtility.createScenario(request);
        forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;
        console.log("Forecast Version: ", forecastVersion);

    
    });
    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId);});


    test("Default unit is GMV when downloaded", async ({ request }) => {
        let downloadedExcelScenarioBody;
        await test.step("Download", async () => {
            downloadScenarioData.payload.version = forecastVersion;
            downloadedExcelScenarioBody = await CdfUtility.downloadScenario(request, demandId, downloadScenarioData);
            expect(downloadedExcelScenarioBody).toBeOK();

            debug.log("User is able to download the scenario");
        });

        await test.step("Make sure filter is GMV", async () => {
            let actualUnit = await DemandBaseClass.getCellValueFromExcel(downloadedExcelScenarioBody, 'C6');
            expect(actualUnit).toBe("GMV Shipped");
        });
    })
})