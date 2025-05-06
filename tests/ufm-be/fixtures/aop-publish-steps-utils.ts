import { APIRequestContext } from '@playwright/test';
import { expect } from "../../common/fixtures/test-hook";
import { Utility } from '../../common/fixtures/utils';
import adjustmentData from '../testdata/adjustment.json';
import aopEdits from '../testdata/aop-edits.json';
import testdatafile from '../testdata/new-aop-version.json';
import { AOPUtils } from '../fixtures/aop-utils';

export interface AOPPayload {
  scenario_id: string;
  scenario_version: string;
}

export async function executeAOPSteps(request: APIRequestContext, aopEditsPayload: any) {
  let responseBody, utilResponse;
  let gmvPlusServices, gmvPlusServicesLessReturns, unitsgrossuomng, unitsuomlessreturns, workedunits;
  let ngrossgmvtotal, nservices, returnstotal, unitsgrossuomnginput, tempplugforuom, unitsops, unitsreturnedops, returnedunitsuomng;
  let gmvplusservicesCalculated, gmvplusserviceslessreturnsCalculated, unitsgrossuomngCalculated, unitsuomlessreturnsCalculated, workedunitsCalculated;

  const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
  const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
  const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;

  // Fetch AOP scenario details
  Utility.logIt('Make a GET request for fetching AOP details');
  utilResponse = await AOPUtils.getAOPVersion(request);
  utilResponse = JSON.parse(await utilResponse.text());

  const scenarioAOPDetails = utilResponse.find(
    (scenario: any) => scenario.classification_id === testdatafile.classification_id
  );

  const aopPayload: AOPPayload = {
    scenario_id: scenarioAOPDetails.scenario_id,
    scenario_version: scenarioAOPDetails.scenario_version,
  };

  // Make AOP edits
  Utility.logIt('Edit and save data in AOP scenario');
  let adjustment_payload = aopEdits.allocation_payload;
  adjustment_payload.adjustment_metadata.scenario_id = parseInt(aopPayload.scenario_id, 10);
  adjustment_payload.adjustment_metadata.scenario_version_timestamp = parseInt(aopPayload.scenario_version, 10);
  adjustment_payload.allocation_request.scenario_id = parseInt(aopPayload.scenario_id, 10);
  adjustment_payload.allocation_request.edits = aopEditsPayload;

  const response = await request.patch(adjustmentEndpointURL, {
    data: adjustment_payload,
  });
  responseBody = await Utility.assertAndLog(response);
  if (responseBody.message !== aopEdits.adjustment_success) {
    throw new Error('AOP adjustment failed');
  }

  // Fetch new calculated values after successful AOP edits
  Utility.logIt('Make a POST request for getting the forecast data for AOP');
  let kpiPayload = aopEdits.getKpiForecast.payload;
  kpiPayload.scenario_id = parseInt(aopPayload.scenario_id, 10);
  kpiPayload.scenario_version = parseInt(aopPayload.scenario_version, 10);
  const kpiResponse = await request.post(kpiEndpointURL, { data: kpiPayload });
  const kpiResponseBody = await Utility.assertAndLog(kpiResponse);

  // Store new calculated values
  gmvPlusServices = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.gmvplusservices)[
    aopEdits.yearMonth
  ].forecast;
  gmvPlusServicesLessReturns = kpiResponseBody.rowData.find(
    (row: { driver: string }) => row.driver === aopEdits.gmvplusserviceslessreturns
  )[aopEdits.yearMonth].forecast;
  unitsgrossuomng = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng)[
    aopEdits.yearMonth
  ].forecast;
  unitsuomlessreturns = kpiResponseBody.rowData.find(
    (row: { driver: string }) => row.driver === aopEdits.unitsuomlessreturns
  )[aopEdits.yearMonth].forecast;
  workedunits = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.workedunits)[
    aopEdits.yearMonth
  ].forecast;

  // Perform manual calculations
  Utility.logIt('Manually calculate the nodes data based on formula provided in NE doc');
  ngrossgmvtotal = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.ngrossgmvtotal)[
    aopEdits.yearMonth
  ].forecast;
  nservices = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.nservices)[
    aopEdits.yearMonth
  ].forecast;
  returnstotal = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.returnstotal)[
    aopEdits.yearMonth
  ].forecast;
  unitsgrossuomnginput = kpiResponseBody.rowData.find(
    (row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng_input
  )[aopEdits.yearMonth].forecast;
  tempplugforuom = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.tempplugforuom)[
    aopEdits.yearMonth
  ].forecast;
  unitsops = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsops)[
    aopEdits.yearMonth
  ].forecast;
  unitsreturnedops = kpiResponseBody.rowData.find(
    (row: { driver: string }) => row.driver === aopEdits.unitsreturnedops
  )[aopEdits.yearMonth].forecast;
  returnedunitsuomng = kpiResponseBody.rowData.find(
    (row: { driver: string }) => row.driver === aopEdits.returnedunitsuomng
  )[aopEdits.yearMonth].forecast;

  gmvplusservicesCalculated = ngrossgmvtotal + nservices;
  gmvplusserviceslessreturnsCalculated = gmvPlusServices + returnstotal;
  unitsgrossuomngCalculated = unitsgrossuomnginput;
  unitsuomlessreturnsCalculated = unitsgrossuomng - returnedunitsuomng + tempplugforuom;
  workedunitsCalculated = unitsops + unitsreturnedops;

  // Assertions
  Utility.logIt('Check if manual calculation and AOP edit is returning the same values');
  expect(Math.round(gmvplusservicesCalculated)).toEqual(Math.round(gmvPlusServices));
  expect(Math.round(gmvplusserviceslessreturnsCalculated)).toEqual(Math.round(gmvPlusServicesLessReturns));
  expect(Math.round(unitsgrossuomngCalculated)).toEqual(Math.round(unitsgrossuomng));
  expect(Math.round(unitsuomlessreturnsCalculated)).toEqual(Math.round(unitsuomlessreturns));
  expect(Math.round(workedunitsCalculated)).toEqual(Math.round(workedunits));

  // Publish AOP
  Utility.logIt('Make a POST request for publishing AOP');
  responseBody = await request.post(endpointUploadURL, {
    data: aopPayload,
  });
  await Utility.assertAndLog(responseBody);
}