import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import { UploadLayerUtil } from "../fixtures/upload-layer";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { ManageRebaseUtility } from "../fixtures/manage-rebase-utils";
import testdatafileCreateManualAdjustment from '../testdata/create-manual-adjustment-layer.json';
import { AllocationUtils } from "../fixtures/allocation-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";


test.describe("Verify as a user, I want to select the Intel Layer and click on expansion arrow and view the details of Intel Layer. I want ability to view details of data whether it is GMV data or Converted Sales, etc.",
 { tag: "@Regression @intellayergmvdatascannedunitsdetails @ibg-service-scenario-financials @Adjustment" }, () => {
    let demandStackId,
    demandScenarioDetails;

  test.describe.configure({ mode: "serial" });  
  test.beforeAll(async ({ request }) => {
    demandStackId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await UploadLayerUtil.getDemandStackDetails(
      request,
      demandStackId
    );
  });
  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandStackId); });

  test("Verify that in emt layer whether it is gmv or scanned units or converted sales", async ({
    request
  }) => {
    await test.step("Verify that in emt layer whether it is gmv", async () => {
        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
        let emtLayerResponseGmv = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "DOLLAR", "GMV-TEST");
        let layerIdGmv = emtLayerResponseGmv[0].layerId;
        let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
        console.log(getdemandStack);
        for(let i=0;i<getdemandStack.layers.length;i++){
            if(getdemandStack.layers[i].layerId == layerIdGmv){
                const jsonData = JSON.parse(getdemandStack.layers[i].layerJson);
                expect(jsonData.allocationType).toEqual("DOLLAR");
                break;
            }
        }
    })
    
    await test.step("Verify that in emt layer whether it is converted sales", async () => {
      await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
      let emtLayerResponseConvertedSales = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "CONVERTED_SALE", "CONVERTED-SALES-TEST");
      let layerIdConvertedSales = emtLayerResponseConvertedSales[0].layerId;
      let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
      console.log(getdemandStack);
      for(let i=0;i<getdemandStack.layers.length;i++){
          if(getdemandStack.layers[i].layerId == layerIdConvertedSales){
              const jsonData = JSON.parse(getdemandStack.layers[i].layerJson);
              expect(jsonData.allocationType).toEqual("CONVERTED_SALE");
              break;
          }
      }
  })  

  await test.step("Verify that in emt layer whether it is scanned units", async () => {
    await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
    let emtLayerResponseScannedUnits = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "UNIT", "SCANNED-UNITS-TEST");
    let layerIdScannedUnits = emtLayerResponseScannedUnits[0].layerId;
    let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
    console.log(getdemandStack);
    for(let i=0;i<getdemandStack.layers.length;i++){
        if(getdemandStack.layers[i].layerId == layerIdScannedUnits){
            const jsonData = JSON.parse(getdemandStack.layers[i].layerJson);
            expect(jsonData.allocationType).toEqual("UNIT");
            break;
        }
    }
})  
  
  });


    test("Verify if Layer Type is displayed in the Adjustment Layer list table to identify Manual/EMT /Upload", async ({
      request
    }) => {
      test.setTimeout(300000);
    await test.step("Verify if Layer Type is displayed in the Adjustment Layer list table to identify EMT", async () => {
      await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
      let emtLayerResponseGmv = await AdjustmentUtility.emtLayerAdjustment(request, demandStackId, demandScenarioDetails, "DOLLAR", "GMV-TEST");
      let layerTypeemt = emtLayerResponseGmv[0].layerType;
      let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
      let emt = false;
      console.log(getdemandStack);
      for(let i=0;i<getdemandStack.layers.length;i++){
          if(getdemandStack.layers[i].layerType == layerTypeemt){
              emt = true;
              break;
          }
      }
      expect(emt).toEqual(true);
  })

  await test.step("Verify if Layer Type is displayed in the Adjustment Layer list table to identify Manual", async () => {
    let createManualAdjustmentLayerDataResponse;
    await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandStackId);
    createManualAdjustmentLayerDataResponse = await AdjustmentUtility.createManualAdjustmentLayer(request, demandStackId, testdatafileCreateManualAdjustment);
    let manualadjustmentresponse = await createManualAdjustmentLayerDataResponse.json();
    let layerTypemanual = manualadjustmentresponse[0].layerType;
    let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
    let manual = false;
    console.log(getdemandStack);
    for(let i=0;i<getdemandStack.layers.length;i++){
        if(getdemandStack.layers[i].layerType == layerTypemanual){
            manual = true;
            break;
        }
    }
    expect(manual).toEqual(true);
})

await test.step("Verify if Layer Type is displayed in the Adjustment Layer list table to identify Upload", async () => {
  let response = await UploadLayerUtil.verifyUploadExcel(
    request,
    demandStackId,
    demandScenarioDetails
  );
  let layerTypeupload = response[0].layerType;  
  let getdemandStack = await AllocationUtils.getDemandScenarioStack(request, demandStackId);
  let upload = false;
  console.log(getdemandStack);
  for(let i=0;i<getdemandStack.layers.length;i++){
    if(getdemandStack.layers[i].layerType == layerTypeupload){
      upload = true;
      break;
  }
  }
  expect(upload).toEqual(true);
})
  
  });
})
