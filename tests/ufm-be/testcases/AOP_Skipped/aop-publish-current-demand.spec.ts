import { expect, test } from "../../../common/fixtures/test-hook";
import { Utility } from "../../../common/fixtures/utils";
import testdatafile from "../../testdata/new-aop-version.json";
import { AOPUtils } from '../../fixtures/aop-utils';
import { EditForecastUtility } from "../../fixtures/editForecast-utils";
import { testData } from "../../testdata/editForecast.json"
import commonData from "../../constants/common.json";
import { CdfUtility } from "../../../cdf-be/fixtures/cdf-utils";
import { AdjustmentUtility } from "../../fixtures/adjustment-utils";
import adjustmentData from "../../testdata/adjustment.json";
import aopEdits from "../../testdata/aop-edits.json"
export interface NodeDimension { };

test.describe(
  "Compare the aop publish data with current demand",
  { tag: "@Smoke @Regression @aop @aoppublish" },
  () => {
  
    let responseBody, utilResponse;
    let gmvPlusServicesForecast, gmvPlusServicesLessReturnsForecast, unitsgrossuomngForecast, unitsuomlessreturnsForecast, workedunitsForecast;
    let currentDemandResponse, currentDemandResponseBody, currentDemandAmountValue, kpiResponse, kpiResponseBody;
    const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;
    const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;

    test(`Verify if publishing AOP is not impacting slot 1 in current demand`, async ({
      request,
    }) => {
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

    //Assertion DS
    await test.step("Check if slot 1 is not impacted because of AOP publish", async () => {
      currentDemandResponse = await CdfUtility.currentDemand(request, 1);
      expect(currentDemandResponse).toBeOK();
      currentDemandResponseBody = await currentDemandResponse.json();

      currentDemandAmountValue = currentDemandResponseBody.forecastTotals.grandTotal.forecast
          .filter(nestedMap => nestedMap.month == aopEdits.month && nestedMap.year == aopEdits.year)
          .map(nestedMap => ({
            grossGmv: nestedMap.grossGmv,
            amount: nestedMap.amount,
            uomValue: nestedMap.uomValue,
            grossUomQuantity: nestedMap.grossUomQuantity,
            grossOpsUnits: nestedMap.grossOpsUnits,
          }))
          .shift();

          console.log("GMV + Services Current Demand Slot 1:", currentDemandAmountValue.grossGmv);
          console.log("GMV + Services less Returns Current Demand Slot 1:", currentDemandAmountValue.amount);
          console.log("Units Gross UOM NG Current Demand Slot 1:", currentDemandAmountValue.grossUomQuantity);
          console.log("Units UOM Less Returns Current Demand Slot 1:", currentDemandAmountValue.uomValue);
          console.log("Worked Units Current Demand Slot 1:", currentDemandAmountValue.grossOpsUnits);
      
          expect(Math.round(gmvPlusServicesForecast)).not.toEqual(Math.round(currentDemandAmountValue.grossGmv));
          expect(Math.round(gmvPlusServicesLessReturnsForecast)).not.toEqual(Math.round(currentDemandAmountValue.amount));
          expect(Math.round(unitsgrossuomngForecast)).not.toEqual(Math.round(currentDemandAmountValue.grossUomQuantity));
          expect(Math.round(unitsuomlessreturnsForecast)).not.toEqual(Math.round(currentDemandAmountValue.uomValue));
          expect(Math.round(workedunitsForecast)).not.toEqual(Math.round(currentDemandAmountValue.grossOpsUnits));
      });

    //Assertion AOP
    await test.step("Check if slot 3 data is impacted because of AOP publish", async () => {
      currentDemandResponse = await CdfUtility.currentDemand(request, 3);
      expect(currentDemandResponse).toBeOK();
      currentDemandResponseBody = await currentDemandResponse.json();

      currentDemandAmountValue = currentDemandResponseBody.forecastTotals.grandTotal.forecast
          .filter(nestedMap => nestedMap.month == aopEdits.month && nestedMap.year == aopEdits.year)
          .map(nestedMap => ({
            grossGmv: nestedMap.grossGmv,
            amount: nestedMap.amount,
            uomValue: nestedMap.uomValue,
            grossUomQuantity: nestedMap.grossUomQuantity,
            grossOpsUnits: nestedMap.grossOpsUnits,
          }))
          .shift();

          console.log("GMV + Services Current Demand Slot 3:", currentDemandAmountValue.grossGmv);
          console.log("GMV + Services less Returns Current Demand Slot 3:", currentDemandAmountValue.amount);
          console.log("Units Gross UOM NG Current Demand Slot 3:", currentDemandAmountValue.grossUomQuantity);
          console.log("Units UOM Less Returns Current Demand Slot 3:", currentDemandAmountValue.uomValue);
          console.log("Worked Units Current Demand Slot 3:", currentDemandAmountValue.grossOpsUnits);
      
          expect(Math.round(gmvPlusServicesForecast)).toEqual(Math.round(currentDemandAmountValue.grossGmv));
          expect(Math.round(gmvPlusServicesLessReturnsForecast)).toEqual(Math.round(currentDemandAmountValue.amount));
          expect(Math.round(unitsgrossuomngForecast)).toEqual(Math.round(currentDemandAmountValue.grossUomQuantity));
          expect(Math.round(unitsuomlessreturnsForecast)).toEqual(Math.round(currentDemandAmountValue.uomValue));
          expect(Math.round(workedunitsForecast)).toEqual(Math.round(currentDemandAmountValue.grossOpsUnits));
      });
    });
  }
);
