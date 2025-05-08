import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/new-aop-version.json";
import { AOPUtils } from '../fixtures/aop-utils';
import adjustmentData from "../testdata/adjustment.json";
import aopEdits from "../testdata/aop-edits.json";
import forecastData from "../testdata/forecast-api.json";
export interface NodeDimension { };

test.describe(
  "Compare the demand nodes data of the DS scenario before and after creating a new AOP scenario",
  { tag: "@Smoke @Regression @aop @perf" },
  () => {
  
    let responseBody, utilResponse, newUtilResponse, computePayload;
    let gmvPlusServicesForecast, gmvPlusServicesLessReturnsForecast, unitsgrossuomngForecast, unitsuomlessreturnsForecast, workedunitsForecast;
    let kpiResponse, kpiResponseBody;
    const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
    const createEndpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;
    const demandComputeEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.demand_compute_endpoint}`;

    test(`Verify if creation of a new AOP scenario does not impact existing DS scenario data`, async ({
      request,
    }) => {

    // fetch DS scenario details before creating new AOP scenario
    await test.step("Make a get Request for fetching DS details", async () => {
        Utility.logIt("Make a get Request for fetching DS details");

        // fetch both DS and AOP scenario details
        utilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(utilResponse);
        utilResponse = JSON.parse(await utilResponse.text());
    });

    // store DS scenario details
    const scenarioDSDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.ds_classification_id);

    const dsPayload = {
        scenario_id: scenarioDSDetails.scenario_id,
        scenario_version: scenarioDSDetails.scenario_version,
        };

    // fetch old values before creating new AOP scenario
    await test.step("Make a Post Request for getting the forecast data for DS before new AOP scenario is created", async () => {
      Utility.logIt("Make a Post Request for getting the forecast data for DS before new AOP scenario is created");

      let kpiPayload = aopEdits.getKpiForecast.payload;
      kpiPayload.scenario_id = dsPayload.scenario_id;
      kpiPayload.scenario_version = dsPayload.scenario_version;
      kpiResponse = await request.post(kpiEndpointURL, {data: kpiPayload});
      kpiResponseBody = await Utility.assertAndLog(kpiResponse);
    });

    // store new calculated values after successful AOP edits
    gmvPlusServicesForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[aopEdits.yearMonth].forecast;
    gmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns)[aopEdits.yearMonth].forecast;
    unitsgrossuomngForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input)[aopEdits.yearMonth].forecast;
    unitsuomlessreturnsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns)[aopEdits.yearMonth].forecast;
    workedunitsForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[aopEdits.yearMonth].forecast;

    console.log("GMV + Services before :", gmvPlusServicesForecast);
    console.log("GMV + Services less Returns before :", gmvPlusServicesLessReturnsForecast);
    console.log("Units Gross UOM NG before :", unitsgrossuomngForecast);
    console.log("Units UOM Less Returns before :", unitsuomlessreturnsForecast);
    console.log("Worked Units before :", workedunitsForecast);

    // create a new AOP scenario
    await test.step("Make a Post Request to create a new AOP scenario", async () => {
        Utility.logIt("Make a Post Request to create a new AOP scenario");

        // generating payload for creating a new AOP scenario
        let createAOPScenarioPayload = aopEdits.createAOPScenarioPayload;
        createAOPScenarioPayload.source.scenarios = [
            {
                scenario_id: scenarioDSDetails.scenario_id,
                version: scenarioDSDetails.scenario_version
            }
        ];

        responseBody = await request.post(createEndpointURL, {
          data: createAOPScenarioPayload,
        });
        if (!responseBody.ok()) {
          console.error(`API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`);
        }
        await Utility.assertAndLog(responseBody);
        responseBody = JSON.parse(await responseBody.text());
      });

    // compute the new AOP scenario
    await test.step("Make a Post Request to compute the new AOP scenario", async () => {
        Utility.logIt("Make a Post Request to compute the new AOP scenario");

        let newAOPResponse = await AOPUtils.getAOPVersion(request);
        newAOPResponse = JSON.parse(await newAOPResponse.text());
        let  newAOPDetails = newAOPResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

        const response = await request.post(demandComputeEndpointURL, {
            data: {scenario_id:newAOPDetails.scenario_id},
          });
    
          // asserting the response
          let responseBody = await Utility.assertAndLog(response);
          await expect.soft(responseBody).toEqual(aopEdits.demandComputeSuccessMessage);

      });

    //  fetch DS scenario details after creating a new AOP scenario
    await test.step("Make a get Request for fetching DS details", async () => {
        Utility.logIt("Make a get Request for fetching DS details");

        // fetch DS scenario details
        newUtilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(newUtilResponse);
        newUtilResponse = JSON.parse(await newUtilResponse.text());
    });

    //  store DS scenario details after creating a new AOP scenario
    const newScenarioDSDetails = newUtilResponse.find(scenario => scenario.classification_id === testdatafile.ds_classification_id);


    // Assertion
    await test.step("Fetching data for DS scenario after creating a new AOP scenairo", async () => {
        Utility.logIt("Fetching data for DS scenario after creating a new AOP scenairo");

        // check if data for demand nodes in DS scenario, after creating a new AOP scenario, is same as before for the old DS scenario
        let kpiPayload = aopEdits.getKpiForecast.payload;
        kpiPayload.scenario_id = scenarioDSDetails.scenario_id;
        kpiPayload.scenario_version = scenarioDSDetails.scenario_version;
        kpiResponse = await request.post(kpiEndpointURL, {data: kpiPayload});
        kpiResponseBody = await Utility.assertAndLog(kpiResponse);

        let gmvPlusServicesForecastPostCreation = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[aopEdits.yearMonth].forecast;
        let gmvPlusServicesLessReturnsForecastPostCreation = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns)[aopEdits.yearMonth].forecast;
        let unitsgrossuomngForecastPostCreation = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input)[aopEdits.yearMonth].forecast;
        let unitsuomlessreturnsForecastPostCreation = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns)[aopEdits.yearMonth].forecast;
        let workedunitsForecastPostCreation = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[aopEdits.yearMonth].forecast;
    
        console.log("GMV + Services after creation:", gmvPlusServicesForecastPostCreation);
        console.log("GMV + Services less Returns after creation:", gmvPlusServicesLessReturnsForecastPostCreation);
        console.log("Units Gross UOM NG after creation:", unitsgrossuomngForecastPostCreation);
        console.log("Units UOM Less Returns after creation:", unitsuomlessreturnsForecastPostCreation);
        console.log("Worked Units after creation:", workedunitsForecastPostCreation);

        expect(Math.round(gmvPlusServicesForecast)).toEqual(Math.round(gmvPlusServicesForecastPostCreation));
        expect(Math.round(gmvPlusServicesLessReturnsForecast)).toEqual(Math.round(gmvPlusServicesLessReturnsForecastPostCreation));
        expect(Math.round(unitsgrossuomngForecast)).toEqual(Math.round(unitsgrossuomngForecastPostCreation));
        expect(Math.round(unitsuomlessreturnsForecast)).toEqual(Math.round(unitsuomlessreturnsForecastPostCreation));
        expect(Math.round(workedunitsForecast)).toEqual(Math.round(workedunitsForecastPostCreation));
      });
  
    });
  }
);
