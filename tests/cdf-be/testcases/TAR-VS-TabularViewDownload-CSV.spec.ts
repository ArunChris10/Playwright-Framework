import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import adjustmentData from "../testdata/adjustment-layer-data.json";
import testdata from '../testdata/get-demand-scenario-forecast-csv.json'

test.describe("Verify CSV Download for Manual Flattened Adjustment Units", { tag: "@Smoke @Manual Adjustment Flattened - CSV @DemandOutput @ibg-service-scenario-financials @Regression" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let csvResponse;
  let demandId;
  let expected = testdata.expectedMetrics;
  let payload = testdata.payload;
  let layerId;
  let demandScenarioDetails;
  let sbuFilter = adjustmentData.sbuFilter;
  let deptartmentFilter = adjustmentData.deptartmentFilter;
  let channelFilter = adjustmentData.channelFilter;
  let yearMonthsFormatted;
  let baseForecastData;

  test.beforeAll(async ({ request }) => {
    demandId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await AdjustmentUtility.getDemandStackDetails(
        request,
        demandId
    );
  });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify Units Exists for CSV Download", async ({
    request
  }) => {

    await test.step("Create manual adjustment flattened layer", async () => {
        const response = await AdjustmentUtility.getAllDemandScenarioForecastData(
            request,
            demandId,
            demandScenarioDetails
        );
        let startDate = String(
            parseInt(response.cutOffDate.split("-").join("")) + 1
        );
        yearMonthsFormatted = startDate.substring(0, 4) + "-" + startDate.substring(4);
        const updateDSResponse = await AdjustmentUtility.updateDemandStacksData(
          request,
          demandId,
          demandScenarioDetails,
          sbuFilter.sbuName[0],
          sbuFilter.sbuIds[0],
          deptartmentFilter.deptName[0],
          deptartmentFilter.deptIds[0],
          channelFilter.channelName,
          channelFilter.channelIds,
          yearMonthsFormatted,
          false,
          baseForecastData,
          "HOLD_UNITS"
        );
        layerId = updateDSResponse[0].layerId
    })


    await test.step("Getting CSV Data", async () => {
        payload.layerIds = [layerId];
        csvResponse = await CdfUtility.getDemandScenarioByIdCustomCSV(request, demandId, payload);
    })

    await test.step("Verifying all units exist", async () => {
        for (let i = 0; i < expected.length; i++) {
            let unit = expected[i];
            let csvResponseData = await DemandBaseClass.getCellValueFromExcel(csvResponse,`${String.fromCharCode(65+i+10)}1`);
            expect(csvResponseData).toBe(unit);
        }
    })
  });
})


test.describe("Verify CSV Download for Filters Applied Manual Flattened Adjustment", { tag: "@Smoke @Manual Adjustment Flattened - CSV @DemandOutput @ibg-service-scenario-financials @Regression" }, () => {

  test.describe.configure({ timeout: 120_000, mode: 'serial' });
  let csvResponse;
  let demandId;
  let layerId;
  let demandScenarioDetails;
  let sbuFilter = adjustmentData.sbuFilter;
  let deptartmentFilter = adjustmentData.deptartmentFilter;
  let channelFilter = adjustmentData.channelFilter;
  let yearMonthsFormatted;
  let baseForecastData;

  test.beforeAll(async ({ request }) => {
    demandId = await CdfUtility.createScenario(request);
    demandScenarioDetails = await AdjustmentUtility.getDemandStackDetails(
        request,
        demandId
    );
  });

  test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

  test("Verify Filters Applied CSV Download", async ({
    request
  }) => {

    await test.step("Create manual adjustment flattened layer", async () => {
        const response = await AdjustmentUtility.getAllDemandScenarioForecastData(
            request,
            demandId,
            demandScenarioDetails
        );
        let startDate = String(
            parseInt(response.cutOffDate.split("-").join("")) + 1
        );
        yearMonthsFormatted = startDate.substring(0, 4) + "-" + startDate.substring(4);
        const updateDSResponse = await AdjustmentUtility.updateDemandStacksData(
          request,
          demandId,
          demandScenarioDetails,
          sbuFilter.sbuName[0],
          sbuFilter.sbuIds[0],
          deptartmentFilter.deptName[0],
          deptartmentFilter.deptIds[0],
          channelFilter.channelName,
          channelFilter.channelIds,
          yearMonthsFormatted,
          false,
          baseForecastData,
          "HOLD_UNITS"
        );
        layerId = updateDSResponse[0].layerId
    })


    await test.step("Getting CSV Data", async () => {
        let payload = testdata.payloadTwoFilters;
        payload.layerIds = [layerId];
        csvResponse = await CdfUtility.getDemandScenarioByIdCustomCSV(request, demandId, payload);
    })
    await test.step("Verifying filters were applied", async () => {
        let payload = testdata.payloadTwoFilters;
        let sbus = payload.sbu;
        let departments = payload.department;
        let channel = payload.baseChannel;
        let years = payload.timeFilter.years.map(year => parseInt(year));
        let months = payload.timeFilter.yearMonths.map(month => parseInt(month.slice(-2)));
        let cellValue;

        for (let i = 2; (cellValue = await DemandBaseClass.getCellValueFromExcel(csvResponse,`F${i}`)) != null; i++) {
            expect(sbus).toContain(cellValue.toUpperCase());
        }

        for (let i = 2; (cellValue = await DemandBaseClass.getCellValueFromExcel(csvResponse,`G${i}`)) != null; i++) {
            expect(departments).toContain(cellValue.toUpperCase());
        }

        for (let i = 2; (cellValue = await DemandBaseClass.getCellValueFromExcel(csvResponse,`J${i}`)) != null; i++) {
            expect(channel).toContain(cellValue.toUpperCase());
        }

        for (let i = 2; (cellValue = await DemandBaseClass.getCellValueFromExcel(csvResponse,`B${i}`)) != null; i++) {
            expect(years).toContain(cellValue);
        }

        for (let i = 2; (cellValue = await DemandBaseClass.getCellValueFromExcel(csvResponse,`C${i}`)) != null; i++) {
            expect(months).toContain(cellValue);
        }
    })
  });
})