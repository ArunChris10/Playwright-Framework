// @ts-nocheck
import debug from "debug";
import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { DemandTabular } from "../fixtures/demand-tabular"
import { ManageRebaseUtility } from '../fixtures/manage-rebase-utils';
import {payload, onlyDepartmentSelected, allColumnsSelected, onlySbuSelected, yearList, 
  yearMonths, years, monthNames, endpointForGetDemandScenarioForecast, excelColumns} from "../testdata/deman-tabular.json";
import { expect } from "../../common/fixtures/test-hook";

test.describe(
  "Verify if Demand tabular excel download is as per filter selected",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandTabularExcel",
  },
  () => {
    let demandStackId,
      demandScenarioDetails,
      fileName = `download_${new Date().getTime()}_data.xlsx`;

    test.beforeAll(async ({ request }) => {
      demandStackId = await CdfUtility.createScenario(request);
      demandScenarioDetails =
            await DemandTabular.getDemandStackDetails(request, demandStackId)

      payload.version = demandScenarioDetails.forecastInfoDTO.forecastInfo.version;
      onlyDepartmentSelected.version = demandScenarioDetails.forecastInfoDTO.forecastInfo.version;
      onlySbuSelected.version = demandScenarioDetails.forecastInfoDTO.forecastInfo.version;
      allColumnsSelected.version = demandScenarioDetails.forecastInfoDTO.forecastInfo.version;
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandStackId);
    });

    test("Demand tabular excel download", async ({ request }) => {
      
      await test.step("Verify: Demand tabular excel download matches with grid table data", async () => {
        let requestBody = onlySbuSelected;
        requestBody.timeFilter.isYearSelected = true;
        requestBody.timeFilter.isMonthSelected = true;
        requestBody.timeFilter.yearList = yearList;
        requestBody.timeFilter.yearMonths = yearMonths
        requestBody.timeFilter.years = years;

        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            requestBody
          );
          
          const response = await ManageRebaseUtility.getDemandScenarioForecast(request, demandStackId, endpointForGetDemandScenarioForecast, requestBody);
          let demandTabularForecast = await response.json();
        
          DemandTabular.validateExcelAndForecastValues(downloadResponse, demandTabularForecast, excelColumns, requestBody.sbuIds);
      });

      await test.step("Verify: Demand tabular excel download matches SBUs", async () => {
        let requestBody = onlySbuSelected;
        requestBody.timeFilter.isYearSelected = true;
        requestBody.timeFilter.isMonthSelected = true;
        requestBody.timeFilter.yearList = yearList;
        requestBody.timeFilter.yearMonths = yearMonths
        requestBody.timeFilter.years = years;

        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            requestBody
          );

          DemandTabular.validateMetrics(downloadResponse, allColumnsSelected);
          DemandTabular.validateSbus(downloadResponse, requestBody);
      });

      await test.step("Verify: Demand tabular excel download matches months and years", async () => {
        let requestBody = onlySbuSelected;
        requestBody.timeFilter.isYearSelected = true;
        requestBody.timeFilter.isMonthSelected = true;
        requestBody.timeFilter.yearList = yearList;
        requestBody.timeFilter.yearMonths = yearMonths
        requestBody.timeFilter.years = years;

        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            requestBody
          );

          DemandTabular.validateYears(downloadResponse, yearList);
          DemandTabular.validateMonths(downloadResponse, monthNames);
      });
    
      await test.step(`Verify: Demand tabular excel download with department and SBU`, async () => {
        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            payload
          );

        expect(downloadResponse[`B${9}`].v === payload.selectedMetrics[0]).toBe(true);
        expect(downloadResponse[`C${8}`].v === payload.selectedColumns[0]).toBe(true);
        expect(downloadResponse[`D${8}`].v === payload.selectedColumns[1]).toBe(true);
      });

      await test.step("Verify: Demand tabular excel download with base channel, SBU and department", async () => {
        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            allColumnsSelected
          );

          expect(downloadResponse[`B${9}`].v === allColumnsSelected.selectedMetrics[0]).toBe(true);
          expect(downloadResponse[`C${8}`].v === allColumnsSelected.selectedColumns[0]).toBe(true);
          expect(downloadResponse[`D${8}`].v === allColumnsSelected.selectedColumns[1]).toBe(true);
          expect(downloadResponse[`E${8}`].v === allColumnsSelected.selectedColumns[2]).toBe(true);
      });

      await test.step("Verify: Demand tabular excel download with department", async () => {
        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            onlyDepartmentSelected
          );

        expect(downloadResponse[`B${9}`].v === allColumnsSelected.selectedMetrics[0]).toBe(true);
        expect(downloadResponse[`C${8}`].v === "DEPARTMENT").toBe(true);
      });

      await test.step("Verify: Demand tabular excel download with 2 years selected", async () => {
        let requestBody = onlyDepartmentSelected;
        requestBody.timeFilter.isYearSelected = true;
        requestBody.timeFilter.yearList = yearList;
        requestBody.timeFilter.years = years;
        requestBody.timeFilter.yearMonths = ["202501","202502","202503","202504","202505","202506","202507","202508","202509","202510","202511","202512","202601","202602","202603","202604","202605","202606","202607","202608","202609","202610","202611","202612"];

        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            requestBody
          );

        expect(downloadResponse[`B${9}`].v === allColumnsSelected.selectedMetrics[0]).toBe(true);
        expect(downloadResponse[`C${8}`].v === "DEPARTMENT").toBe(true);
      });

      await test.step("Verify: Demand tabular excel download with 2 years and 2 months selected", async () => {
        let requestBody = onlyDepartmentSelected;
        requestBody.timeFilter.isYearSelected = true;
        requestBody.timeFilter.isMonthSelected = true;
        requestBody.timeFilter.yearList = yearList;
        requestBody.timeFilter.yearMonths = yearMonths
        requestBody.timeFilter.years = years;

        const downloadResponse =
          await DemandTabular.downloadExcelandReturnData(
            request,
            demandStackId,
            fileName,
            requestBody
          );

        expect(downloadResponse[`B${9}`].v === allColumnsSelected.selectedMetrics[0]).toBe(true);
        expect(downloadResponse[`C${8}`].v === "DEPARTMENT").toBe(true);
      });
    });
  }
);
