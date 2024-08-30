import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataGetDemandForecast from '../testdata/allocation-layer-generate-preview.json';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import testDataEMTCreation from '../testdata/emt-layer-creation.json'
import { AdjustmentUtility } from '../fixtures/adjustment-utils';

test.describe("Verify EMT layer can be created with Scanned Units 1:1(absolute)", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    let demandId;
    let layerId;
    let forecastVersion;
    let initialValues: number[] = [];
    let endValues: number[] = [];
    let allocation = {
                    "name": "CONSUMABLES",
                    "value": 1,
                    "id": 29
                };
    let deAllocation = {
                    "name": "FOOD",
                    "value": -1,
                    "id": 27
                };

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify EMT Layer can be changed 1:1", async ({ request }) => {
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

            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].units);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].units);
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

            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].units);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].units);


            const diff1 = endValues[0] - initialValues[0];
            expect(diff1).toBe(allocation.value);
            const diff2 = endValues[1] - initialValues[1];
            expect(diff2).toBe(deAllocation.value);
        });

    });

});

test.describe("Verify EMT layer can be created with EMT Scanned Units Percentage", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    let demandId;
    let layerId;
    let forecastVersion;
    let initialValues: number[] = [];
    let endValues: number[] = [];
    let allocation = {
                    "name": "CONSUMABLES",
                    "value": 0.01,
                    "id": 29
                };
    let deAllocation = {
                    "name": "FOOD",
                    "value": -0.01,
                    "id": 27
                };

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify EMT Layer can be changed Percentage", async ({ request }) => {
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

            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].units);
            initialValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].units);
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
            testDataEMTCreation.payload.layers[0].allocationAmountTypeEnum = 'PERCENTAGE';

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

            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === allocation.id).forecast[0].units);
            endValues.push(getDemandScenarioForecastResponseBody.forecast.find(f => f.sbuId === deAllocation.id).forecast[0].units);


            const diff1 = endValues[0] - initialValues[0];
            expect(Math.round(diff1 * 100) / 100).toBe(allocation.value);


            const difference = endValues[1] / initialValues[1];
            expect(difference * 0.01).toBeCloseTo(Math.abs(deAllocation.value));
        });

    });

});