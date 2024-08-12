import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import updateDemandStacksData from "../testdata/update-demand-stack.json"



test.describe("Verify user is able to edit the Value at Year/Quarter Dimension and the data is distributed to the Months under it on prorated ratio",
 { tag: "@Regression @yearquarterupdateallocation @ibg-service-scenario-financials @Allocation Layer" }, () => {
    let demandStackId,
    demandScenarioDetails;
    let yearValue, monthvalue, postYearValue, postMonthValue, yearAmount, monthAmount, postYearAmount, postMonthAmount;
  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
      request,
      demandStackId
    );
  });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandStackId); });

  test("Verify user is able to edit the Value at Year Dimension and the data is distributed to the Months under it on prorated ratio ", async ({
    request
  }) => {
    await test.step("Fetch values of metrics in year and month view before editing them", async () => {
      let getdemandforecastbeforeAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [], null, null);
      let getdemandforecastbeforeAdjustmentMonth = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "MONTH", [], null, null);
      yearValue = getdemandforecastbeforeAdjustmentYear.yearlyForecast[0].forecast; 
      monthvalue = getdemandforecastbeforeAdjustmentMonth.forecast[0].forecast;
      for(let i=0;i<yearValue.length;i++){
        if (yearValue[i].year == "2025"){
            yearAmount = yearValue[i].amount;
            break;
        }
      }   
      for(let i=0;i<monthvalue.length;i++){
        if (monthvalue[i].year == "2025"){
            monthAmount = monthvalue[i].amount;
        }
      }      
  })

  await test.step("Fetch values of metrics in year and month view post editing and validate the prorated ratio ", async () => {
    await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
    updateDemandStacksData.payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
    let manualadjustment = await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, updateDemandStacksData);
    let manualadjustmentresponse = await manualadjustment.json();
    let layerId = manualadjustmentresponse[0].layerId;
    let getdemandforecastAfterAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [layerId], null, null);
    let getdemandforecastAfterAdjustmentMonth = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "MONTH", [layerId], null, null);
    postYearValue = getdemandforecastAfterAdjustmentYear.yearlyForecast[0].forecast;
    postMonthValue = getdemandforecastAfterAdjustmentMonth.forecast[0].forecast;
    for(let i=0;i<postYearValue.length;i++){
      if (postYearValue[i].year == "2025"){
          postYearAmount = postYearValue[i].amount;
          break;
      }
    }  
    for(let i=0;i<postMonthValue.length;i++){
      if (postMonthValue[i].year == "2025"){
          postMonthAmount = postMonthValue[i].amount;
      }
    }
    expect(Math.floor(postMonthAmount/monthAmount).toFixed(6)).toEqual(Math.floor(postYearAmount/yearAmount).toFixed(6)); 
})


  });


  test("Verify user is able to edit the Value at Quarter Dimension and the data is distributed to the Months under it on prorated ratio ", async ({
    request
  }) => {
    let quarterValue, monthvalue, postquarterValue, postMonthValue, quarterAmount, monthAmount, postquarterAmount, postMonthAmount;
    await test.step("Fetch values of metrics in quarter and month view before editing them ", async () => {
      let getdemandforecastbeforeAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "QUARTER", [], null, null);
      let getdemandforecastbeforeAdjustmentMonth = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "MONTH", [], null, null);
      quarterValue = getdemandforecastbeforeAdjustmentYear.quarterlyForecast[0].forecast; 
      monthvalue = getdemandforecastbeforeAdjustmentMonth.forecast[0].forecast;
      for(let i=0;i<quarterValue.length;i++){
        if (quarterValue[i].year == "2025"){
            quarterAmount = quarterValue[i].amount;
        }
      }   
      for(let i=0;i<monthvalue.length;i++){
        if (monthvalue[i].year == "2025"){
            monthAmount = monthvalue[i].amount;
        }
      }      
  })

  await test.step("Fetch values of metrics in quarter and month view post editing and validate the prorated ratio ", async () => {
    await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
    updateDemandStacksData.payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
    let manualadjustment = await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, updateDemandStacksData);
    let manualadjustmentresponse = await manualadjustment.json();
    let layerId = manualadjustmentresponse[0].layerId;
    let getdemandforecastAfterAdjustmentYear = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "QUARTER", [layerId], null, null);
    let getdemandforecastAfterAdjustmentMonth = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "MONTH", [layerId], null, null);
    postquarterValue = getdemandforecastAfterAdjustmentYear.quarterlyForecast[0].forecast;
    postMonthValue = getdemandforecastAfterAdjustmentMonth.forecast[0].forecast;
    for(let i=0;i<postquarterValue.length;i++){
      if (postquarterValue[i].year == "2025"){
          postquarterAmount = postquarterValue[i].amount;
      }
    }  
    for(let i=0;i<postMonthValue.length;i++){
      if (postMonthValue[i].year == "2025"){
          postMonthAmount = postMonthValue[i].amount;
      }
    }
    expect(Math.floor(postMonthAmount/monthAmount).toFixed(6)).toEqual(Math.floor(postquarterAmount/quarterAmount).toFixed(6)); 
})

  });

})