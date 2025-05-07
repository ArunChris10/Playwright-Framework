import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/new-aop-version.json";
import { AOPUtils } from '../fixtures/aop-utils';
import { executeAOPSteps } from '../fixtures/aop-publish-steps-utils';
import adjustmentData from "../testdata/adjustment.json";
import aopEdits from "../testdata/aop-edits.json";
import forecastData from "../testdata/forecast-api.json";
export interface NodeDimension { };


test.describe.serial('Execute and validate AOP publish iterations sequentially', 
  { tag: "@Smoke @Regression @aop @perf" },
  () => {
  // pre-condition
  test('Run AOP publish steps', async ({ request }) => {
    await test.step('Run first iteration for AOP publish', async () => {
      await executeAOPSteps(request, aopEdits.allocation_payload.allocation_request.edits);
    });
  });
  
  //test
  test('check if forecast period retains edits after publish', async ({ request }) => {
    let responseBody, utilResponse, newUtilResponse;
    const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;
    const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
    let gmvPlusServicesForecast, gmvPlusServicesLessReturnsForecast, unitsgrossuomngForecast, unitsuomlessreturnsForecast, workedunitsForecast;
    let newGmvPlusServicesForecast, newGmvPlusServicesLessReturnsForecast, newUnitsgrossuomngForecast, newUnitsuomlessreturnsForecast, newWorkedunitsForecast;
    
    let kpiResponse, kpiResponseBody;
    
    await test.step("Make a get Request for fetching AOP details", async () => {
        Utility.logIt("Make a get Request for fetching AOP details");
        utilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(utilResponse);
        utilResponse = JSON.parse(await utilResponse.text());
    });
    const scenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

    const aopPayload = {
        scenario_id: scenarioAOPDetails.scenario_id,
        scenario_version: scenarioAOPDetails.scenario_version,
        };

    await test.step("Edit and save a cell in AOP scenario", async () => {
        Utility.logIt("Edit and save a cell in AOP scenario");

        let adjustment_payload = aopEdits.allocation_payload;

        adjustment_payload.adjustment_metadata.scenario_id = aopPayload.scenario_id;
        adjustment_payload.adjustment_metadata.scenario_version_timestamp = aopPayload.scenario_version;
        adjustment_payload.allocation_request.scenario_id = aopPayload.scenario_id;

        const response = await request.patch(adjustmentEndpointURL, {
          data: adjustment_payload,
        });
        responseBody = await Utility.assertAndLog(response);
        expect(responseBody.message).toBe(aopEdits.adjustment_success);
    });

    await test.step("Make a Post Request for getting the forecast data", async () => {
      Utility.logIt("Make a Post Request for getting the forecast data");

      let kpiPayload = aopEdits.getKpiForecast.payload;
      kpiPayload.scenario_id = aopPayload.scenario_id;
      kpiPayload.scenario_version = aopPayload.scenario_version;
      kpiResponse = await request.post(kpiEndpointURL, {data: kpiPayload});
      kpiResponseBody = await Utility.assertAndLog(kpiResponse);
    });

    gmvPlusServicesForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[aopEdits.yearMonth].forecast;
    gmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns)[aopEdits.yearMonth].forecast;
    unitsgrossuomngForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input)[aopEdits.yearMonth].forecast;
    unitsuomlessreturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns)[aopEdits.yearMonth].forecast;
    workedunitsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[aopEdits.yearMonth].forecast;

    console.log("GMV + Services Updated:", gmvPlusServicesForecast);
    console.log("GMV + Services less Returns Updated:", gmvPlusServicesLessReturnsForecast);
    console.log("Units Gross UOM NG Updated:", unitsgrossuomngForecast);
    console.log("Units UOM Less Returns Updated:", unitsuomlessreturnsForecast);
    console.log("Worked Units Updated:", workedunitsForecast);


    await test.step("Make a Post Request for publishing AOP", async () => {
        Utility.logIt("Make a Post Request for publishing AOP");
        responseBody = await request.post(endpointUploadURL, {
          data: aopPayload,
        });
        if (!responseBody.ok()) {
          console.error(`API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`);
        }
        await Utility.assertAndLog(responseBody);
        responseBody = JSON.parse(await responseBody.text());

      });

       
    await test.step("Make a get Request for fetching new AOP details", async () => {
        Utility.logIt("Make a get Request for fetching new AOP details");
        newUtilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(newUtilResponse);
        newUtilResponse = JSON.parse(await newUtilResponse.text());
    });
    const newScenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

    const newAopPayload = {
        scenario_id: newScenarioAOPDetails.scenario_id,
        scenario_version: newScenarioAOPDetails.scenario_version,
        };

    // assertion
    await test.step("Make a Post Request for getting the forecast data again", async () => {
        Utility.logIt("Make a Post Request for getting the forecast data again");
    
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = newAopPayload.scenario_id;
        kpiPayload.scenario_version = newAopPayload.scenario_version;
        kpiResponse = await request.post(kpiEndpointURL, {data: kpiPayload});
        kpiResponseBody = await Utility.assertAndLog(kpiResponse);


        newGmvPlusServicesForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[aopEdits.yearMonth].forecast;
        newGmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns)[aopEdits.yearMonth].forecast;
        newUnitsgrossuomngForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input)[aopEdits.yearMonth].forecast;
        newUnitsuomlessreturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns)[aopEdits.yearMonth].forecast;
        newWorkedunitsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[aopEdits.yearMonth].forecast;
    
        console.log("GMV + Services Updated:", newGmvPlusServicesForecast);
        console.log("GMV + Services less Returns Updated:", newGmvPlusServicesLessReturnsForecast);
        console.log("Units Gross UOM NG Updated:", newUnitsgrossuomngForecast);
        console.log("Units UOM Less Returns Updated:", newUnitsuomlessreturnsForecast);
        console.log("Worked Units Updated:", newWorkedunitsForecast);
        });
    
        expect(Math.round(newGmvPlusServicesForecast)).toEqual(Math.round((gmvPlusServicesForecast)));
        expect(Math.round(newGmvPlusServicesLessReturnsForecast)).toEqual(Math.round(gmvPlusServicesLessReturnsForecast));
        expect(Math.round(newUnitsgrossuomngForecast)).toEqual(Math.round(unitsgrossuomngForecast));
        expect(Math.round(newUnitsuomlessreturnsForecast)).toEqual(Math.round(unitsuomlessreturnsForecast));
        expect(Math.round(newWorkedunitsForecast)).toEqual(Math.round(workedunitsForecast));
      


  });

});
  