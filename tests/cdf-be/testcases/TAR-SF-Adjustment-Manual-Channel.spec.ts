import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import updateDemandStacksData from "../testdata/update-demand-stack-channel-data.json"



test.describe("Verify user is able to edit the Value at Channel Level and the data is distributed to the SBUs under it on prorated ratio",
 { tag: "@Regression @channeladjustment @ibg-service-scenario-financials @Allocation Layer" }, () => {
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

  test("Verify user is able to edit the Value at Channel Level and the data is distributed to the SBUs under it on prorated ratio ", async ({
    request
  }) => {
    await test.step("Verify user is able to edit the Value at Channel Level and the data is distributed to the SBUs under it on prorated ratio", async () => {
      let getdemandforecastbeforeAdjustmentChannel = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [], "BASE_CHANNEL", null);
      let getdemandforecastbeforeAdjustmentSbu = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [], "SBU", null);
      let channelValue, sbuvalue, posteditChannel, posteditSbu, channelAmount, sbuAmount;
      channelValue = getdemandforecastbeforeAdjustmentChannel.yearlyForecast[0].forecast; 
      sbuvalue = getdemandforecastbeforeAdjustmentSbu.yearlyForecast[0].forecast;
      for(let i=0;i<channelValue.length;i++){
        if (channelValue[i].year == "2025"){
            channelAmount = channelValue[i].amount;
            break;
        }
      }   
      for(let i=0;i<sbuvalue.length;i++){
        if (sbuvalue[i].year == "2025"){
            sbuAmount = sbuvalue[i].amount;
        }
      }      
      await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
      updateDemandStacksData.payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
      let manualadjustment = await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, updateDemandStacksData);
      let manualadjustmentresponse = await manualadjustment.json();
      let layerId = manualadjustmentresponse[0].layerId;
      let getdemandforecastChannel = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [layerId], "BASE_CHANNEL", null);
      let getdemandforecastSbu = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [layerId], "SBU", null);
      let postdemandforecastChannel = getdemandforecastChannel.yearlyForecast[0].forecast;
      let postdemandforecastSbu = getdemandforecastSbu.yearlyForecast[0].forecast;
      for(let i=0;i<postdemandforecastChannel.length;i++){
        if (postdemandforecastChannel[i].year == "2025"){
            posteditChannel = postdemandforecastChannel[i].amount;
            break;
        }
      }  
      for(let i=0;i<postdemandforecastSbu.length;i++){
        if (postdemandforecastSbu[i].year == "2025"){
            posteditSbu = postdemandforecastSbu[i].amount;
        }
      }
      expect(Math.floor(posteditSbu/sbuAmount).toFixed(6)).toEqual(Math.floor(posteditChannel/channelAmount).toFixed(6)); 
  })

  });

})