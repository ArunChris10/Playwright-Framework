import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/new-aop-version.json";
import { AOPUtils } from '../fixtures/aop-utils';
import adjustmentData from "../testdata/adjustment.json";
import aopEdits from "../testdata/aop-edits.json";
import forecastData from "../testdata/forecast-api.json";
export interface NodeDimension { };

test.describe(
  "Compare the aop data with new DS scenario",
  { tag: "@Smoke @Regression @aop @perf" },
  () => {
  
    let responseBody, utilResponse, newUtilResponse;
    let gmvPlusServicesForecast, gmvPlusServicesLessReturnsForecast, unitsgrossuomngForecast, unitsuomlessreturnsForecast, workedunitsForecast;
    let kpiResponse, kpiResponseBody;
    const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
    const createEndpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;

    test(`Verify if creation of a new DS scenario does not impact existing AOP scenario data`, async ({
      request,
    }) => {

    // fetch DS and AOP scenario details before AOP edits
    await test.step("Make a get Request for fetching AOP details", async () => {
        Utility.logIt("Make a get Request for fetching AOP details");

        // fetch both DS and AOP scenario details
        utilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(utilResponse);
        utilResponse = JSON.parse(await utilResponse.text());
    });

    // store DS and AOP scenario details before AOP edits
    const scenarioDSDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.ds_classification_id);
    const scenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

    const dsPayload = {
        scenario_id: scenarioDSDetails.scenario_id,
        scenario_version: scenarioDSDetails.scenario_version,
        };

    const aopPayload = {
        scenario_id: scenarioAOPDetails.scenario_id,
        scenario_version: scenarioAOPDetails.scenario_version,
        };

    // make AOP edits
    await test.step("Edit and save data in AOP scenario", async () => {
        Utility.logIt("Edit and save data in AOP scenario");

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

    // fetch new calculated values after successful AOP edits
    await test.step("Make a Post Request for getting the forecast data for AOP before new DS scenario is created", async () => {
      Utility.logIt("Make a Post Request for getting the forecast data for AOP before new DS scenario is created");

      let kpiPayload = aopEdits.getKpiForecast.payload;
      kpiPayload.scenario_id = aopPayload.scenario_id;
      kpiPayload.scenario_version = aopPayload.scenario_version;
      kpiResponse = await request.post(kpiEndpointURL, {data: kpiPayload});
      kpiResponseBody = await Utility.assertAndLog(kpiResponse);
    });

    // store new calculated values after successful AOP edits
    gmvPlusServicesForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[aopEdits.yearMonth].forecast;
    gmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns)[aopEdits.yearMonth].forecast;
    unitsgrossuomngForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input)[aopEdits.yearMonth].forecast;
    unitsuomlessreturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns)[aopEdits.yearMonth].forecast;
    workedunitsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[aopEdits.yearMonth].forecast;

    console.log("GMV + Services before edits:", gmvPlusServicesForecast);
    console.log("GMV + Services less Returns before edits:", gmvPlusServicesLessReturnsForecast);
    console.log("Units Gross UOM NG before edits:", unitsgrossuomngForecast);
    console.log("Units UOM Less Returns before edits:", unitsuomlessreturnsForecast);
    console.log("Worked Units before edits:", workedunitsForecast);

    // create a new DS scenario
    await test.step("Make a Post Request to create a new DS scenario", async () => {
        Utility.logIt("Make a Post Request to create a new DS scenario");
        responseBody = await request.post(createEndpointURL, {
          data: aopEdits.createDSScenarioPayload,
        });
        if (!responseBody.ok()) {
          console.error(`API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`);
        }
        await Utility.assertAndLog(responseBody);
        responseBody = JSON.parse(await responseBody.text());

      });

    //  fetch AOP scenario details after AOP edits
    await test.step("Make a get Request for fetching AOP details", async () => {
        Utility.logIt("Make a get Request for fetching AOP details");

        // fetch AOP scenario details
        newUtilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(newUtilResponse);
        newUtilResponse = JSON.parse(await newUtilResponse.text());
    });

    //  fetch AOP scenario details after AOP edits
    const newScenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

    const newAopPayload = {
        scenario_id: newScenarioAOPDetails.scenario_id,
        scenario_version: newScenarioAOPDetails.scenario_version,
        };

    // Assertion
    await test.step("Make a Post Request for getting the forecast data for AOP after DS publish", async () => {
        Utility.logIt("Make a Post Request for getting the forecast data for AOP after DS publish");

        // check if scenario id and version has not changed for the latest AOP scenario
        expect(scenarioAOPDetails.scenario_id).toEqual(newScenarioAOPDetails.scenario_id);
        expect(scenarioAOPDetails.scenario_version).toEqual(newScenarioAOPDetails.scenario_version);

        // check if data for edited nodes in AOP scenario, after creating a new DS scenario, is same as before the new DS scenario was created
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = newAopPayload.scenario_id;
        kpiPayload.scenario_version = newAopPayload.scenario_version;
        kpiResponse = await request.post(kpiEndpointURL, {data: kpiPayload});
        kpiResponseBody = await Utility.assertAndLog(kpiResponse);

        let gmvPlusServicesForecastPostEdit = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[aopEdits.yearMonth].forecast;
        let gmvPlusServicesLessReturnsForecastPostEdit = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns)[aopEdits.yearMonth].forecast;
        let unitsgrossuomngForecastPostEdit = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input)[aopEdits.yearMonth].forecast;
        let unitsuomlessreturnsForecastPostEdit = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns)[aopEdits.yearMonth].forecast;
        let workedunitsForecastPostEdit = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[aopEdits.yearMonth].forecast;
    
        console.log("GMV + Services after edits:", gmvPlusServicesForecastPostEdit);
        console.log("GMV + Services less Returns after edits:", gmvPlusServicesLessReturnsForecastPostEdit);
        console.log("Units Gross UOM NG after edits:", unitsgrossuomngForecastPostEdit);
        console.log("Units UOM Less Returns after edits:", unitsuomlessreturnsForecastPostEdit);
        console.log("Worked Units after edits:", workedunitsForecastPostEdit);

        expect(Math.round(gmvPlusServicesForecast)).toEqual(Math.round(gmvPlusServicesForecastPostEdit));
        expect(Math.round(gmvPlusServicesLessReturnsForecast)).toEqual(Math.round(gmvPlusServicesLessReturnsForecastPostEdit));
        expect(Math.round(unitsgrossuomngForecast)).toEqual(Math.round(unitsgrossuomngForecastPostEdit));
        expect(Math.round(unitsuomlessreturnsForecast)).toEqual(Math.round(unitsuomlessreturnsForecastPostEdit));
        expect(Math.round(workedunitsForecast)).toEqual(Math.round(workedunitsForecastPostEdit));
      });
  
    });
  }
);
