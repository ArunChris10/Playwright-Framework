import { expect, test } from '../../common/fixtures/test-hook';
import testdatafile from '../testdata/current-demand-excel-download.json';
import { CdfUtility } from '../fixtures/cdf-utils';
import { DemandBaseClass } from '../fixtures/demand-common-utils'
import debug from 'debug';

test.describe("Verify that the user should be able to download excel from current demand page and verify the data", { tag: "@Smoke @currentDemandExcelDownloadTest" }, () => {

    let currentDemandDataResponseBodySBU, currentDemandDataResponseBodyBaseChannel;

    Object.keys(testdatafile.metrics).forEach(key => {
        // let currentDemandDataResponseBodySBU, currentDemandDataResponseBodyBaseChannel;
        test(`Download excel, save the excel and validate data for SBU view and metric ${testdatafile.metrics[key]}`, async ({ request }) => {
            // get current demand data
            if (currentDemandDataResponseBodySBU == undefined){
                debug.log("Fetching current demand data for SBU view");
                let currentDemandDataResponseSBU = await CdfUtility.currentDemandForMetric(request, testdatafile.slotId1, null, testdatafile.sbuOrganizationalLevel, "");
                expect(currentDemandDataResponseSBU).toBeOK();
                currentDemandDataResponseBodySBU = await currentDemandDataResponseSBU.json();
            }

            let excelDownloadResponse = await CdfUtility.currentDemandForMetric(request, testdatafile.slotId1, testdatafile.metrics[key], testdatafile.sbuOrganizationalLevel, testdatafile.excelType);
            expect(excelDownloadResponse).toBeOK();
            let excelData = await DemandBaseClass.getSheetDataFromExcel(excelDownloadResponse);
            let filteredData = excelData.find((data:any) => data['Selection Panel'] === 'CONSUMABLES') as any;
            const valuesToAssert = Object.values(filteredData).slice(2);
            debug.log(valuesToAssert);
            let currentDemandData;
            if (testdatafile.derivedMetrics.includes(key))
                currentDemandData = currentDemandDataResponseBodySBU.forecast.filter(data => data.sbuDisplayName === 'CONSUMABLES')[0].forecast.filter(data => Object.keys(data).includes("forecastGrowth")).map(data => data.forecastGrowth![key] != undefined?data.forecastGrowth![key]:"");
            else
                currentDemandData = currentDemandDataResponseBodySBU.forecast.filter(data => data.sbuDisplayName === 'CONSUMABLES')[0].forecast.map(d => d[key] != undefined?d[key]:"");
            debug.log(currentDemandData)
            expect(valuesToAssert).toEqual(currentDemandData)
        });

        test(`Download excel, save the excel and validate data for Base Channel view and metric ${testdatafile.metrics[key]}`, async ({ request }) => {
            if (currentDemandDataResponseBodyBaseChannel == undefined){
                debug.log("Fetching current demand data for Base Channel view");
                let currentDemandDataResponse = await CdfUtility.currentDemandForMetric(request, testdatafile.slotId1, null, testdatafile.baseChannelOrgLevel, "");
                expect(currentDemandDataResponse).toBeOK();
                currentDemandDataResponseBodyBaseChannel = await currentDemandDataResponse.json();
            }

            let excelDownloadResponse = await CdfUtility.currentDemandForMetric(request, testdatafile.slotId1, testdatafile.metrics[key], testdatafile.baseChannelOrgLevel, testdatafile.excelType);
            expect(excelDownloadResponse).toBeOK();
            let excelData = await DemandBaseClass.getSheetDataFromExcel(excelDownloadResponse);
            let filteredData = excelData.find((data:any) => data['Selection Panel'] === 'DSV S2H') as any;
            const valuesToAssert = Object.values(filteredData).slice(3);
            debug.log(valuesToAssert);
            let currentDemandData;
            if (testdatafile.derivedMetrics.includes(key))
                currentDemandData = currentDemandDataResponseBodyBaseChannel.forecast.filter(data => data.baseChannel === 'DSV_S2H')[0].forecast.filter(data => Object.keys(data).includes("forecastGrowth")).map(data => data.forecastGrowth![key] != undefined?data.forecastGrowth![key]:0);
            else
                currentDemandData = currentDemandDataResponseBodyBaseChannel.forecast.filter(data => data.baseChannel === 'DSV_S2H')[0].forecast.map(d => d[key] != undefined?d[key]:0);
            debug.log(currentDemandData);
            expect(valuesToAssert).toEqual(currentDemandData)
        });
    });

});