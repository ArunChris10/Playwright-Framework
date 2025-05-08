import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testData from "../testdata/new-aop-version.json";
import testDataScenario from "../testdata/forecast-api.json";
import aopEdits from "../testdata/aop-edits.json";
import { AOPUtils } from "../fixtures/aop-utils";
import { DataScienceUtility } from "../fixtures/datascience-utils";

export interface NodeDimension {}

test.describe(
    "Verify AOP vs Data Science raw forecast match for actuals and forecast period",
    { tag: "@Smoke @Regression @aop_ds_data_match" },
    () => {
        test.describe.configure({ timeout: 600_000, mode: "parallel" });

        // Variables to hold forecast values and responses
        let forecastMonths;
        let aopForecastResponse;
        let aopScenarioPayload;
        let kpiResponse, dsKpiData, aopKpiData;
        let scenarioDetails: { scenario_id: number; scenario_version: number };

        const kpiEndpoint = `${process.env.apiBaseURLUFM}${aopEdits.getInputDriverKpiForecast.endpoint}`;
        const visualIndicatorEndpoint = `${process.env.apiBaseURLUFM}${aopEdits.getVisualIndicatorEndpoint}`;
        const createScenarioEndpoint = `${process.env.apiBaseURLUFM}${testDataScenario.endpoint}`;
        const demandComputeEndpoint = `${process.env.apiBaseURLUFM}${aopEdits.demand_compute_endpoint}`;
        let templateIncludeHeaders = aopEdits.kpiTemplateIncludeHeaderArr;

        test("Compare AOP and Data Science forecast values", async ({ request }) => {

            // Step 1: Fetch the current AOP version
            await test.step("Fetch current AOP version", async () => {
                Utility.logIt("Fetching current AOP version...");

                // Get AOP version details from API
                const response = await AOPUtils.getAOPVersion(request);
                await Utility.assertAndLog(response);
                const parsedResponse = JSON.parse(await response.text());

                // Find the matching scenario based on the classification ID
                const matchedScenario = parsedResponse.find(
                    (scenario) => scenario.classification_id === testData.classification_id
                );

                // Save AOP scenario details for later use
                aopScenarioPayload = {
                    scenario_id: matchedScenario.scenario_id,
                    scenario_version: matchedScenario.scenario_version,
                };
            });

            // Step 2: Fetch actual sync time from Visual Indicator API
            await test.step("Call Visual Indicator to get the actual_sync_time", async () => {
                Utility.logIt("Fetching actual sync time from Visual Indicator...");

                const visualIndicatorResponse = await request.get(visualIndicatorEndpoint, {
                    params: {
                        classification_id: testData.classification_id,
                    },
                });

                await Utility.assertAndLog(visualIndicatorResponse);
                const parsedResponse = JSON.parse(await visualIndicatorResponse.text());

                // Extract actual sync time for forecast period determination
                const actualSyncTime = parsedResponse.find(item => item.dataset_type === aopEdits.visualIndicatorActualsUpdated)?.actual_sync_time;

                // Calculate surrounding months based on sync time
                forecastMonths = AOPUtils.getSurroundingMonths(actualSyncTime);

                // Generate dynamic month columns for forecast display
                const monthColumns = forecastMonths.map(month => ({
                    name: month,
                    columnsMenuParams: "middleColumns",
                }));

                // Update template headers to include month columns
                const result = [
                    templateIncludeHeaders[0],
                    ...monthColumns,
                    ...templateIncludeHeaders.slice(1),
                ];
                templateIncludeHeaders = result;
            });

            // Step 3: Create a new AOP scenario based on the selected version
            await test.step("Create new AOP scenario", async () => {
                Utility.logIt("Creating a new AOP scenario...");

                const newScenarioPayload = {
                    ...aopEdits.createAOPScenarioPayload,
                    source: {
                        ...aopEdits.createAOPScenarioPayload.source,
                        scenarios: [
                            {
                                scenario_id: aopScenarioPayload.scenario_id,
                                version: aopScenarioPayload.scenario_version,
                            },
                        ],
                    },
                };

                const response = await request.post(createScenarioEndpoint, {
                    data: newScenarioPayload,
                });

                // Ensure the response is successful
                if (!response.ok()) {
                    console.error(`API request failed with status: ${response.status()} | URL: ${response.url()}`);
                }

                await Utility.assertAndLog(response);
                aopForecastResponse = JSON.parse(await response.text());
            });

            // Step 4: Trigger demand computation for the newly created AOP scenario
            await test.step("Compute AOP scenario forecast", async () => {
                Utility.logIt("Triggering demand computation for the new AOP scenario...");

                // Fetch the latest AOP version for scenario details
                const latestAopResponse = await AOPUtils.getAOPVersion(request);
                const latestAopDetails = JSON.parse(await latestAopResponse.text()).find(
                    (scenario) => scenario.classification_id === testData.classification_id
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

            // Step 5: Fetch KPI forecast data for the AOP scenario
            await test.step("Fetch KPI forecast for AOP scenario", async () => {
                Utility.logIt("Fetching KPI forecast for AOP scenario...");

                const aopKpiPayload = {
                    ...aopEdits.getInputDriverKpiForecast.payload,
                    scenario_id: aopScenarioPayload.scenario_id,
                    scenario_version: aopScenarioPayload.scenario_version,
                    additional_filters: {
                        ...aopEdits.getInputDriverKpiForecast.payload.additional_filters,
                        month: forecastMonths,
                        template_include_headers: templateIncludeHeaders,
                    },
                    isApplied: false,
                };

                kpiResponse = await request.post(kpiEndpoint, { data: aopKpiPayload });

                // Ensure the response is successful
                expect(kpiResponse.ok()).toBeTruthy();
                expect(kpiResponse.status()).toBe(200);

                aopKpiData = await Utility.assertAndLog(kpiResponse);
            });

            // Step 6: Fetch Data Science scenario metadata
            await test.step("Get Data Science scenario metadata", async () => {
                Utility.logIt("Fetching Data Science scenario metadata...");

                scenarioDetails = await DataScienceUtility.getDataScienceInfo(request);
                expect(scenarioDetails).toBeDefined();
            });

            // Step 7: Fetch KPI forecast data for the Data Science scenario
            await test.step("Fetch KPI forecast for Data Science scenario", async () => {
                Utility.logIt("Fetching KPI forecast for Data Science scenario...");

                const dsKpiPayload = {
                    ...aopEdits.getInputDriverKpiForecast.payload,
                    scenario_id: scenarioDetails.scenario_id,
                    scenario_version: scenarioDetails.scenario_version,
                    additional_filters: {
                        ...aopEdits.getInputDriverKpiForecast.payload.additional_filters,
                        month: forecastMonths,
                        template_include_headers: templateIncludeHeaders,
                    },
                    isApplied: false,
                };

                kpiResponse = await request.post(kpiEndpoint, { data: dsKpiPayload });

                // Ensure the response is successful
                expect(kpiResponse.ok()).toBeTruthy();
                expect(kpiResponse.status()).toBe(200);

                dsKpiData = await Utility.assertAndLog(kpiResponse);

                // Helper function to extract values for a given month
                const getForecastValue = (row: any, month: string) => {
                    const monthData = row?.[month];
                    if (!monthData) return null;
                    return monthData.month_alias === 'actuals' ? monthData.actuals : monthData.forecast;
                };

                // Helper function to check if a forecast value is valid
                const isValidForecast = (value: any) => value !== null && value !== undefined && value !== '' && value !== 0;

                // Retrieve specific rows for KPI data comparison
                const dsGrossGMVRow = dsKpiData.rowData.find(row => row.driver === aopEdits.grossgmv);
                const dsMoEcommSalesRow = dsKpiData.rowData.find(row => row.driver === aopEdits.moecommmerchandisesales);
                const aopGrossGMVRow = aopKpiData.rowData.find(row => row.driver === aopEdits.grossgmv);
                const aopMoEcommSalesRow = aopKpiData.rowData.find(row => row.driver === aopEdits.moecommmerchandisesales);

                // Compare forecast values for each month
                forecastMonths.forEach((month) => {
                    const dsGrossGMVForecast = getForecastValue(dsGrossGMVRow, month);
                    const dsMoEcommSalesForecast = getForecastValue(dsMoEcommSalesRow, month);
                    const aopGrossGMVForecast = getForecastValue(aopGrossGMVRow, month);
                    const aopMoEcommSalesForecast = getForecastValue(aopMoEcommSalesRow, month);

                    // Perform assertions only if values exist to avoid NaN comparison
                    if (isValidForecast(dsGrossGMVForecast) && isValidForecast(aopGrossGMVForecast)) {
                        expect(Math.round(Number(dsGrossGMVForecast))).toEqual(Math.round(Number(aopGrossGMVForecast)));
                    }

                    if (isValidForecast(dsMoEcommSalesForecast) && isValidForecast(aopMoEcommSalesForecast)) {
                        expect(Math.round(Number(dsMoEcommSalesForecast))).toEqual(Math.round(Number(aopMoEcommSalesForecast)));
                    }
                });
            });
        });
    }
);
