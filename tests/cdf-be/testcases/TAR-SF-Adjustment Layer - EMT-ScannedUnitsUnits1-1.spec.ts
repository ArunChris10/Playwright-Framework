import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataGetDemandForecast from '../testdata/allocation-layer-generate-preview.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import testDataEMTCreation from '../testdata/emt-layer-creation.json'
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import createEMTLayerData from '../testdata/create-emt-layer.json'

test.describe("Verify EMT layer can be created with EMT Converted Sales Units HOLD_AUR", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    let demandId;
    let layerId;
    let forecastVersion;
    let initialValues: number[] = [];
    let endValues: number[] = [];
    let allocation = createEMTLayerData.emtScannedUnits11Allocation;
    let deAllocation = createEMTLayerData.emtScannedUnits11DeAllocation;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify EMT Layer can be changed HOLD_AUR", async ({ request }) => {
        await test.step("Fetch the forecast version for the demand stack", async () => {
            forecastVersion = await CdfUtility.getDemandScenarioList(request);
            forecastVersion = forecastVersion.version;
        });
        let getDemandScenarioForecastResponse;
        let getDemandScenarioForecastResponseBody;

        await test.step("Fetch the get-demand-scenario-forecast initially", async () => {
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.version = forecastVersion;
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.organizationalLevel = "SBU";
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.layerIds = [];
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.baseChannel = [];
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.baseChannelIds = [];
            getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataGetDemandForecast.payloadForGetDemandScenarioForecast);

            getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].sales);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].units);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].amount);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].aur);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].sales);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].units);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].amount);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].aur);
        });

        await test.step("Lock DSS", async () => {
            const lockResponse = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockResponse).toBeOK();
        });
        

        await test.step("Create the EMT Layer", async () => {
            testDataEMTCreation.payload.layers[0].allocationType = 'UNIT';
            testDataEMTCreation.payload.layers[0].forecastVersion = forecastVersion;
            testDataEMTCreation.payload.layers[0].userId = process.env.cdfUser || '';
            testDataEMTCreation.payload.layers[0].allocationUnitType = 'MOVE_UNIT_1_1';
            testDataEMTCreation.payload.layers[0].allocationSbus[0] = allocation;
            testDataEMTCreation.payload.layers[0].deAllocationSbus[0] = deAllocation;

            const createEMTLayerResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testDataEMTCreation);
            expect(createEMTLayerResponse).toBeOK();

            const createEMTLayerResponseBody = await createEMTLayerResponse.json();
            layerId = createEMTLayerResponseBody[0].layerId;
        });

        await test.step("Verify forecast was updated with EMT layer", async () => {
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.version = forecastVersion;
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.organizationalLevel = "SBU";
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.layerIds = [layerId];
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.baseChannel = [];
            testDataGetDemandForecast.payloadForGetDemandScenarioForecast.baseChannelIds = [];
            getDemandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataGetDemandForecast.payloadForGetDemandScenarioForecast);
            getDemandScenarioForecastResponseBody = await getDemandScenarioForecastResponse.json();

            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].sales);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].units);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].amount);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].aur);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].sales);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].units);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].amount);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].aur);

            const diff1 = endValues[1] - initialValues[1];
            expect(diff1).toBe(allocation.value);
            const diff2 = endValues[5] - initialValues[5];
            expect(diff2).toBe(deAllocation.value);

            const aurOldDellocation = (Math.round((initialValues[2] / initialValues[1]) * 100) / 100);
            expect(aurOldDellocation).toBe(initialValues[3]);

            const aurOldAllocation = (Math.round((initialValues[6] / initialValues[5]) * 100) / 100);
            expect(aurOldAllocation).toBe(initialValues[7]);

            const aurNewDeallocation = (Math.round((endValues[2] / endValues[1]) * 100) / 100);
            expect(aurNewDeallocation).toBe(endValues[3]);

            const aurNewAllocation = (Math.round((endValues[6] / endValues[5]) * 100) / 100);
            expect(aurNewAllocation).toBe(endValues[7]);
        });
    });
});