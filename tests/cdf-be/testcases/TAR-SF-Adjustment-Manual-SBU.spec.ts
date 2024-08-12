import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import updateDemandStacksData from "../testdata/update-demand-stack-channel-data.json"



test.describe("Verify user is able to edit the Value at SBU Level and the data is distributed to the department under it on prorated ratio",
 { tag: "@Regression @sbuadjustment @ibg-service-scenario-financials @Allocation Layer" }, () => {
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

  test("Verify user is able to edit the Value at SBU Level and the data is distributed to the department under it on prorated ratio  ", async ({
    request
  }) => {
    await test.step("Verify user is able to edit the Value at SBU Level and the data is distributed to the department under it on prorated ratio"    , async () => {
    let loadHeirarchyParams = {
            "baseChannel": [],
            "baseChannelIds": [],
            "sbu": [
              "FOOD"
            ],
            "sbuIds": [
              27
            ],
            "organizationalLevel": "DEPARTMENT"
          };
      let getdemandforecastbeforeAdjustmentSbu = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [], "DEPARTMENT", loadHeirarchyParams);
      let deptvalue, postdeptAmount1, postdeptAmount2, postdeptvalue, deptAmount1, deptAmount2;
      deptvalue = getdemandforecastbeforeAdjustmentSbu.yearlyForecast[0].forecast;
      for(let i=0;i<deptvalue.length;i++){
        if (deptvalue[i].year == "2025"){
            deptAmount1 = deptvalue[i].amount;
        }
        if (deptvalue[i].year == "2026"){
            deptAmount2 = deptvalue[i].amount;
        }
      }      
      await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
      updateDemandStacksData.payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version;
      let manualadjustment = await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, updateDemandStacksData);
      let manualadjustmentresponse = await manualadjustment.json();
      let layerId = manualadjustmentresponse[0].layerId;
      let getdemandforecastSbu = await DemandBaseClass.getdemandStackForecast(request, demandStackId, demandScenarioDetails, "YEAR", [layerId], "DEPARTMENT", loadHeirarchyParams);
      postdeptvalue = getdemandforecastSbu.yearlyForecast[0].forecast;
      for(let i=0;i<postdeptvalue.length;i++){
        if (postdeptvalue[i].year == "2025"){
            postdeptAmount1 = postdeptvalue[i].amount;
        }
        if (postdeptvalue[i].year == "2026"){
            postdeptAmount2 = postdeptvalue[i].amount;
        }
      }
      expect(Math.floor(deptAmount1/deptAmount2).toFixed(6)).toEqual(Math.floor(postdeptAmount1/postdeptAmount2).toFixed(6)); 
  })

  });

})