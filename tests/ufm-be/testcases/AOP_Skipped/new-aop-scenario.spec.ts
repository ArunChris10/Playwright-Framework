import { expect, test } from "../../../common/fixtures/test-hook";
import { Utility } from "../../../common/fixtures/utils";
import { AOPUtils } from '../../fixtures/aop-utils';
import testdatafileScenario from "../../testdata/forecast-api.json";
import adjustmentData from "../../testdata/adjustment.json";
import testdatafile from "../../testdata/new-aop-version.json";
import newAopVersion from "../../testdata/new-aop-version.json";
import aopEdits from "../../testdata/aop-edits.json";

test.describe(
    "Verify if user is able to create another AOP scenario when new datasets are available",
    { tag: "@Smoke @Regression @aop_new_scenario" },
    () => {
        let responseBody, utilResponse;
        let kpiResponse, kpiResponseBody;
        let gmvPlusServices, gmvPlusServicesLessReturns, unitsgrossuomng, unitsuomlessreturns, workedunits;
        let ngrossgmvtotal, nservices, returnstotal, unitsgrossuomnginput, tempplugforuom, unitsops, unitsreturnedops, returnedunitsuomng;
        let gmvplusservicesCalculated, gmvplusserviceslessreturnsCalculated, unitsgrossuomngCalculated, unitsuomlessreturnsCalculated, workedunitsCalculated;

        const scenarioURL = `${process.env.apiBaseURLUFM}${testdatafileScenario.endpoint}`;
        const endpointUploadURL = `${process.env.apiBaseURLUFM}${newAopVersion.upload_aop_endpoint}`;
        const demandComputeEndpoint = `${process.env.apiBaseURLUFM}${aopEdits.demand_compute_endpoint}`;

        test(`Verify AOP scenario creation with new datasets`, async ({ request }) => {
            try {
                await test.step("Make a get Request for fetching AOP details", async () => {
                    Utility.logIt("Make a get Request for fetching AOP details");
                    utilResponse = await AOPUtils.getAOPVersion(request);
                    await Utility.assertAndLog(utilResponse);
                    utilResponse = JSON.parse(await utilResponse.text());
                });
                const scenarioAOPDetails = utilResponse.find(scenario => scenario.classification_id === testdatafile.classification_id);
                const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
                const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;

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
                    tempplugforuom = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.tempplugforuom)?.[aopEdits.yearMonth]?.forecast??0;
                    unitsops = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsops)[aopEdits.yearMonth].forecast;
                    unitsreturnedops = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.unitsreturnedops)[aopEdits.yearMonth].forecast;
                    returnedunitsuomng = kpiResponseBody.rowData.find((row: { driver: string }) => row.driver === aopEdits.returnedunitsuomng)[aopEdits.yearMonth].forecast;
                    
                    gmvplusservicesCalculated = ngrossgmvtotal + nservices;
                    gmvplusserviceslessreturnsCalculated = gmvPlusServices + returnstotal;
                    unitsgrossuomngCalculated = unitsgrossuomnginput;
                    unitsuomlessreturnsCalculated = unitsgrossuomng - returnedunitsuomng + tempplugforuom;
                    workedunitsCalculated = unitsops + unitsreturnedops;
                });

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

                const scenarioPayload = { ...aopEdits.createDSScenarioPayload };

                scenarioPayload.source = {
                    ...(scenarioPayload.source as any), 
                    scenarios: [aopPayload],
                };
                await test.step("Make a POST request to create a new AOP scenario", async () => {
                    Utility.logIt("Making a POST request to create a new AOP scenario");
                    responseBody = await request.post(scenarioURL, {
                        data: scenarioPayload,
                    });

                    expect(responseBody.status()).toBe(200);
                    const successfulText = await responseBody.text();
                    Utility.logIt(`Successful response: ${successfulText}`);
                    expect(successfulText).toContain("Scenario created successfully");

                    await Utility.assertAndLog(responseBody);
                    responseBody = JSON.parse(await responseBody.text());
                });

                await test.step("Verify the response contains the created scenario details", async () => {
                    expect(responseBody).toHaveProperty("scenario");
                    expect(responseBody.scenario).toHaveProperty("scenario_id");
                    expect(responseBody.scenario).toHaveProperty("dim_id");
                });

                            await test.step("Compute AOP scenario forecast", async () => {
                Utility.logIt("Triggering demand computation for the new AOP scenario...");

                // Fetch the latest AOP version for scenario details
                const latestAopResponse = await AOPUtils.getAOPVersion(request);
                const latestAopDetails = JSON.parse(await latestAopResponse.text()).find(
                    (scenario) => scenario.classification_id === testdatafile.classification_id
                );

                const computeResponse = await request.post(demandComputeEndpoint, {
                    data: { scenario_id: latestAopDetails.scenario_id },
                });

                const computeResponseBody = await Utility.assertAndLog(computeResponse);

                // Ensure the computation was successful
                await expect
                    .soft(computeResponseBody)
                    .toEqual(aopEdits.demandComputeSuccessMessage);
            });
            } catch (error) {
                Utility.logIt(`Unexpected error occurred: ${error.message}`);
                throw error;
            }
        });
    }
);