import { expect, test } from "../../../common/fixtures/test-hook";
import { Utility } from "../../../common/fixtures/utils";
import testData from "../../testdata/new-aop-version.json";
import testDataScenario from "../../testdata/forecast-api.json";
import aopEdits from "../../testdata/aop-edits.json";
import { AOPUtils } from "../../fixtures/aop-utils";
import { DataScienceUtility } from "../../fixtures/datascience-utils";
import { time } from "console";
import adjustmentData from "../../testdata/adjustment.json";
import testdatafile from "../../testdata/new-aop-version.json";
import forecastData from "../../testdata/forecast-api.json";

import testdatafileScenario from "../../testdata/forecast-api.json";

import { CdfUtility } from "../../../cdf-be/fixtures/cdf-utils";

test.describe(
  "AOP E2E Tests",
  { tag: "@Smoke @Regression @aop_e2e @aop @Visualization @AOP @Admin-Isolated-Scenarios @ibg-ufm-core-service @ibg-ufm-domino-service @ibg-ufm-allocation-engine ibg-service-scenario-financials" },
  () => {
    test.describe.configure({
      timeout: 1000_000,
      mode: "serial",
    });

    // Variables to hold forecast values and responses
    let forecastMonths;
    let aopForecastResponse;
    let aopScenarioPayload;
    let kpiResponse, dsKpiData, aopKpiData;
    let scenarioDetails: { scenario_id: number; scenario_version: number };

    const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
    const kpiEndpoint = `${process.env.apiBaseURLUFM}${aopEdits.getInputDriverKpiForecast.endpoint}`;
    const visualIndicatorEndpoint = `${process.env.apiBaseURLUFM}${aopEdits.getVisualIndicatorEndpoint}`;
    const createScenarioEndpoint = `${process.env.apiBaseURLUFM}${testDataScenario.endpoint}`;
    const demandComputeEndpoint = `${process.env.apiBaseURLUFM}${aopEdits.demand_compute_endpoint}`;
    const createEndpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;
    const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;

    let templateIncludeHeaders = aopEdits.kpiTemplateIncludeHeaderArr;

    test(
      "Compare AOP and Data Science forecast values after creating a new AOP scenario as DS baseline",
      { tag: "@aop_ds_data_match" },
      async ({ request }) => {
        // Step 1: Fetch the current AOP version
        await test.step("Fetch current AOP version", async () => {
          Utility.logIt("Fetching current AOP version...");

          // Get AOP version details from API
          const response = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(response);
          const parsedResponse = JSON.parse(await response.text());

          // Find the matching scenario based on the classification ID
          const matchedScenario = parsedResponse.find(
            (scenario) =>
              scenario.classification_id === testData.classification_id
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

          const visualIndicatorResponse = await request.get(
            visualIndicatorEndpoint,
            {
              params: {
                classification_id: testData.classification_id,
              },
            }
          );

          await Utility.assertAndLog(visualIndicatorResponse);
          const parsedResponse = JSON.parse(
            await visualIndicatorResponse.text()
          );

          // Extract actual sync time for forecast period determination
          const actualSyncTime = parsedResponse.find(
            (item) =>
              item.dataset_type === aopEdits.visualIndicatorActualsUpdated
          )?.actual_sync_time;

          // Calculate surrounding months based on sync time
          forecastMonths = AOPUtils.getSurroundingMonths(actualSyncTime);

          // Generate dynamic month columns for forecast display
          const monthColumns = forecastMonths.map((month) => ({
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
            console.error(
              `API request failed with status: ${response.status()} | URL: ${response.url()}`
            );
          }

          await Utility.assertAndLog(response);
          aopForecastResponse = JSON.parse(await response.text());
        });

        // Step 4: Trigger demand computation for the newly created AOP scenario
        await test.step("Compute AOP scenario forecast", async () => {
          Utility.logIt(
            "Triggering demand computation for the new AOP scenario..."
          );

          // Fetch the latest AOP version for scenario details
          const latestAopResponse = await AOPUtils.getAOPVersion(request);
          const latestAopDetails = JSON.parse(
            await latestAopResponse.text()
          ).find(
            (scenario) =>
              scenario.classification_id === testData.classification_id
          );

          const computeResponse = await request.post(demandComputeEndpoint, {
            data: { scenario_id: latestAopDetails.scenario_id },
            timeout: 240000,
          });

          const computeResponseBody = await Utility.assertAndLog(
            computeResponse
          );

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

          kpiResponse = await request.post(kpiEndpoint, {
            data: aopKpiPayload,
          });

          // Ensure the response is successful
          expect(kpiResponse.ok()).toBeTruthy();
          expect(kpiResponse.status()).toBe(200);

          aopKpiData = await Utility.assertAndLog(kpiResponse);
        });

        // Step 6: Fetch Data Science scenario metadata
        await test.step("Get Data Science scenario metadata", async () => {
          Utility.logIt("Fetching Data Science scenario metadata...");

          scenarioDetails = await DataScienceUtility.getDataScienceInfo(
            request
          );
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
            return monthData.month_alias === "actuals"
              ? monthData.actuals
              : monthData.forecast;
          };

          // Helper function to check if a forecast value is valid
          const isValidForecast = (value: any) =>
            value !== null &&
            value !== undefined &&
            value !== "" &&
            value !== 0;

          // Retrieve specific rows for KPI data comparison
          const dsGrossGMVRow = dsKpiData.rowData.find(
            (row) => row.driver === aopEdits.grossgmv
          );
          const dsMoEcommSalesRow = dsKpiData.rowData.find(
            (row) => row.driver === aopEdits.moecommmerchandisesales
          );
          const aopGrossGMVRow = aopKpiData.rowData.find(
            (row) => row.driver === aopEdits.grossgmv
          );
          const aopMoEcommSalesRow = aopKpiData.rowData.find(
            (row) => row.driver === aopEdits.moecommmerchandisesales
          );

          // Compare forecast values for each month
          forecastMonths.forEach((month) => {
            const dsGrossGMVForecast = getForecastValue(dsGrossGMVRow, month);
            const dsMoEcommSalesForecast = getForecastValue(
              dsMoEcommSalesRow,
              month
            );
            const aopGrossGMVForecast = getForecastValue(aopGrossGMVRow, month);
            const aopMoEcommSalesForecast = getForecastValue(
              aopMoEcommSalesRow,
              month
            );

            // Perform assertions only if values exist to avoid NaN comparison
            if (
              isValidForecast(dsGrossGMVForecast) &&
              isValidForecast(aopGrossGMVForecast)
            ) {
              expect(Math.round(Number(dsGrossGMVForecast))).toEqual(
                Math.round(Number(aopGrossGMVForecast))
              );
            }

            if (
              isValidForecast(dsMoEcommSalesForecast) &&
              isValidForecast(aopMoEcommSalesForecast)
            ) {
              expect(Math.round(Number(dsMoEcommSalesForecast))).toEqual(
                Math.round(Number(aopMoEcommSalesForecast))
              );
            }
          });
        });
      }
    );

    test(
      `Verify if creation of a new DS scenario does not impact existing AOP scenario data`,
      { tag: "@AOPDataNoChangeDSPublish" },
      async ({ request }) => {
        let responseBody, utilResponse, newUtilResponse;
        let gmvPlusServicesForecast,
          gmvPlusServicesLessReturnsForecast,
          unitsgrossuomngForecast,
          unitsuomlessreturnsForecast,
          workedunitsForecast;
        let kpiResponse, kpiResponseBody;
        // fetch DS and AOP scenario details before AOP edits
        await test.step("Make a get Request for fetching AOP details", async () => {
          Utility.logIt("Make a get Request for fetching AOP details");

          // fetch both DS and AOP scenario details
          utilResponse = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponse);
          utilResponse = JSON.parse(await utilResponse.text());
        });

        // store DS and AOP scenario details before AOP edits
        const scenarioDSDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.ds_classification_id
        );
        const scenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );

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

          adjustment_payload.adjustment_metadata.scenario_id =
            aopPayload.scenario_id;
          adjustment_payload.adjustment_metadata.scenario_version_timestamp =
            aopPayload.scenario_version;
          adjustment_payload.allocation_request.scenario_id =
            aopPayload.scenario_id;

          const response = await request.patch(adjustmentEndpointURL, {
            data: adjustment_payload,
          });
          responseBody = await Utility.assertAndLog(response);
          expect(responseBody.message).toBe(aopEdits.adjustment_success);
        });

        // fetch new calculated values after successful AOP edits
        await test.step("Make a Post Request for getting the forecast data for AOP before new DS scenario is created", async () => {
          Utility.logIt(
            "Make a Post Request for getting the forecast data for AOP before new DS scenario is created"
          );

          let kpiPayload = aopEdits.getKpiForecast.payload;
          kpiPayload.scenario_id = aopPayload.scenario_id;
          kpiPayload.scenario_version = aopPayload.scenario_version;
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        });

        // store new calculated values after successful AOP edits
        gmvPlusServicesForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.gmvplusservices
        )[aopEdits.yearMonth].forecast;
        gmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.gmvplusserviceslessreturns
        )[aopEdits.yearMonth].forecast;
        unitsgrossuomngForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsgrossuomng_input
        )[aopEdits.yearMonth].forecast;
        unitsuomlessreturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsuomlessreturns
        )[aopEdits.yearMonth].forecast;
        workedunitsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.workedunits
        )[aopEdits.yearMonth].forecast;

        console.log("GMV + Services before edits:", gmvPlusServicesForecast);
        console.log(
          "GMV + Services less Returns before edits:",
          gmvPlusServicesLessReturnsForecast
        );
        console.log(
          "Units Gross UOM NG before edits:",
          unitsgrossuomngForecast
        );
        console.log(
          "Units UOM Less Returns before edits:",
          unitsuomlessreturnsForecast
        );
        console.log("Worked Units before edits:", workedunitsForecast);

        // create a new DS scenario
        await test.step("Make a Post Request to create a new DS scenario", async () => {
          Utility.logIt("Make a Post Request to create a new DS scenario");
          responseBody = await request.post(createEndpointURL, {
            data: aopEdits.createDSScenarioPayload,
          });
          if (!responseBody.ok()) {
            console.error(
              `API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`
            );
          }
          await Utility.assertAndLog(responseBody);
          responseBody = JSON.parse(await responseBody.text());
        });

        // Step 4: Trigger demand computation for the newly created AOP scenario
        await test.step("Compute DS scenario forecast", async () => {
          Utility.logIt(
            "Triggering demand computation for the new DS scenario..."
          );

          // Fetch the latest AOP version for scenario details
          const latestDSResponse = await AOPUtils.getAOPVersion(request);
          const latestDSDetails = JSON.parse(
            await latestDSResponse.text()
          ).find(
            (scenario) =>
              scenario.classification_id === testdatafile.ds_classification_id
          );

          const computeResponse = await request.post(demandComputeEndpoint, {
            data: { scenario_id: latestDSDetails.scenario_id },
          });

          const computeResponseBody = await Utility.assertAndLog(
            computeResponse
          );

          // Ensure the computation was successful
          await expect
            .soft(computeResponseBody)
            .toEqual(aopEdits.demandComputeSuccessMessage);
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
        const newScenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );

        const newAopPayload = {
          scenario_id: newScenarioAOPDetails.scenario_id,
          scenario_version: newScenarioAOPDetails.scenario_version,
        };

        // Assertion
        await test.step("Make a Post Request for getting the forecast data for AOP after DS publish", async () => {
          Utility.logIt(
            "Make a Post Request for getting the forecast data for AOP after DS publish"
          );

          // check if scenario id and version has not changed for the latest AOP scenario
          expect(scenarioAOPDetails.scenario_id).toEqual(
            newScenarioAOPDetails.scenario_id
          );
          expect(scenarioAOPDetails.scenario_version).toEqual(
            newScenarioAOPDetails.scenario_version
          );

          // check if data for edited nodes in AOP scenario, after creating a new DS scenario, is same as before the new DS scenario was created
          let kpiPayload = aopEdits.getKpiForecast.payload;
          kpiPayload.scenario_id = newAopPayload.scenario_id;
          kpiPayload.scenario_version = newAopPayload.scenario_version;
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);

          let gmvPlusServicesForecastPostEdit = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.gmvplusservices
          )[aopEdits.yearMonth].forecast;
          let gmvPlusServicesLessReturnsForecastPostEdit =
            kpiResponseBody.rowData.find(
              (row: { driver: string }) =>
                row.driver === aopEdits.gmvplusserviceslessreturns
            )[aopEdits.yearMonth].forecast;
          let unitsgrossuomngForecastPostEdit = kpiResponseBody.rowData.find(
            (row: { driver: string }) =>
              row.driver === aopEdits.unitsgrossuomng_input
          )[aopEdits.yearMonth].forecast;
          let unitsuomlessreturnsForecastPostEdit =
            kpiResponseBody.rowData.find(
              (row: { driver: string }) =>
                row.driver === aopEdits.unitsuomlessreturns
            )[aopEdits.yearMonth].forecast;
          let workedunitsForecastPostEdit = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.workedunits
          )[aopEdits.yearMonth].forecast;

          console.log(
            "GMV + Services after edits:",
            gmvPlusServicesForecastPostEdit
          );
          console.log(
            "GMV + Services less Returns after edits:",
            gmvPlusServicesLessReturnsForecastPostEdit
          );
          console.log(
            "Units Gross UOM NG after edits:",
            unitsgrossuomngForecastPostEdit
          );
          console.log(
            "Units UOM Less Returns after edits:",
            unitsuomlessreturnsForecastPostEdit
          );
          console.log("Worked Units after edits:", workedunitsForecastPostEdit);

          expect(Math.round(gmvPlusServicesForecast)).toEqual(
            Math.round(gmvPlusServicesForecastPostEdit)
          );
          expect(Math.round(gmvPlusServicesLessReturnsForecast)).toEqual(
            Math.round(gmvPlusServicesLessReturnsForecastPostEdit)
          );
          expect(Math.round(unitsgrossuomngForecast)).toEqual(
            Math.round(unitsgrossuomngForecastPostEdit)
          );
          expect(Math.round(unitsuomlessreturnsForecast)).toEqual(
            Math.round(unitsuomlessreturnsForecastPostEdit)
          );
          expect(Math.round(workedunitsForecast)).toEqual(
            Math.round(workedunitsForecastPostEdit)
          );
        });
      }
    );

    test(
      `Verify if creation of a new AOP scenario and editing it does not impact existing DS scenario data`,
      { tag: "@DSDataNoChangeAfterAOPCreation" },
      async ({ request }) => {
        let responseBody, utilResponse, newUtilResponse, computePayload;
        let gmvPlusServicesForecast,
          gmvPlusServicesLessReturnsForecast,
          unitsgrossuomngForecast,
          unitsuomlessreturnsForecast,
          workedunitsForecast;
        let kpiResponse, kpiResponseBody;
        const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
        const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
        const createEndpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;
        const demandComputeEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.demand_compute_endpoint}`;

        // fetch DS scenario details before creating new AOP scenario
        await test.step("Make a get Request for fetching DS details", async () => {
          Utility.logIt("Make a get Request for fetching DS details");

          // fetch both DS and AOP scenario details
          utilResponse = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponse);
          utilResponse = JSON.parse(await utilResponse.text());
        });

        // store DS scenario details
        const scenarioDSDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.ds_classification_id
        );

        const dsPayload = {
          scenario_id: scenarioDSDetails.scenario_id,
          scenario_version: scenarioDSDetails.scenario_version,
        };
        let newAOPDetails;
        // fetch old values before creating new AOP scenario
        await test.step("Make a Post Request for getting the forecast data for DS before new AOP scenario is created", async () => {
          Utility.logIt(
            "Make a Post Request for getting the forecast data for DS before new AOP scenario is created"
          );

          let kpiPayload = aopEdits.getKpiForecast.payload;
          kpiPayload.scenario_id = dsPayload.scenario_id;
          kpiPayload.scenario_version = dsPayload.scenario_version;
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        });

        // store new calculated values after successful AOP edits
        gmvPlusServicesForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.gmvplusservices
        )[aopEdits.yearMonth].forecast;
        gmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.gmvplusserviceslessreturns
        )[aopEdits.yearMonth].forecast;
        unitsgrossuomngForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsgrossuomng_input
        )[aopEdits.yearMonth].forecast;
        unitsuomlessreturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsuomlessreturns
        )[aopEdits.yearMonth].forecast;
        workedunitsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.workedunits
        )[aopEdits.yearMonth].forecast;

        console.log("GMV + Services before :", gmvPlusServicesForecast);
        console.log(
          "GMV + Services less Returns before :",
          gmvPlusServicesLessReturnsForecast
        );
        console.log("Units Gross UOM NG before :", unitsgrossuomngForecast);
        console.log(
          "Units UOM Less Returns before :",
          unitsuomlessreturnsForecast
        );
        console.log("Worked Units before :", workedunitsForecast);

        // create a new AOP scenario
        await test.step("Make a Post Request to create a new AOP scenario", async () => {
          Utility.logIt("Make a Post Request to create a new AOP scenario");

          // generating payload for creating a new AOP scenario
          let createAOPScenarioPayload = aopEdits.createAOPScenarioPayload;
          createAOPScenarioPayload.source.scenarios = [
            {
              scenario_id: scenarioDSDetails.scenario_id,
              version: scenarioDSDetails.scenario_version,
            },
          ];

          responseBody = await request.post(createEndpointURL, {
            data: createAOPScenarioPayload,
          });
          if (!responseBody.ok()) {
            console.error(
              `API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`
            );
          }
          await Utility.assertAndLog(responseBody);
          responseBody = JSON.parse(await responseBody.text());
        });

        // compute the new AOP scenario
        await test.step("Make a Post Request to compute the new AOP scenario", async () => {
          Utility.logIt("Make a Post Request to compute the new AOP scenario");

          let newAOPResponse = await AOPUtils.getAOPVersion(request);
          newAOPResponse = JSON.parse(await newAOPResponse.text());
          newAOPDetails = newAOPResponse.find(
            (scenario) =>
              scenario.classification_id === testdatafile.classification_id
          );

          const response = await request.post(demandComputeEndpointURL, {
            data: { scenario_id: newAOPDetails.scenario_id },
          });

          // asserting the response
          let responseBody = await Utility.assertAndLog(response);
          await expect
            .soft(responseBody)
            .toEqual(aopEdits.demandComputeSuccessMessage);
        });

        // make AOP edits
        await test.step("Edit and save data in AOP scenario", async () => {
          Utility.logIt("Edit and save data in AOP scenario");

          let adjustment_payload = aopEdits.allocation_payload;

          adjustment_payload.adjustment_metadata.scenario_id =
            newAOPDetails.scenario_id;
          adjustment_payload.adjustment_metadata.scenario_version_timestamp =
            newAOPDetails.scenario_version;
          adjustment_payload.allocation_request.scenario_id =
            newAOPDetails.scenario_id;

          const response = await request.patch(adjustmentEndpointURL, {
            data: adjustment_payload,
          });
          responseBody = await Utility.assertAndLog(response);
          expect(responseBody.message).toBe(aopEdits.adjustment_success);
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
        const newScenarioDSDetails = newUtilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.ds_classification_id
        );

        // Assertion
        await test.step("Fetching data for DS scenario after creating a new AOP scenairo", async () => {
          Utility.logIt(
            "Fetching data for DS scenario after creating a new AOP scenairo"
          );

          // check if data for demand nodes in DS scenario, after creating a new AOP scenario, is same as before for the old DS scenario
          let kpiPayload = aopEdits.getKpiForecast.payload;
          kpiPayload.scenario_id = scenarioDSDetails.scenario_id;
          kpiPayload.scenario_version = scenarioDSDetails.scenario_version;
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);

          let gmvPlusServicesForecastPostCreation =
            kpiResponseBody.rowData.find(
              (row: { driver: string }) =>
                row.driver === aopEdits.gmvplusservices
            )[aopEdits.yearMonth].forecast;
          let gmvPlusServicesLessReturnsForecastPostCreation =
            kpiResponseBody.rowData.find(
              (row: { driver: string }) =>
                row.driver === aopEdits.gmvplusserviceslessreturns
            )[aopEdits.yearMonth].forecast;
          let unitsgrossuomngForecastPostCreation =
            kpiResponseBody.rowData.find(
              (row: { driver: string }) =>
                row.driver === aopEdits.unitsgrossuomng_input
            )[aopEdits.yearMonth].forecast;
          let unitsuomlessreturnsForecastPostCreation =
            kpiResponseBody.rowData.find(
              (row: { driver: string }) =>
                row.driver === aopEdits.unitsuomlessreturns
            )[aopEdits.yearMonth].forecast;
          let workedunitsForecastPostCreation = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.workedunits
          )[aopEdits.yearMonth].forecast;

          console.log(
            "GMV + Services after creation:",
            gmvPlusServicesForecastPostCreation
          );
          console.log(
            "GMV + Services less Returns after creation:",
            gmvPlusServicesLessReturnsForecastPostCreation
          );
          console.log(
            "Units Gross UOM NG after creation:",
            unitsgrossuomngForecastPostCreation
          );
          console.log(
            "Units UOM Less Returns after creation:",
            unitsuomlessreturnsForecastPostCreation
          );
          console.log(
            "Worked Units after creation:",
            workedunitsForecastPostCreation
          );

          expect(Math.round(gmvPlusServicesForecast)).toEqual(
            Math.round(gmvPlusServicesForecastPostCreation)
          );
          expect(Math.round(gmvPlusServicesLessReturnsForecast)).toEqual(
            Math.round(gmvPlusServicesLessReturnsForecastPostCreation)
          );
          expect(Math.round(unitsgrossuomngForecast)).toEqual(
            Math.round(unitsgrossuomngForecastPostCreation)
          );
          expect(Math.round(unitsuomlessreturnsForecast)).toEqual(
            Math.round(unitsuomlessreturnsForecastPostCreation)
          );
          expect(Math.round(workedunitsForecast)).toEqual(
            Math.round(workedunitsForecastPostCreation)
          );
        });
      }
    );
    test(
      `Verify if user is able to select the input drivers and edit the data`,
      { tag: "@aop_input_driver_edit" },
      async ({ request }) => {
        let responseBody, utilResponse;
        let grossgmvForecast, moeCommmerchandiseSalesForecast;
        let kpiResponse, kpiResponseBody;

        // fetch DS and AOP scenario details before AOP edits
        await test.step("Make a get Request for fetching AOP details", async () => {
          Utility.logIt("Make a get Request for fetching AOP details");

          // fetch both DS and AOP scenario details
          utilResponse = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponse);
          utilResponse = JSON.parse(await utilResponse.text());
        });

        const scenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );

        const aopPayload = {
          scenario_id: scenarioAOPDetails.scenario_id,
          scenario_version: scenarioAOPDetails.scenario_version,
        };

        // make AOP edits and save changes
        await test.step("Edit and save data in AOP scenario", async () => {
          Utility.logIt("Edit and save data in AOP scenario");

          let adjustment_payload = aopEdits.input_driver_allocation_payload;

          adjustment_payload.adjustment_metadata.scenario_id =
            aopPayload.scenario_id;
          adjustment_payload.adjustment_metadata.scenario_version_timestamp =
            aopPayload.scenario_version;
          adjustment_payload.allocation_request.scenario_id =
            aopPayload.scenario_id;

          const response = await request.patch(adjustmentEndpointURL, {
            data: adjustment_payload,
          });
          responseBody = await Utility.assertAndLog(response);
          Utility.logIt(
            `adjustment Response Body: ${JSON.stringify(responseBody)}`
          );
          expect(responseBody.message).toBe(aopEdits.adjustment_success);
        });

        // fetch new calculated values after successful AOP edits
        await test.step("fetch new calculated values after successful AOP edits", async () => {
          Utility.logIt(
            "fetch new calculated values after successful AOP edits"
          );

          let kpiPayload = aopEdits.getInputDriverKpiForecast.payload;
          kpiPayload.scenario_id = aopPayload.scenario_id;
          kpiPayload.scenario_version = aopPayload.scenario_version;
          kpiPayload.isApplied = false;

          Utility.logIt(
            `KPI payload before call: ${JSON.stringify(kpiPayload)}`
          );
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          expect(kpiResponse.ok()).toBeTruthy();
          expect(kpiResponse.status()).toBe(200);
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);
          Utility.logIt(
            `KPI Response Body: ${JSON.stringify(kpiResponseBody)}`
          );
        });

        // fetch the expected edited values
        const expectedGrossgmvForecast =
          aopEdits.input_driver_allocation_payload.allocation_request.edits.find(
            (edit: { node_var_name: string }) =>
              edit.node_var_name === aopEdits.grossgmv
          )?.data[aopEdits.inputYearMonth];

        const expectedMoeCommmerchandiseSalesForecast =
          aopEdits.input_driver_allocation_payload.allocation_request.edits.find(
            (edit: { node_var_name: string }) =>
              edit.node_var_name === aopEdits.moecommmerchandisesales
          )?.data[aopEdits.inputYearMonth];

        console.log("Grossgmv before edits:", expectedGrossgmvForecast);
        console.log(
          "MoeCommmerchandiseSales before edits:",
          expectedMoeCommmerchandiseSalesForecast
        );

        // fetch the specific edited values
        grossgmvForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.grossgmv
        )[aopEdits.inputYearMonth].forecast;
        moeCommmerchandiseSalesForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.moecommmerchandisesales
        )[aopEdits.inputYearMonth].forecast;

        console.log("Grossgmv after edits:", grossgmvForecast);
        console.log(
          "MoeCommmerchandiseSales after edits:",
          moeCommmerchandiseSalesForecast
        );

        await test.step("Verify the updated forecast data from AOP after saving is expected", async () => {
          Utility.logIt(
            "Verify the updated forecast data from AOP after saving is expected"
          );
          expect(Math.round(grossgmvForecast)).toEqual(
            Math.round(expectedGrossgmvForecast)
          );
          expect(Math.round(moeCommmerchandiseSalesForecast)).toEqual(
            Math.round(expectedMoeCommmerchandiseSalesForecast)
          );
        });
      }
    );

    test(
      `Verify if publishing AOP is not impacting slot 1 in current demand`,
      { tag: "@@aoppublish" },
      async ({ request }) => {
        let responseBody, utilResponse;
        let gmvPlusServicesForecast,
          gmvPlusServicesLessReturnsForecast,
          unitsgrossuomngForecast,
          unitsuomlessreturnsForecast,
          workedunitsForecast;
        let currentDemandResponse,
          currentDemandResponseBody,
          currentDemandAmountValue,
          kpiResponse,
          kpiResponseBody;

        await test.step("Make a get Request for fetching AOP details", async () => {
          Utility.logIt("Make a get Request for fetching AOP details");
          utilResponse = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponse);
          utilResponse = JSON.parse(await utilResponse.text());
        });
        const scenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );

        const aopPayload = {
          scenario_id: scenarioAOPDetails.scenario_id,
          scenario_version: scenarioAOPDetails.scenario_version,
        };

        await test.step("Edit and save a cell in AOP scenario", async () => {
          Utility.logIt("Edit and save a cell in AOP scenario");

          let adjustment_payload = aopEdits.allocation_payload;

          adjustment_payload.adjustment_metadata.scenario_id =
            aopPayload.scenario_id;
          adjustment_payload.adjustment_metadata.scenario_version_timestamp =
            aopPayload.scenario_version;
          adjustment_payload.allocation_request.scenario_id =
            aopPayload.scenario_id;

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
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        });

        gmvPlusServicesForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.gmvplusservices
        )[aopEdits.yearMonth].forecast;
        gmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.gmvplusserviceslessreturns
        )[aopEdits.yearMonth].forecast;
        unitsgrossuomngForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsgrossuomng_input
        )[aopEdits.yearMonth].forecast;
        unitsuomlessreturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsuomlessreturns
        )[aopEdits.yearMonth].forecast;
        workedunitsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.workedunits
        )[aopEdits.yearMonth].forecast;

        console.log("GMV + Services Updated:", gmvPlusServicesForecast);
        console.log(
          "GMV + Services less Returns Updated:",
          gmvPlusServicesLessReturnsForecast
        );
        console.log("Units Gross UOM NG Updated:", unitsgrossuomngForecast);
        console.log(
          "Units UOM Less Returns Updated:",
          unitsuomlessreturnsForecast
        );
        console.log("Worked Units Updated:", workedunitsForecast);

        await test.step("Make a Post Request for publishing AOP", async () => {
          Utility.logIt("Make a Post Request for publishing AOP");
          responseBody = await request.post(endpointUploadURL, {
            data: aopPayload,
          });
          if (!responseBody.ok()) {
            console.error(
              `API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`
            );
          }
          await Utility.assertAndLog(responseBody);
          responseBody = JSON.parse(await responseBody.text());
        });

        //Assertion DS
        await test.step("Check if slot 1 is not impacted because of AOP publish", async () => {
          currentDemandResponse = await CdfUtility.currentDemand(request, 1);
          expect(currentDemandResponse).toBeOK();
          currentDemandResponseBody = await currentDemandResponse.json();

          currentDemandAmountValue =
            currentDemandResponseBody.forecastTotals.grandTotal.forecast
              .filter(
                (nestedMap) =>
                  nestedMap.month == aopEdits.month &&
                  nestedMap.year == aopEdits.year
              )
              .map((nestedMap) => ({
                grossGmv: nestedMap.grossGmv,
                amount: nestedMap.amount,
                uomValue: nestedMap.uomValue,
                grossUomQuantity: nestedMap.grossUomQuantity,
                grossOpsUnits: nestedMap.grossOpsUnits,
              }))
              .shift();

          console.log(
            "GMV + Services Current Demand Slot 1:",
            currentDemandAmountValue.grossGmv
          );
          console.log(
            "GMV + Services less Returns Current Demand Slot 1:",
            currentDemandAmountValue.amount
          );
          console.log(
            "Units Gross UOM NG Current Demand Slot 1:",
            currentDemandAmountValue.grossUomQuantity
          );
          console.log(
            "Units UOM Less Returns Current Demand Slot 1:",
            currentDemandAmountValue.uomValue
          );
          console.log(
            "Worked Units Current Demand Slot 1:",
            currentDemandAmountValue.grossOpsUnits
          );

          expect(Math.round(gmvPlusServicesForecast)).not.toEqual(
            Math.round(currentDemandAmountValue.grossGmv)
          );
          expect(Math.round(gmvPlusServicesLessReturnsForecast)).not.toEqual(
            Math.round(currentDemandAmountValue.amount)
          );
          expect(Math.round(unitsgrossuomngForecast)).not.toEqual(
            Math.round(currentDemandAmountValue.grossUomQuantity)
          );
          expect(Math.round(unitsuomlessreturnsForecast)).not.toEqual(
            Math.round(currentDemandAmountValue.uomValue)
          );
          expect(Math.round(workedunitsForecast)).not.toEqual(
            Math.round(currentDemandAmountValue.grossOpsUnits)
          );
        });

        //Assertion AOP
        await test.step("Check if slot 3 data is impacted because of AOP publish", async () => {
          currentDemandResponse = await CdfUtility.currentDemand(request, 3);
          expect(currentDemandResponse).toBeOK();
          currentDemandResponseBody = await currentDemandResponse.json();

          currentDemandAmountValue =
            currentDemandResponseBody.forecastTotals.grandTotal.forecast
              .filter(
                (nestedMap) =>
                  nestedMap.month == aopEdits.month &&
                  nestedMap.year == aopEdits.year
              )
              .map((nestedMap) => ({
                grossGmv: nestedMap.grossGmv,
                amount: nestedMap.amount,
                uomValue: nestedMap.uomValue,
                grossUomQuantity: nestedMap.grossUomQuantity,
                grossOpsUnits: nestedMap.grossOpsUnits,
              }))
              .shift();

          console.log(
            "GMV + Services Current Demand Slot 3:",
            currentDemandAmountValue.grossGmv
          );
          console.log(
            "GMV + Services less Returns Current Demand Slot 3:",
            currentDemandAmountValue.amount
          );
          console.log(
            "Units Gross UOM NG Current Demand Slot 3:",
            currentDemandAmountValue.grossUomQuantity
          );
          console.log(
            "Units UOM Less Returns Current Demand Slot 3:",
            currentDemandAmountValue.uomValue
          );
          console.log(
            "Worked Units Current Demand Slot 3:",
            currentDemandAmountValue.grossOpsUnits
          );

          expect(Math.round(gmvPlusServicesForecast)).toEqual(
            Math.round(currentDemandAmountValue.grossGmv)
          );
          expect(Math.round(gmvPlusServicesLessReturnsForecast)).toEqual(
            Math.round(currentDemandAmountValue.amount)
          );
          expect(Math.round(unitsgrossuomngForecast)).toEqual(
            Math.round(currentDemandAmountValue.grossUomQuantity)
          );
          expect(Math.round(unitsuomlessreturnsForecast)).toEqual(
            Math.round(currentDemandAmountValue.uomValue)
          );
          expect(Math.round(workedunitsForecast)).toEqual(
            Math.round(currentDemandAmountValue.grossOpsUnits)
          );
        });
      }
    );

    test(
      "check if forecast period retains edits after publish",
      { tag: "@AopPublishEditsRetention" },
      async ({ request }) => {
        let responseBody, utilResponse, newUtilResponse;
        const endpointUploadURL = `${process.env.apiBaseURLUFM}${testdatafile.upload_aop_endpoint}`;
        const adjustmentEndpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
        const kpiEndpointURL = `${process.env.apiBaseURLUFM}${aopEdits.getKpiForecast.endpoint}`;
        let gmvPlusServicesForecast,
          gmvPlusServicesLessReturnsForecast,
          unitsgrossuomngForecast,
          unitsuomlessreturnsForecast,
          workedunitsForecast;
        let newGmvPlusServicesForecast,
          newGmvPlusServicesLessReturnsForecast,
          newUnitsgrossuomngForecast,
          newUnitsuomlessreturnsForecast,
          newWorkedunitsForecast;

        let kpiResponse, kpiResponseBody;

        await test.step("Make a get Request for fetching AOP details", async () => {
          Utility.logIt("Make a get Request for fetching AOP details");
          utilResponse = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponse);
          utilResponse = JSON.parse(await utilResponse.text());
        });
        const scenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );

        const aopPayload = {
          scenario_id: scenarioAOPDetails.scenario_id,
          scenario_version: scenarioAOPDetails.scenario_version,
        };

        await test.step("Edit and save a cell in AOP scenario", async () => {
          Utility.logIt("Edit and save a cell in AOP scenario");

          let adjustment_payload = aopEdits.allocation_payload;

          adjustment_payload.adjustment_metadata.scenario_id =
            aopPayload.scenario_id;
          adjustment_payload.adjustment_metadata.scenario_version_timestamp =
            aopPayload.scenario_version;
          adjustment_payload.allocation_request.scenario_id =
            aopPayload.scenario_id;

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
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        });

        gmvPlusServicesForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.gmvplusservices
        )[aopEdits.yearMonth].forecast;
        gmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.gmvplusserviceslessreturns
        )[aopEdits.yearMonth].forecast;
        unitsgrossuomngForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsgrossuomng_input
        )[aopEdits.yearMonth].forecast;
        unitsuomlessreturnsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsuomlessreturns
        )[aopEdits.yearMonth].forecast;
        workedunitsForecast = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.workedunits
        )[aopEdits.yearMonth].forecast;

        console.log("GMV + Services Updated:", gmvPlusServicesForecast);
        console.log(
          "GMV + Services less Returns Updated:",
          gmvPlusServicesLessReturnsForecast
        );
        console.log("Units Gross UOM NG Updated:", unitsgrossuomngForecast);
        console.log(
          "Units UOM Less Returns Updated:",
          unitsuomlessreturnsForecast
        );
        console.log("Worked Units Updated:", workedunitsForecast);

        await test.step("Make a Post Request for publishing AOP", async () => {
          Utility.logIt("Make a Post Request for publishing AOP");
          responseBody = await request.post(endpointUploadURL, {
            data: aopPayload,
          });
          if (!responseBody.ok()) {
            console.error(
              `API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`
            );
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
        const newScenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );

        const newAopPayload = {
          scenario_id: newScenarioAOPDetails.scenario_id,
          scenario_version: newScenarioAOPDetails.scenario_version,
        };

        // assertion
        await test.step("Make a Post Request for getting the forecast data again", async () => {
          Utility.logIt(
            "Make a Post Request for getting the forecast data again"
          );

          let kpiPayload = aopEdits.getKpiForecast.payload;
          kpiPayload.scenario_id = newAopPayload.scenario_id;
          kpiPayload.scenario_version = newAopPayload.scenario_version;
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);

          newGmvPlusServicesForecast = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.gmvplusservices
          )[aopEdits.yearMonth].forecast;
          newGmvPlusServicesLessReturnsForecast = kpiResponseBody.rowData.find(
            (row: { driver: string }) =>
              row.driver === aopEdits.gmvplusserviceslessreturns
          )[aopEdits.yearMonth].forecast;
          newUnitsgrossuomngForecast = kpiResponseBody.rowData.find(
            (row: { driver: string }) =>
              row.driver === aopEdits.unitsgrossuomng_input
          )[aopEdits.yearMonth].forecast;
          newUnitsuomlessreturnsForecast = kpiResponseBody.rowData.find(
            (row: { driver: string }) =>
              row.driver === aopEdits.unitsuomlessreturns
          )[aopEdits.yearMonth].forecast;
          newWorkedunitsForecast = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.workedunits
          )[aopEdits.yearMonth].forecast;

          console.log("GMV + Services Updated:", newGmvPlusServicesForecast);
          console.log(
            "GMV + Services less Returns Updated:",
            newGmvPlusServicesLessReturnsForecast
          );
          console.log(
            "Units Gross UOM NG Updated:",
            newUnitsgrossuomngForecast
          );
          console.log(
            "Units UOM Less Returns Updated:",
            newUnitsuomlessreturnsForecast
          );
          console.log("Worked Units Updated:", newWorkedunitsForecast);
        });

        expect(Math.round(newGmvPlusServicesForecast)).toEqual(
          Math.round(gmvPlusServicesForecast)
        );
        expect(Math.round(newGmvPlusServicesLessReturnsForecast)).toEqual(
          Math.round(gmvPlusServicesLessReturnsForecast)
        );
        expect(Math.round(newUnitsgrossuomngForecast)).toEqual(
          Math.round(unitsgrossuomngForecast)
        );
        expect(Math.round(newUnitsuomlessreturnsForecast)).toEqual(
          Math.round(unitsuomlessreturnsForecast)
        );
        expect(Math.round(newWorkedunitsForecast)).toEqual(
          Math.round(workedunitsForecast)
        );
      }
    );

    test(
      `Verify if publishing AOP is returning a new version`,
      { tag: "@aopNewVersion" },
      async ({ request }) => {
        let responseBody;
        let utilResponse;
        let utilResponseToBeVerified;

        //get request for data-science-info api
        utilResponse = await AOPUtils.getAOPVersion(request);

        await test.step("Make a get Request for fetching AOP details", async () => {
          Utility.logIt("Make a get Request for fetching AOP details");
          utilResponse = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponse);
          utilResponse = JSON.parse(await utilResponse.text());
        });

        const scenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );

        const payload = {
          scenario_id: scenarioAOPDetails.scenario_id,
          scenario_version: scenarioAOPDetails.scenario_version,
        };

        // post request for publishing AOP
        await test.step("Make a Post Request for publishing AOP", async () => {
          Utility.logIt("Make a Post Request for publishing AOP");
          responseBody = await request.post(endpointUploadURL, {
            data: payload,
          });
          if (!responseBody.ok()) {
            console.error(
              `API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`
            );
          }
          await Utility.assertAndLog(responseBody);
          responseBody = JSON.parse(await responseBody.text());
        });

        //Assertion
        await test.step("Check if the response is successful", async () => {
          utilResponseToBeVerified = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponseToBeVerified);
          utilResponseToBeVerified = JSON.parse(
            await utilResponseToBeVerified.text()
          );

          const responseToBeVerified = utilResponseToBeVerified.find(
            (item) => item.classification_id === testdatafile.classification_id
          );

          expect(responseToBeVerified.scenario_id).toEqual(
            scenarioAOPDetails.scenario_id
          );

          expect(responseToBeVerified.scenario_version).not.toEqual(
            scenarioAOPDetails.scenario_version
          );
        });
      }
    );

    test(`Verify AOP scenario creation with new datasets`, async ({
      request,
    }) => {
      let responseBody, utilResponse;
      let kpiResponse, kpiResponseBody;
      let gmvPlusServices,
        gmvPlusServicesLessReturns,
        unitsgrossuomng,
        unitsuomlessreturns,
        workedunits;
      let ngrossgmvtotal,
        nservices,
        returnstotal,
        unitsgrossuomnginput,
        tempplugforuom,
        unitsops,
        unitsreturnedops,
        returnedunitsuomng;
      let gmvplusservicesCalculated,
        gmvplusserviceslessreturnsCalculated,
        unitsgrossuomngCalculated,
        unitsuomlessreturnsCalculated,
        workedunitsCalculated;
      const scenarioURL = `${process.env.apiBaseURLUFM}${testdatafileScenario.endpoint}`;

      try {
        await test.step("Make a get Request for fetching AOP details", async () => {
          Utility.logIt("Make a get Request for fetching AOP details");
          utilResponse = await AOPUtils.getAOPVersion(request);
          await Utility.assertAndLog(utilResponse);
          utilResponse = JSON.parse(await utilResponse.text());
        });
        const scenarioAOPDetails = utilResponse.find(
          (scenario) =>
            scenario.classification_id === testdatafile.classification_id
        );
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

          adjustment_payload.adjustment_metadata.scenario_id =
            aopPayload.scenario_id;
          adjustment_payload.adjustment_metadata.scenario_version_timestamp =
            aopPayload.scenario_version;
          adjustment_payload.allocation_request.scenario_id =
            aopPayload.scenario_id;

          const response = await request.patch(adjustmentEndpointURL, {
            data: adjustment_payload,
          });
          responseBody = await Utility.assertAndLog(response);
          expect(responseBody.message).toBe(aopEdits.adjustment_success);
        });

        // fetch new calculated values after successful AOP edits
        await test.step("Make a Post Request for getting the forecast data for AOP before new DS scenario is created", async () => {
          Utility.logIt(
            "Make a Post Request for getting the forecast data for AOP before new DS scenario is created"
          );

          let kpiPayload = aopEdits.getKpiForecast.payload;
          kpiPayload.scenario_id = aopPayload.scenario_id;
          kpiPayload.scenario_version = aopPayload.scenario_version;
          kpiResponse = await request.post(kpiEndpointURL, {
            data: kpiPayload,
          });
          kpiResponseBody = await Utility.assertAndLog(kpiResponse);
        });

        // store new calculated values after successful AOP edits
        gmvPlusServices = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.gmvplusservices
        )[aopEdits.yearMonth].forecast;
        gmvPlusServicesLessReturns = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.gmvplusserviceslessreturns
        )[aopEdits.yearMonth].forecast;
        unitsgrossuomng = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.unitsgrossuomng
        )[aopEdits.yearMonth].forecast;
        unitsuomlessreturns = kpiResponseBody.rowData.find(
          (row: { driver: string }) =>
            row.driver === aopEdits.unitsuomlessreturns
        )[aopEdits.yearMonth].forecast;
        workedunits = kpiResponseBody.rowData.find(
          (row: { driver: string }) => row.driver === aopEdits.workedunits
        )[aopEdits.yearMonth].forecast;

        console.log("GMV + Services after edits:", gmvPlusServices);
        console.log(
          "GMV + Services less Returns after edits:",
          gmvPlusServicesLessReturns
        );
        console.log("Units Gross UOM NG after edits:", unitsgrossuomng);
        console.log("Units UOM Less Returns after edits:", unitsuomlessreturns);
        console.log("Worked Units after edits:", workedunits);

        // use formula to calculate manually
        await test.step("Manually calculate the nodes data based on formula provided in NE doc", async () => {
          Utility.logIt(
            "Manually calculate the nodes data based on formula provided in NE doc"
          );

          // fetch data of the nodes required for the calculation of the given nodes
          ngrossgmvtotal = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.ngrossgmvtotal
          )[aopEdits.yearMonth].forecast;
          nservices = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.nservices
          )[aopEdits.yearMonth].forecast;
          returnstotal = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.returnstotal
          )[aopEdits.yearMonth].forecast;
          unitsgrossuomnginput = kpiResponseBody.rowData.find(
            (row: { driver: string }) =>
              row.driver === aopEdits.unitsgrossuomng_input
          )[aopEdits.yearMonth].forecast;
          tempplugforuom =
            kpiResponseBody.rowData.find(
              (row: { driver: string }) =>
                row.driver === aopEdits.tempplugforuom
            )?.[aopEdits.yearMonth]?.forecast ?? 0;
          unitsops = kpiResponseBody.rowData.find(
            (row: { driver: string }) => row.driver === aopEdits.unitsops
          )[aopEdits.yearMonth].forecast;
          unitsreturnedops = kpiResponseBody.rowData.find(
            (row: { driver: string }) =>
              row.driver === aopEdits.unitsreturnedops
          )[aopEdits.yearMonth].forecast;
          returnedunitsuomng = kpiResponseBody.rowData.find(
            (row: { driver: string }) =>
              row.driver === aopEdits.returnedunitsuomng
          )[aopEdits.yearMonth].forecast;

          gmvplusservicesCalculated = ngrossgmvtotal + nservices;
          gmvplusserviceslessreturnsCalculated = gmvPlusServices + returnstotal;
          unitsgrossuomngCalculated = unitsgrossuomnginput;
          unitsuomlessreturnsCalculated =
            unitsgrossuomng - returnedunitsuomng + tempplugforuom;
          workedunitsCalculated = unitsops + unitsreturnedops;
        });

        await test.step("Make a Post Request for publishing AOP", async () => {
          Utility.logIt("Make a Post Request for publishing AOP");
          responseBody = await request.post(endpointUploadURL, {
            data: aopPayload,
          });
          if (!responseBody.ok()) {
            console.error(
              `API request failed with status code: ${responseBody.status()} for URL ${responseBody.url()}`
            );
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
          Utility.logIt(
            "Triggering demand computation for the new AOP scenario..."
          );

          // Fetch the latest AOP version for scenario details
          const latestAopResponse = await AOPUtils.getAOPVersion(request);
          const latestAopDetails = JSON.parse(
            await latestAopResponse.text()
          ).find(
            (scenario) =>
              scenario.classification_id === testdatafile.classification_id
          );

          const computeResponse = await request.post(demandComputeEndpoint, {
            data: { scenario_id: latestAopDetails.scenario_id },
          });

          const computeResponseBody = await Utility.assertAndLog(
            computeResponse
          );

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

    test(`Verify if user can see publish error when request data is invalid`, async ({
      request,
    }) => {
      // invalid payload
      const invalidPayload = {
        scenario_id: -1,
        scenario_version: -1,
      };

      await test.step("Simulate failure when publishing AOP", async () => {
        Utility.logIt("Simulate failure when publishing AOP");

        try {
          const errorResponse = await request.post(endpointUploadURL, {
            data: invalidPayload,
          });

          expect(errorResponse.ok()).toBeFalsy();
          expect(errorResponse.status()).toBeGreaterThanOrEqual(400);
          expect(errorResponse.status()).not.toEqual(200);

          const errorText = await errorResponse.text();
          Utility.logIt(`Error response: ${errorText}`);
          expect(errorText).toContain(
            "Something went wrong. Please Try Again Later"
          );

          const contentType = errorResponse.headers()["content-type"];
          expect(contentType).toContain("application/json");
        } catch (error) {
          Utility.logIt(`Unexpected error occurred: ${error.message}`);
          throw error;
        }
      });
    });
  }
);
