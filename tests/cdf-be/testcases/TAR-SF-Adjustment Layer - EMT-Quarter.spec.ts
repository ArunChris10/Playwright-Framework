import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import testDataEMTCreation from '../testdata/emt-layer-creation.json'
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { UploadLayerUtil } from "../fixtures/upload-layer";
import createEMTLayerData from '../testdata/create-emt-layer.json'

test.describe("Verify EMT layer can be created and changed for quarter", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    let demandId;
    let layerId;
    let forecastVersion;
    let demandScenarioDetails;
    let deAllocationQuarters = createEMTLayerData.deAllocationQuarters;

    test.beforeAll(async ({ request }) => {
        demandId = await CdfUtility.createScenario(request);
        demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(request, demandId);
    });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify EMT Layer can be changed for quarter view", async ({ request }) => {
        let getDemandScenarioForecastResponseBefore;

        let getDemandScenarioForecastResponseAfter;

        await test.step("Fetch the forecast version for the demand stack", async () => {
            forecastVersion = await CdfUtility.getDemandScenarioList(request);
            forecastVersion = forecastVersion.version;
        });

        await test.step("Fetch the get-demand-scenario-forecast initially", async () => {
            getDemandScenarioForecastResponseBefore = await DemandBaseClass.getdemandStackForecast(request, demandId, demandScenarioDetails, "QUARTER", [], null, null);
        });

        await test.step("Lock DSS", async () => {
            await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandId);
        });
        

        await test.step("Create the EMT Layer", async () => {
            testDataEMTCreation.payload.layers[0].allocationType = 'UNIT';
            testDataEMTCreation.payload.layers[0].forecastVersion = forecastVersion;
            testDataEMTCreation.payload.layers[0].userId = process.env.cdfUser || '';
            testDataEMTCreation.payload.layers[0].allocationUnitType = 'HOLD_AUR';
            testDataEMTCreation.payload.layers[0].yearMonths = [];
            testDataEMTCreation.payload.layers[0].allocationYearMonths = [];
            testDataEMTCreation.payload.layers[0].allocationSbus[0] = {};
            testDataEMTCreation.payload.layers[0].deAllocationSbus[0] = {};

            testDataEMTCreation.payload.layers[0].deAllocationQuarters = deAllocationQuarters;

            const createEMTLayerResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testDataEMTCreation);
            expect(createEMTLayerResponse).toBeOK();

            const createEMTLayerResponseBody = await createEMTLayerResponse.json();
            layerId = createEMTLayerResponseBody[0].layerId;
        });

        await test.step("Fetch the get-demand-scenario-forecast after emt layer applied", async () => {
            getDemandScenarioForecastResponseAfter = await DemandBaseClass.getdemandStackForecast(request, demandId, demandScenarioDetails, "QUARTER", [layerId], null, null);
        });

        await test.step("Verify forecast was changed", async () => {
            let forecast;
            forecast = getDemandScenarioForecastResponseBefore.forecastTotals.grandTotal.forecast
            const deAllocationInitially = forecast.find(month => month.quarter == deAllocationQuarters[0].quarterOrMonth.quarterOrMonth && month.year == deAllocationQuarters[0].quarterOrMonth.year);
            
            forecast = getDemandScenarioForecastResponseAfter.forecastTotals.grandTotal.forecast
            const deAllocationAfter = forecast.find(month => month.quarter == deAllocationQuarters[0].quarterOrMonth.quarterOrMonth && month.year == deAllocationQuarters[0].quarterOrMonth.year);

            const deAllocationUnitsDifference = Math.round(deAllocationAfter.units - deAllocationInitially.units);
            expect(deAllocationUnitsDifference).toBe(deAllocationQuarters[0].value);
            
        });

    });

});