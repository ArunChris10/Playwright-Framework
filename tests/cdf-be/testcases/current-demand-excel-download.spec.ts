import { expect, test } from '../../common/fixtures/test-hook';
import testdatafile from '../testdata/current-demand-excel-download.json';
import testdataDimension from '../testdata/dimensions.json';
import { CdfUtility } from '../fixtures/cdf-utils';
import { DemandBaseClass } from '../fixtures/demand-common-utils'
import debug from 'debug';

test.describe("Verify that the user should be able to download excel from current demand page and verify the data", { tag: "@Smoke @currentDemandExcelDownloadTest @ibg-service-scenario-financials @Regression" }, () => {

    let currentDemandDataResponseBodySBU, currentDemandDataResponseBodyBaseChannel;
    let sbuNames = testdataDimension.sbus.map(item => item.displayName.toUpperCase());
    let baseChannels = testdataDimension.baseChannels

    Object.keys(testdatafile.metrics).forEach(key => {
        let currentDemandDataResponseBodySBU, currentDemandDataResponseBodyBaseChannel;
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
            //Iterate and validate for all the SBUs

            sbuNames.forEach(sbuName => {
                debug.log("Asserting the Values for "+sbuName)
                let filteredData = excelData.find((data:any) => data['Selection Panel'] === sbuName)  as any;
                let valuesToAssert = Object.values(filteredData).slice(2)
                
                debug.log("Excel Data => "+valuesToAssert);
                let currentDemandData;
                let arrayForecast = currentDemandDataResponseBodySBU.forecast.filter(data => data.sbuDisplayName === sbuName)[0]
                if(arrayForecast == undefined)
                valuesToAssert.forEach(value => expect(value).toEqual(0))
                else{
                if (testdatafile.derivedMetrics.includes(key))
                    currentDemandData = currentDemandDataResponseBodySBU.forecast.filter(data => data.sbuDisplayName === sbuName)[0].forecast.filter(data => Object.keys(data).includes("forecastGrowth")).map(data => data.forecastGrowth![key] != undefined?data.forecastGrowth![key]:"");
                else
                    currentDemandData = currentDemandDataResponseBodySBU.forecast.filter(data => data.sbuDisplayName === sbuName)[0].forecast.map(d => d[key] != undefined?d[key]:"");
                debug.log("Current Demand Data => "+currentDemandData)
                CdfUtility.compareExcelDownloadedValuesWithAPIResponse(valuesToAssert, currentDemandData, testdatafile.allowedTolerance)
                }
            });



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

            baseChannels.forEach(channel => {
                debug.log("Asserting the Values for "+channel.displayName)
                let filteredData = excelData.find((data:any) => data['Selection Panel'].toUpperCase() === channel.displayName.toUpperCase()) as any;
                const excelValues = Object.values(filteredData).slice(3);
                
                debug.log("Excel Data => "+excelValues);
                let currentDemandData;
                let arrayForecast = currentDemandDataResponseBodyBaseChannel.forecast.filter(data => data.baseChannel.toUpperCase() === channel.name.toUpperCase())[0]
                if(arrayForecast == undefined)
                excelValues.forEach(value => expect(value).toEqual(0))
                else{
                    if (testdatafile.derivedMetrics.includes(key))
                    currentDemandData = arrayForecast.forecast.filter(data => Object.keys(data).includes("forecastGrowth")).map(data => data.forecastGrowth![key] != undefined?data.forecastGrowth![key]:0);
                    else
                        currentDemandData = arrayForecast.forecast.map(d => d[key] != undefined?d[key]:0);
                    debug.log("Current Demand Data => "+currentDemandData);
                    CdfUtility.compareExcelDownloadedValuesWithAPIResponse(excelValues, currentDemandData, testdatafile.allowedTolerance)

                }
            })

        });
    });

});
