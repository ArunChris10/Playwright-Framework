import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import { AdjustmentUtility } from '../fixtures/adjustment-utils';
import getCurrentDemandForecast from '../testdata/get-currentdemand-scenario-forecast.json'
import filterTestData from "../testdata/cdfFilter.json";

test.describe("Verify the month list in EMT tool containsRemaining months of current fiscal year and all the Next Fiscal months", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    let forecastVersion;
    let cutOffDateYear;
    let cutOffDateMonth;
    let forecastRange;

    test("Verify month list is correct in EMT", async ({ request }) => {
        await test.step("Fetch the forecast version for the demand stack", async () => {
            forecastVersion = await CdfUtility.getDemandScenarioList(request);
            forecastVersion = forecastVersion.version;
        });

        await test.step("Fetch cutOffDate", async () => {
            let getDemandScenarioForecastResponse;
            getDemandScenarioForecastResponse = await CdfUtility.getCurrentDemandForecast(request, getCurrentDemandForecast.payload_all_years_only);
            expect(getDemandScenarioForecastResponse.cutOffDate).toBeDefined();
            cutOffDateYear = parseInt(getDemandScenarioForecastResponse.cutOffDate.split('-')[0]);
            cutOffDateMonth = parseInt(getDemandScenarioForecastResponse.cutOffDate.split('-')[1]);
        });

        await test.step("Fetch the forecast range", async () => {
            forecastRange = await AdjustmentUtility.getForecastRange(request, forecastVersion);
        });

        await test.step("Verify time ranges", async () => {
            expect(forecastRange).toBeDefined();
            expect(forecastRange.startYear).toBe(cutOffDateYear);
            expect(forecastRange.startMonth).toBe(cutOffDateMonth + 1);
            expect(forecastRange.endYear).toBe(cutOffDateYear + 6);
        });
    });
});

test.describe("Verify when creating a new EMT layer, user should be able to see all the SBU, Department and Channel lists", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT" }, () => {
    let channels;
    let sbus;
    let department;

    test("Verify all filters are present", async ({ request }) => {
        await test.step("Fetch all filters", async () => {
            const response = await CdfUtility.fetchFilterDataFromEndpoint(request);
            channels = response.baseChannelList.map((channel) => ({
                displayName: channel.displayName,
                displayOrder: channel.displayOrder,
                id: channel.id,
                name: channel.name,
            }));
            sbus = response.sbus.map((sbu) => ({
                displayName: sbu.sbuDisplayName,
                id: sbu.id,
                name: sbu.name,
            }));
            department = response.departments.map((department) => ({
                displayName: department.departmentDisplayName,
                id: department.id,
                name: department.name,
            }));
        });

        await test.step("Verify channels", async () => {
            expect(channels).toEqual(filterTestData.baseChannels);
        });

        await test.step("Verify sbus", async () => {
            expect(sbus).toEqual(filterTestData.sbus);
        });

        await test.step("Verify departments", async () => {
            expect(department).toEqual(filterTestData.departments);
        });
    });
});