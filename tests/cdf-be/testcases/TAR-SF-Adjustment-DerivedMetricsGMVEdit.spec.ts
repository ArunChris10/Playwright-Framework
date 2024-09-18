import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils";
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import updateDemandStacksData from "../testdata/update-demand-stack.json"
import testDataFileManageRebase from '../testdata/manage-rebase.json';
import testDataFileAdjustmentUpload from '../testdata/adjustment-upload-layer.json';
import testDataFile from '../testdata/adjustment-upload-layer.json';

test.describe("Verify if adding all type of adjustment layer for Scanned Units data automatically updates the GMV shipped data and other derived metrics",
 { tag: "@Regression @gmvallocation @ibg-service-scenario-financials @Allocation Layer" }, () => {
    let demandStackId,
    demandScenarioDetails,
    forecastVersion,
    forecastLayerId;

    let excelFileName = `download_${new Date().getTime()}_data.xlsx`;

  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
      request,
      demandStackId
    );
  });

  test.beforeAll(async ({ request }) => {
    forecastVersion = await CdfUtility.getDemandScenarioList(request);
    forecastVersion = forecastVersion.version;
    console.log("Forecast Version: ", forecastVersion);
    let forecastInfoResponse
    forecastInfoResponse = await ManageRebaseUtility.getForecastInfoList(request, demandStackId, testDataFileManageRebase.endpointForForecastInfoList, testDataFileManageRebase.payloadForForecastInfoList);

    let forecastInfoResponseBody
    forecastInfoResponseBody = await forecastInfoResponse.json();

    // Fetch the layerId for the forecast version of the DSS created 
    forecastInfoResponseBody.forEach(function(forecastInfo) {
        if(forecastInfo.version == forecastVersion) {
            forecastLayerId = forecastInfo.forecastLayerId;
        }
    });
  })

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandStackId); });

  test("Verify if adding emt layer for GMV data automatically updates the GMV shipped data and other derived metrics", async ({
    request
  }) => {
    await test.step("Verify if adding emt layer for GMV data automatically updates the GMV shipped data and other derived metrics ", async () => {
      let getdemandforecastbeforeAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [], null, null);  
      await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
      let emtLayerResponseGmv = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "DOLLAR", "GMV-TEST");
      let layerId = emtLayerResponseGmv[0].layerId;
      let getdemandforecastAfterAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [layerId], null, null);
      let yearValue, postYearValue, yearAmount, postYearAmount, yearAur, yearUnits, postYearUnits, postYearAur;
      yearValue = getdemandforecastbeforeAdjustmentYear.yearlyForecast[0].forecast; 
      postYearValue = getdemandforecastAfterAdjustmentYear.yearlyForecast[0].forecast;
      console.log(yearValue); 
      for(let i=0;i<postYearValue.length;i++){
        if (postYearValue[i].year == "2025"){
            postYearAmount = postYearValue[i].amount;
            postYearAur = postYearValue[i].aur;
            postYearUnits = postYearValue[i].units;
            break;
        }
      }    
      expect(Math.floor(postYearAmount/postYearUnits).toFixed(6)).toEqual(Math.floor(postYearAur).toFixed(6)); 
  })
});

test("Verify if adding Manual adjustment layer for GMV data automatically updates the GMV shipped data and other derived metrics", async ({
  request
}) => {
  await test.step("Verify if adding manual layer for GMV data automatically updates the GMV shipped data and other derived metrics ", async () => {
    let getdemandforecastbeforeAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [], null, null);  
    await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
    updateDemandStacksData.payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
    let manualadjustment = await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, updateDemandStacksData);
    let manualadjustmentresponse = await manualadjustment.json();
    let layerId = manualadjustmentresponse[0].layerId;
    let getdemandforecastAfterAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [layerId], null, null);
    let yearValue, postYearValue, yearAmount, postYearAmount, yearAur, yearUnits, postYearUnits, postYearAur;
    yearValue = getdemandforecastbeforeAdjustmentYear.yearlyForecast[0].forecast; 
    postYearValue = getdemandforecastAfterAdjustmentYear.yearlyForecast[0].forecast;
    for(let i=0;i<postYearValue.length;i++){
      if (postYearValue[i].year == "2025"){
        postYearAmount = postYearValue[i].amount;
        postYearAur = postYearValue[i].aur;
        postYearUnits = postYearValue[i].units;
          break;
      }
    }    
    expect(Math.floor(postYearAmount/postYearUnits).toFixed(6)).toEqual(Math.floor(postYearAur).toFixed(6)); 
})
});

test("Verify if adding upload layer for GMV data automatically updates the GMV shipped data and other derived metrics", async ({
  request
}) => {

    let gmvValueBeforeLayerCreation;
    let aurValueBeforeLayerCreation;
    let scannedUnitsValueBeforeLayerCreation;
    await test.step("Fetch the get-demand-scenario-forecast before creating layers", async () => {
        let getDemandScenarioForecastResponseBeforeLayerCreation;
        testDataFile.payloadForGetDemandScenarioForecast.version = forecastVersion;
        testDataFile.payloadForGetDemandScenarioForecast.layerIds[0] = forecastLayerId;
        getDemandScenarioForecastResponseBeforeLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandStackId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecast);

        let getDemandScenarioForecastResponseBodyBeforeLayerCreation;
        getDemandScenarioForecastResponseBodyBeforeLayerCreation = await getDemandScenarioForecastResponseBeforeLayerCreation.json();

        getDemandScenarioForecastResponseBodyBeforeLayerCreation.forecast.forEach(function(eachDetail) {
            if(eachDetail.department == "CANDY") {
                gmvValueBeforeLayerCreation = eachDetail.forecast[0].amount;
                aurValueBeforeLayerCreation = eachDetail.forecast[0].aur;
                scannedUnitsValueBeforeLayerCreation = eachDetail.forecast[0].units;
            }
        });
        console.log("GMV Value before: ", gmvValueBeforeLayerCreation);
        console.log("ScannedUnits Value before: ", scannedUnitsValueBeforeLayerCreation);
        console.log("AUR values before creation: ", aurValueBeforeLayerCreation);
    }); 

    await test.step("Download the excel", async () => {
      let downloadExcelResponse;  
      downloadExcelResponse = await AdjustmentUploadLayer.downloadExcel(request, demandStackId, forecastVersion, forecastLayerId, excelFileName, "GMV Shipped", null);     
    });

    let layerIdOfUploadLayer;
    await test.step("Update the excel by changing the value and upload the updated excel", async () => {
        let lockDSSResponseForUploadLayer;
        lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandStackId);
        expect(lockDSSResponseForUploadLayer).toBeOK();

        let uploadLayersResponse;

        let cellsToUpdate = [
            { position: testDataFileAdjustmentUpload.cellPositionForDepartment, value: testDataFile.valueToBeUpdated }
        ];

        uploadLayersResponse = await AdjustmentUploadLayer.uploadExcel(request, demandStackId, forecastVersion, excelFileName, cellsToUpdate);

        let uploadLayersResponseBody;
        uploadLayersResponseBody = await uploadLayersResponse.json();
        
        layerIdOfUploadLayer = uploadLayersResponseBody[0].layerId;
        console.log("Layer Id of the upload layer: ", layerIdOfUploadLayer);
    });

    await test.step("Validate the values before and after the upload", async () => {
      let getDemandScenarioForecastResponseAfterLayerCreation;
      testDataFile.payloadForGetDemandScenarioForecast.version = forecastVersion;
      testDataFile.payloadForGetDemandScenarioForecast.layerIds[0] = layerIdOfUploadLayer;
      getDemandScenarioForecastResponseAfterLayerCreation = await ManageRebaseUtility.getDemandScenarioForecast(request, demandStackId, testDataFileManageRebase.endpointForGetDemandScenarioForecast, testDataFile.payloadForGetDemandScenarioForecast);

      let getDemandScenarioForecastResponseBodyAfterLayerCreation;
      getDemandScenarioForecastResponseBodyAfterLayerCreation = await getDemandScenarioForecastResponseAfterLayerCreation.json();

      // Get the GMV, Scanned Units and AUR value of dept
      let gmvValueAfterLayerCreation;
      let scannedUnitsValueAfterLayerCreation;
      let aurValueAfterLayerCreation;

      getDemandScenarioForecastResponseBodyAfterLayerCreation.forecast.forEach(function(eachDetail) {
          if(eachDetail.department == "CANDY") {
              gmvValueAfterLayerCreation = eachDetail.forecast[0].amount;
              scannedUnitsValueAfterLayerCreation = eachDetail.forecast[0].units;
              aurValueAfterLayerCreation = eachDetail.forecast[0].aur;
          }
      });

      console.log("GMV Value after: ", gmvValueAfterLayerCreation);
      console.log("ScannedUnits Value after: ", scannedUnitsValueAfterLayerCreation);
      console.log("AUR values before after: ", aurValueAfterLayerCreation);

      expect(Math.floor(gmvValueAfterLayerCreation/scannedUnitsValueAfterLayerCreation)).toEqual(Math.floor(aurValueAfterLayerCreation));
    });
  });
});