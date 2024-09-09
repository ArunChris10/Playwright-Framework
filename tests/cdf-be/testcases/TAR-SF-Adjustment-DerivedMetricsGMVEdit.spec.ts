import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import updateDemandStacksData from "../testdata/update-demand-stack.json"



test.describe("Verify if adding all type of adjustment layer for Scanned Units data automatically updates the GMV shipped data and other derived metrics",
 { tag: "@Regression @gmvallocation @ibg-service-scenario-financials @Allocation Layer" }, () => {
    let demandStackId,
    demandScenarioDetails;

  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
      request,
      demandStackId
    );
  });

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
await test.step("Verify if uploading file for GMV data automatically updates the GMV shipped data and other derived metrics ", async () => {
    let getdemandforecastbeforeAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [], null, null);  
    await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
    const response = await UploadLayerUtil.verifyUploadExcel(
        request,
        demandStackId,
        demandScenarioDetails
      );
    let layerId = response[0].layerId;
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
})