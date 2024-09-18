import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from '../fixtures/cdf-utils';
import { ManageRebaseUtility } from "../fixtures/manage-rebase-utils";
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataFile from '../testdata/emt-layer-tar.json';
import testdatafileDeleteEMT from '../testdata/delete-emt-layer.json';

test.describe("Create an EMT adjustment layer and verify the prorated distribution of other dimensions", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT @emtAdjustmentLayer" }, () => {
    
    let demandId;
    let forecastVersion;
    let forecastLayerId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.beforeAll(async ({ request }) => {
        forecastVersion = await CdfUtility.getDemandScenarioList(request);
        forecastVersion = forecastVersion.version;
        console.log("Forecast Version: ", forecastVersion);
        let forecastInfoResponse
        forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);

        let forecastInfoResponseBody
        forecastInfoResponseBody = await forecastInfoResponse.json();

        // Fetch the layerId for the forecast version of the DSS created 
        forecastInfoResponseBody.forEach(function(forecastInfo) {
            if(forecastInfo.version == forecastVersion) {
                forecastLayerId = forecastInfo.forecastLayerId;
            }
        });
    });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify User can create EMT Adjustment layer at Annual Year and result grid is updated on prorated ratio of other dimension", async ({ request }) => {
        let dsvS2hValueForDeductedYear;
        let dsvS2hValueForDistributionYear;
        let totalValueForDeductedYear;
        let totalValueForDistributedYear;
        await test.step("Fetch the get demand scenario forecast before the layer creation", async () => {
            let getDemandScenarioForecastResponseBeforeLayerCreation;
            testDataFile.payloadForGetDemandScenarioForecastBeforeLayerYearView.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastBeforeLayerYearView.layerIds[0] = forecastLayerId;
            getDemandScenarioForecastResponseBeforeLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastBeforeLayerYearView);

            let getDemandScenarioForecastResponseBodyBeforeLayerCreation;
            getDemandScenarioForecastResponseBodyBeforeLayerCreation = await getDemandScenarioForecastResponseBeforeLayerCreation.json();

            getDemandScenarioForecastResponseBodyBeforeLayerCreation.yearlyForecast.forEach(function(eachBaseChannel) {
                if(eachBaseChannel.baseChannel == "DSV_S2H") {
                    eachBaseChannel.forecast.forEach(function(eachYear) {
                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].deAllocationYears[0].year) {
                            dsvS2hValueForDeductedYear = eachYear.amount;
                        }

                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].allocationYears[0].year) {
                            dsvS2hValueForDistributionYear = eachYear.amount;
                        }
                    });
                }
            });

            getDemandScenarioForecastResponseBodyBeforeLayerCreation.forecastTotals.grandTotal.forecast.forEach(function(eachYear) {
                if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].deAllocationYears[0].year) {
                    totalValueForDeductedYear = eachYear.amount;
                }
                if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].allocationYears[0].year) {
                    totalValueForDistributedYear = eachYear.amount;
                }
            });
        });

        let layerIdOfEmtLayer;
        await test.step("Create an EMT Adjustment layer at Annual year", async () => {
            let lockDSSDataResponseForEMTLayer;
            lockDSSDataResponseForEMTLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSDataResponseForEMTLayer).toBeOK();

            let emtLayerCreationResponse;
            testDataFile.payloadForEMTLayerCreationYear.layers[0].forecastVersion = forecastVersion;
            emtLayerCreationResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFile.payloadForEMTLayerCreationYear);

            let emtLayerCreationResponseBody;
            emtLayerCreationResponseBody = await emtLayerCreationResponse.json();

            layerIdOfEmtLayer = emtLayerCreationResponseBody[0].layerId;
            console.log("Layer Id of the emt layer created: ", layerIdOfEmtLayer);
        });

        let proratedDistributionRatioForDeductedYear;
        let proratedDistributionRatioForDistributedYear;
        await test.step("Calculate the ratio in which allocation and deallocation is happening", async () => {
            proratedDistributionRatioForDeductedYear = (testDataFile.payloadForEMTLayerCreationYear.layers[0].deAllocationYears[0].value/totalValueForDeductedYear)*dsvS2hValueForDeductedYear;

            proratedDistributionRatioForDistributedYear = (testDataFile.payloadForEMTLayerCreationYear.layers[0].allocationYears[0].value/totalValueForDistributedYear)*dsvS2hValueForDistributionYear;
        });
        
        await test.step("Fetch the demand scenario forecast after the emt layer and validate the response", async () => {
            let getDemandScenarioForecastResponseAfterLayerCreation;    
            testDataFile.payloadForGetDemandScenarioForecastBeforeLayerYearView.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastBeforeLayerYearView.layerIds[0] = layerIdOfEmtLayer;
            getDemandScenarioForecastResponseAfterLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastBeforeLayerYearView);

            let getDemandScenarioForecastResponseBodyAfterLayerCreation;
            getDemandScenarioForecastResponseBodyAfterLayerCreation = await getDemandScenarioForecastResponseAfterLayerCreation.json();


            let dsvS2hValueForDeductedYearAfterLayer;
            let dsvS2hValueForDistributionYearAfterLayer;

            getDemandScenarioForecastResponseBodyAfterLayerCreation.yearlyForecast.forEach(function(eachBaseChannel) {
                if(eachBaseChannel.baseChannel == "DSV_S2H") {
                    eachBaseChannel.forecast.forEach(function(eachYear) {
                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].deAllocationYears[0].year) {
                            dsvS2hValueForDeductedYearAfterLayer = eachYear.amount;
                        }

                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].allocationYears[0].year) {
                            dsvS2hValueForDistributionYearAfterLayer = eachYear.amount;
                        }
                    });
                }
            });

            let totalValueForDeductedYearAfterLayer;
            let totalValueForDistributedYearAfterLayer;
            getDemandScenarioForecastResponseBodyAfterLayerCreation.forecastTotals.grandTotal.forecast.forEach(function(eachYear) {
                if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].deAllocationYears[0].year) {
                    totalValueForDeductedYearAfterLayer = eachYear.amount;
                }
                if(eachYear.year == testDataFile.payloadForEMTLayerCreationYear.layers[0].allocationYears[0].year) {
                    totalValueForDistributedYearAfterLayer = eachYear.amount;
                }
            });

            // Validation
            expect(Math.round(Math.round(dsvS2hValueForDeductedYear)+Math.round(proratedDistributionRatioForDeductedYear))).toEqual(Math.round(dsvS2hValueForDeductedYearAfterLayer));
        });

        await test.step("Delete the layer created before the next test runs", async () => {
            let deleteEmtLayerResponse;
            deleteEmtLayerResponse = await AdjustmentUtility.deleteEMTLayer(request, layerIdOfEmtLayer, demandId, testdatafileDeleteEMT);
        });
    });

    test("Verify User can create EMT Adjustment layer at month and result grid is updated on prorated ratio of other dimension", async ({ request }) => {
        let dsvS2hValueForDeductedMonth;
        let dsvS2hValueForDistributionMonth;
        let totalValueForDeductedMonth;
        let totalValueForDistributedMonth;
        await test.step("Fetch the get demand scenario forecast before the layer creation", async () => {
            let getDemandScenarioForecastResponseBeforeLayerCreation;
            testDataFile.payloadForGetDemandScenarioForecastMonthView.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastMonthView.layerIds[0] = forecastLayerId;
            getDemandScenarioForecastResponseBeforeLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastMonthView);

            let getDemandScenarioForecastResponseBodyBeforeLayerCreation;
            getDemandScenarioForecastResponseBodyBeforeLayerCreation = await getDemandScenarioForecastResponseBeforeLayerCreation.json();

            getDemandScenarioForecastResponseBodyBeforeLayerCreation.forecast.forEach(function(eachBaseChannel) {
                if(eachBaseChannel.baseChannel == "DSV_S2H") {
                    eachBaseChannel.forecast.forEach(function(eachYear) {
                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationMonth.layers[0].deAllocationMonths[0].quarterOrMonth.year && eachYear.month == testDataFile.payloadForEMTLayerCreationMonth.layers[0].deAllocationMonths[0].quarterOrMonth.quarterOrMonth) {
                            dsvS2hValueForDeductedMonth = eachYear.amount;
                        }

                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationMonth.layers[0].allocationMonths[0].quarterOrMonth.year && eachYear.month == testDataFile.payloadForEMTLayerCreationMonth.layers[0].allocationMonths[0].quarterOrMonth.quarterOrMonth) {
                            dsvS2hValueForDistributionMonth = eachYear.amount;
                        }
                    });
                }
            });

            getDemandScenarioForecastResponseBodyBeforeLayerCreation.forecastTotals.grandTotal.forecast.forEach(function(eachYear) {
                if(eachYear.year == testDataFile.payloadForEMTLayerCreationMonth.layers[0].deAllocationMonths[0].quarterOrMonth.year && eachYear.month == testDataFile.payloadForEMTLayerCreationMonth.layers[0].deAllocationMonths[0].quarterOrMonth.quarterOrMonth) {
                    totalValueForDeductedMonth = eachYear.amount;
                }
                if(eachYear.year == testDataFile.payloadForEMTLayerCreationMonth.layers[0].allocationMonths[0].quarterOrMonth.year && eachYear.month == testDataFile.payloadForEMTLayerCreationMonth.layers[0].allocationMonths[0].quarterOrMonth.quarterOrMonth) {
                    totalValueForDistributedMonth = eachYear.amount;
                }
            });
        });

        let layerIdOfEmtLayer;
        await test.step("Create an EMT Adjustment layer at Annual year", async () => {
            let lockDSSDataResponseForEMTLayer;
            lockDSSDataResponseForEMTLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSDataResponseForEMTLayer).toBeOK();

            let emtLayerCreationResponse;
            testDataFile.payloadForEMTLayerCreationMonth.layers[0].forecastVersion = forecastVersion;
            emtLayerCreationResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFile.payloadForEMTLayerCreationMonth);

            let emtLayerCreationResponseBody;
            emtLayerCreationResponseBody = await emtLayerCreationResponse.json();

            layerIdOfEmtLayer = emtLayerCreationResponseBody[0].layerId;
            console.log("Layer Id of the emt layer created: ", layerIdOfEmtLayer);
        });

        let proratedDistributionRatioForDeductedMonth;
        let proratedDistributionRatioForDistributedMonth;
        await test.step("Calculate the ratio in which allocation and deallocation is happening", async () => {
            proratedDistributionRatioForDeductedMonth = (testDataFile.payloadForEMTLayerCreationMonth.layers[0].deAllocationMonths[0].value/totalValueForDeductedMonth)*dsvS2hValueForDeductedMonth;

            proratedDistributionRatioForDistributedMonth = (testDataFile.payloadForEMTLayerCreationMonth.layers[0].allocationMonths[0].value/totalValueForDistributedMonth)*dsvS2hValueForDistributionMonth;
        });
        
        await test.step("Fetch the demand scenario forecast after the emt layer and validate the response", async () => {
            let getDemandScenarioForecastResponseAfterLayerCreation;    
            testDataFile.payloadForGetDemandScenarioForecastMonthView.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastMonthView.layerIds[0] = layerIdOfEmtLayer;
            getDemandScenarioForecastResponseAfterLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastMonthView);

            let getDemandScenarioForecastResponseBodyAfterLayerCreation;
            getDemandScenarioForecastResponseBodyAfterLayerCreation = await getDemandScenarioForecastResponseAfterLayerCreation.json();

            let dsvS2hValueForDeductedMonthAfterLayer;
            let dsvS2hValueForDistributionMonthAfterLayer;

            getDemandScenarioForecastResponseBodyAfterLayerCreation.forecast.forEach(function(eachBaseChannel) {
                if(eachBaseChannel.baseChannel == "DSV_S2H") {
                    eachBaseChannel.forecast.forEach(function(eachYear) {
                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationMonth.layers[0].deAllocationMonths[0].quarterOrMonth.year && eachYear.month == testDataFile.payloadForEMTLayerCreationMonth.layers[0].deAllocationMonths[0].quarterOrMonth.quarterOrMonth) {
                            dsvS2hValueForDeductedMonthAfterLayer = eachYear.amount;
                        }

                        if(eachYear.year == testDataFile.payloadForEMTLayerCreationMonth.layers[0].allocationMonths[0].quarterOrMonth.year && eachYear.month == testDataFile.payloadForEMTLayerCreationMonth.layers[0].allocationMonths[0].quarterOrMonth.quarterOrMonth) {
                            dsvS2hValueForDistributionMonthAfterLayer = eachYear.amount;
                        }
                    });
                }
            });

            // Validation
            expect(Math.round(Math.round(dsvS2hValueForDeductedMonth)+Math.round(proratedDistributionRatioForDeductedMonth))).toEqual(Math.round(dsvS2hValueForDeductedMonthAfterLayer));
        });

        await test.step("Delete the layer created before the next test runs", async () => {
            let deleteEmtLayerResponse;
            deleteEmtLayerResponse = await AdjustmentUtility.deleteEMTLayer(request, layerIdOfEmtLayer, demandId, testdatafileDeleteEMT);
        });
    });

    test("Verify User can create EMT Adjustment layer at Channel and result grid is updated on prorated ratio of other dimension", async ({ request }) => {
        let getDemandScenarioForecastResponseBodyBeforeLayerCreation;
        await test.step("Fetch the get demand scenario forecast before the layer creation", async () => {
            let getDemandScenarioForecastResponseBeforeLayerCreation;
            testDataFile.payloadForGetDemandScenarioForecastChannelView.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastChannelView.layerIds[0] = forecastLayerId;
            getDemandScenarioForecastResponseBeforeLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastChannelView);

            getDemandScenarioForecastResponseBodyBeforeLayerCreation = await getDemandScenarioForecastResponseBeforeLayerCreation.json();
        });

        let proratedDistributionForChannel;
        let valueAtStartYearAndStartMonthBeforeLayer;
        let startYear = parseInt(getDemandScenarioForecastResponseBodyBeforeLayerCreation?.cutOffDate.substring(0,4));
        let startMonth = parseInt(getDemandScenarioForecastResponseBodyBeforeLayerCreation?.cutOffDate.substring(5, 7))+1;
        const startDate = new Date(startYear, startMonth-1);
        const endDate = new Date(startDate.getFullYear() + 5, startDate.getMonth() + 9);
        const yearMonthList = [];
        for (let date = startDate; date <= endDate; date.setMonth(date.getMonth() + 1)) {
            yearMonthList.push(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`);
        }
        let totalSumForChannel = 0;
        await test.step("Calculate the ratio in which allocation and deallocation is happening", async () => {

            let forecastList;
            getDemandScenarioForecastResponseBodyBeforeLayerCreation.forecast.forEach(function(forecast) {
                if(forecast.baseChannel == "DSV_S2H") {
                    forecastList = forecast.forecast;
                }
            });

            forecastList.forEach(function(forecast) {
                if(forecast.year > startYear || (forecast.year == startYear && forecast.month >= startMonth)) { 
                    totalSumForChannel += forecast.amount;
                }
            });
            
            forecastList.forEach(function(forecast) {
                if(forecast.year == startYear && forecast.month == startMonth) {
                    valueAtStartYearAndStartMonthBeforeLayer = forecast.amount;
                }
            });
            proratedDistributionForChannel = (testDataFile.payloadForEMTLayerCreationChannel.layers[0].deAllocationChannels[0].value/totalSumForChannel)*valueAtStartYearAndStartMonthBeforeLayer;
        });

        let layerIdOfEmtLayer;
        await test.step("Create an EMT Adjustment layer at Channel", async () => {
            let lockDSSDataResponseForEMTLayer;
            lockDSSDataResponseForEMTLayer = await LockUnlockUtility.lockDSSData(request, demandId);
            expect(lockDSSDataResponseForEMTLayer).toBeOK();

            let emtLayerCreationResponse;
            testDataFile.payloadForEMTLayerCreationChannel.layers[0].forecastVersion = forecastVersion;
            emtLayerCreationResponse = await ManageRebaseUtility.createManualAdjustmentLayer(request, demandId, testDataFileManageRebase.endpointForCreateManualAdjustmentLayer, testDataFile.payloadForEMTLayerCreationChannel, yearMonthList);

            let emtLayerCreationResponseBody;
            emtLayerCreationResponseBody = await emtLayerCreationResponse.json();

            layerIdOfEmtLayer = emtLayerCreationResponseBody[0].layerId;
            console.log("Layer Id of the emt layer created: ", layerIdOfEmtLayer);
        });
        
        await test.step("Fetch the demand scenario forecast after the emt layer and validate the response", async () => {
            let getDemandScenarioForecastResponseAfterLayerCreation;    
            testDataFile.payloadForGetDemandScenarioForecastChannelView.version = forecastVersion;
            testDataFile.payloadForGetDemandScenarioForecastChannelView.layerIds[0] = layerIdOfEmtLayer;
            getDemandScenarioForecastResponseAfterLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecastChannelView);

            let getDemandScenarioForecastResponseBodyAfterLayerCreation;
            getDemandScenarioForecastResponseBodyAfterLayerCreation = await getDemandScenarioForecastResponseAfterLayerCreation.json();

            let valueAtStartYearAndStartMonthAfterLayer;

            let forecastList;
            getDemandScenarioForecastResponseBodyAfterLayerCreation.forecast.forEach(function(forecast) {
                if(forecast.baseChannel == "DSV_S2H") {
                    forecastList = forecast.forecast;
                }
            });

            forecastList.forEach(function(forecast) {
                if(forecast.year == startYear && forecast.month == startMonth) {
                    valueAtStartYearAndStartMonthAfterLayer = forecast.amount;
                }
            });

            let totalSumForChannelAfterLayer = 0;
            forecastList.forEach(function(forecast) {
                if(forecast.year > startYear || (forecast.year == startYear && forecast.month >= startMonth)) { 
                    totalSumForChannelAfterLayer += forecast.amount;
                }
            });

            // Validate the base+prorated distribution = new 
            expect(Math.floor(valueAtStartYearAndStartMonthBeforeLayer+proratedDistributionForChannel)).toEqual(Math.floor(valueAtStartYearAndStartMonthAfterLayer));
        });
    });
});