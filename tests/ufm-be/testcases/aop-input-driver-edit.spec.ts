import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/new-aop-version.json";
import { AOPUtils } from '../fixtures/aop-utils';
import adjustmentData from "../testdata/adjustment.json";
import aopEdits from "../testdata/aop-edits.json";
export interface NodeDimension { };

test.describe(
  "Verify if user is able to select the input drivers and edit the data",
  { tag: "@Smoke @Regression @aop_input_driver_edit" },
  () => {
  
    let responseBody, utilResponse;
    let grossgmvForecast, moeCommmerchandiseSalesForecast;
    let kpiResponse, kpiResponseBody;
    const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getInputDriverKpiForecast.endpoint}`;

    test(`Verify if user is able to select the input drivers and edit the data`, async ({
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

    const scenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

    const aopPayload = {
        scenario_id: scenarioAOPDetails.scenario_id,
        scenario_version: scenarioAOPDetails.scenario_version,
    };

    // make AOP edits and save changes
    await test.step("Edit and save data in AOP scenario", async () => {
        Utility.logIt("Edit and save data in AOP scenario");

        let adjustment_payload = aopEdits.input_driver_allocation_payload;

        adjustment_payload.adjustment_metadata.scenario_id = aopPayload.scenario_id;
        adjustment_payload.adjustment_metadata.scenario_version_timestamp = aopPayload.scenario_version;
        adjustment_payload.allocation_request.scenario_id = aopPayload.scenario_id;

        const response = await request.patch(adjustmentEndpointURL, {
            data: adjustment_payload,
        });
        responseBody = await Utility.assertAndLog(response);
        Utility.logIt(`adjustment Response Body: ${JSON.stringify(responseBody)}`);
        expect(responseBody.message).toBe(aopEdits.adjustment_success);
    });

    // fetch new calculated values after successful AOP edits
    await test.step("Make a Post Request for getting the forecast data for AOP before new DS scenario is created", async () => {
        Utility.logIt("Make a Post Request for getting the forecast data for AOP before new DS scenario is created");

        let kpiPayload = aopEdits.getInputDriverKpiForecast.payload;
        kpiPayload.scenario_id = aopPayload.scenario_id;
        kpiPayload.scenario_version = aopPayload.scenario_version;
        kpiPayload.isApplied = false;

        Utility.logIt(`KPI payload before call: ${JSON.stringify(kpiPayload)}`);
        kpiResponse = await request.post(kpiEndpointURL, {data: kpiPayload});
        expect(kpiResponse.ok()).toBeTruthy();
        expect(kpiResponse.status()).toBe(200);
        kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        Utility.logIt(`KPI Response Body: ${JSON.stringify(kpiResponseBody)}`);
    });

    // fetch the expected edited values
    const expectedGrossgmvForecast = aopEdits.input_driver_allocation_payload.allocation_request.edits.find(
      (edit: { node_var_name: string }) => edit.node_var_name === aopEdits.grossgmv
    )?.data[aopEdits.inputYearMonth];

    const expectedMoeCommmerchandiseSalesForecast = aopEdits.input_driver_allocation_payload.allocation_request.edits.find(
      (edit: { node_var_name: string }) => edit.node_var_name === aopEdits.moecommmerchandisesales
    )?.data[aopEdits.inputYearMonth];  

    console.log("Grossgmv before edits:", expectedGrossgmvForecast);
    console.log("MoeCommmerchandiseSales before edits:", expectedMoeCommmerchandiseSalesForecast);

    // fetch the specific edited values
    grossgmvForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.grossgmv)[aopEdits.inputYearMonth].forecast;
    moeCommmerchandiseSalesForecast = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.moecommmerchandisesales)[aopEdits.inputYearMonth].forecast;

    console.log("Grossgmv after edits:", grossgmvForecast);
    console.log("MoeCommmerchandiseSales after edits:", moeCommmerchandiseSalesForecast);

    await test.step("Verify the updated forecast data from AOP after saving is expected", async () => {
            Utility.logIt("Verify the updated forecast data from AOP after saving is expected");
            expect(Math.round(grossgmvForecast)).toEqual(Math.round(expectedGrossgmvForecast));
            expect(Math.round(moeCommmerchandiseSalesForecast)).toEqual(Math.round(expectedMoeCommmerchandiseSalesForecast));
        });
    });
  }
);
