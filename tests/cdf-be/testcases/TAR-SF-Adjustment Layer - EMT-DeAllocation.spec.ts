import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from '../fixtures/cdf-utils';
import { LockUnlockUtility } from '../fixtures/lock-unlock-utils';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import testdatafileCreateEMT from '../testdata/create-emt-layer.json';
import getCurrentDemandForecastInitial from '../testdata/get-demand-scenario-forecast-initial.json';
import getCurrentDemandForecast from '../testdata/get-demand-scenario-forecast.json';

let demandScenario;
let layerId;
let amount;
let amountAfterDeallocation;
let diff;

test.describe.configure({ timeout: 120_000, mode: 'serial' });
   
test.describe("Verify user can decallocate in EMT layer", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT @emtAdjustmentLayer"}, () => {
    
    let demandId;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify user is able to create a EMT Layer and deallocate", async ({ request }) => {
        let lockDSSDataResponse;
        lockDSSDataResponse = await LockUnlockUtility.lockDSSData(request, demandId);
        expect(lockDSSDataResponse).toBeOK();
    
        let emtLayerCreationResponse;
        testdatafileCreateEMT.payload.layers[0].deAllocationSbus[0].value = -1;
        emtLayerCreationResponse = await AdjustmentUtility.createEMTLayer(request, demandId, testdatafileCreateEMT);
    
        expect(emtLayerCreationResponse).toBeOK();

        let getCreateEmtLayerDataResponseBody = await emtLayerCreationResponse.json();
        layerId = getCreateEmtLayerDataResponseBody[0].layerId;

        let deallocationVal  = getCreateEmtLayerDataResponseBody[0].deAllocationSbus[0].value;
        expect(deallocationVal).toEqual(testdatafileCreateEMT.payload.layers[0].deAllocationSbus[0].value);
        
        delete getCreateEmtLayerDataResponseBody[0].layerId;
        delete getCreateEmtLayerDataResponseBody[0].dateCreated;
        delete getCreateEmtLayerDataResponseBody[0].lastModified;    
    });

    test("Verify if the data is shown as per selected filters initial @getdemandscenario", async ({
      request
    }) => {
        demandScenario = await CdfUtility.getDemandScenario(request, getCurrentDemandForecastInitial.payload);
        console.log(demandScenario.forecast.length);
        let total = 0;
        for(let i=0; i<demandScenario.forecast.length; i++) {
          if(demandScenario.forecast[i].sbu === "FOOD") {
              for (let j = 0; j < demandScenario.forecast[i].forecast.length; j++) {
                  total  =  total + demandScenario.forecast[i].forecast[j].amount;
              }
          }
        }
        amount = total;
    });

    test("Verify if the data is shown as per selected filters @getdemandscenario", async ({
        request
      }) => {
          let demandScenario;
          getCurrentDemandForecast.payload.layerIds[0] = layerId;
          demandScenario = await CdfUtility.getDemandScenario(request, getCurrentDemandForecast.payload);
          let total = 0;
          for(let i=0; i<demandScenario.forecast.length; i++) {
            if(demandScenario.forecast[i].sbu === "FOOD") {           
                for (let j = 0; j < demandScenario.forecast[i].forecast.length; j++) {
                    total  =  total + demandScenario.forecast[i].forecast[j].amount;
                }
            }
          }
          amountAfterDeallocation = total;
    });

    test.afterAll(async ({ request }) => { 
          diff = amountAfterDeallocation - amount;
          const differenceRound = Math.round(diff);
          let deAllocationVal = testdatafileCreateEMT.payload.layers[0].deAllocationSbus[0].value
          expect(diff).toBe(deAllocationVal);
    });

});


