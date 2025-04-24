import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/new-aop-version.json";
import { AOPUtils } from '../fixtures/aop-utils';
import adjustmentData from "../testdata/adjustment.json";
import aopEdits from "../testdata/aop-edits.json";
import forecastData from "../testdata/forecast-api.json";
export interface NodeDimension { };

test.describe(
  "Execute and validate AOP publish steps",
  { tag: "@Smoke @Regression @aop @perf" },
  () => {
  
    let responseBody, utilResponse;
    let gmvPlusServices, gmvPlusServicesLessReturns, unitsgrossuomng, unitsuomlessreturns, workedunits;
    let ngrossgmvtotal, nservices, returnstotal, unitsgrossuomnginput, tempplugforuom, unitsops, unitsreturnedops, returnedunitsuomng;
    let gmvplusservicesCalculated, gmvplusserviceslessreturnsCalculated, unitsgrossuomngCalculated, unitsuomlessreturnsCalculated, workedunitsCalculated;


    let kpiResponse, kpiResponseBody;
    const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
    const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;

    test(`Verify if the given nodes in AOP scenario are calculated correctly as per the formula given in NE doc for the demand nodes provided`, async ({
      request,
    }) => {

    // fetch AOP scenario details 
    await test.step("Make a get Request for fetching AOP details", async () => {
        Utility.logIt("Make a get Request for fetching AOP details");

        // fetch both DS and AOP scenario details
        utilResponse = await AOPUtils.getAOPVersion(request);
        await Utility.assertAndLog(utilResponse);
        utilResponse = JSON.parse(await utilResponse.text());
    });

    // store AOP scenario details 
    const scenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);

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
    gmvPlusServices = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[aopEdits.yearMonth].forecast;
    gmvPlusServicesLessReturns = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns)[aopEdits.yearMonth].forecast;
    unitsgrossuomng = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng)[aopEdits.yearMonth].forecast;
    unitsuomlessreturns= kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns)[aopEdits.yearMonth].forecast;
    workedunits = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[aopEdits.yearMonth].forecast;

    console.log("GMV + Services after edits:", gmvPlusServices);
    console.log("GMV + Services less Returns after edits:", gmvPlusServicesLessReturns);
    console.log("Units Gross UOM NG after edits:", unitsgrossuomng);
    console.log("Units UOM Less Returns after edits:", unitsuomlessreturns);
    console.log("Worked Units after edits:", workedunits);

    // use formula to calculate manually
    await test.step("Manually calculate the nodes data based on formula provided in NE doc", async () => {
        Utility.logIt("Manually calculate the nodes data based on formula provided in NE doc");

        // fetch data of the nodes required for the calculation of the given nodes
        ngrossgmvtotal = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.ngrossgmvtotal)[aopEdits.yearMonth].forecast;
        nservices = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.nservices)[aopEdits.yearMonth].forecast;
        returnstotal = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.returnstotal)[aopEdits.yearMonth].forecast;
        unitsgrossuomnginput = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input)[aopEdits.yearMonth].forecast;
        tempplugforuom = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.tempplugforuom)[aopEdits.yearMonth].forecast;
        unitsops = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsops)[aopEdits.yearMonth].forecast;
        unitsreturnedops = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsreturnedops)[aopEdits.yearMonth].forecast;
        returnedunitsuomng = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.returnedunitsuomng)[aopEdits.yearMonth].forecast;
        
        gmvplusservicesCalculated = ngrossgmvtotal + nservices;
        gmvplusserviceslessreturnsCalculated = gmvPlusServices + returnstotal;
        unitsgrossuomngCalculated = unitsgrossuomnginput;
        unitsuomlessreturnsCalculated = unitsgrossuomng - returnedunitsuomng + tempplugforuom;
        workedunitsCalculated = unitsops + unitsreturnedops;

        console.log("gmvplusservices = ngrossgmvtotal + nservices : ", gmvplusservicesCalculated);
        console.log("gmvplusserviceslessreturns = gmvPlusServices + returnstotal : ", gmvplusserviceslessreturnsCalculated);
        console.log("unitsgrossuomng = unitsgrossuomng_input : ", unitsgrossuomngCalculated);
        console.log("unitsuomlessreturns = unitsgrossuomng - returnedunitsuomng + tempplugforuom : ", unitsuomlessreturnsCalculated);
        console.log("workedunits = unitsops + unitsreturnedops : ", workedunitsCalculated);
      });

    // Assertion 1
    await test.step("Check if manual calculation and AOP edit is returning the same values", async () => {
        Utility.logIt("Check if manual calculation and AOP edit is returning the same values");

        expect(Math.round(gmvplusservicesCalculated)).toEqual(Math.round(gmvPlusServices));
        expect(Math.round(gmvplusserviceslessreturnsCalculated)).toEqual(Math.round(gmvPlusServicesLessReturns));
        expect(Math.round(unitsgrossuomngCalculated)).toEqual(Math.round(unitsgrossuomng));
        expect(Math.round(unitsuomlessreturnsCalculated)).toEqual(Math.round(unitsuomlessreturns));
        expect(Math.round(workedunitsCalculated)).toEqual(Math.round(workedunits));
      });

    // Assertion 2
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
  
    });
  }
);
