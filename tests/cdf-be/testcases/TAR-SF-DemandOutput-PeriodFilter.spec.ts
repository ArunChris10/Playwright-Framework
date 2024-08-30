import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import testdata from "../testdata/period-filter.json";

test.describe(
  "Verify user can filter data by year dropdown in month view",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    let getDemandScenarioForecastResponse;
    test("Verify user can filter data by year dropdown in month view", async ({
      request,
    }) => {
      await test.step("Fetch the get-demand-scenario-forecast", async () => {
        getDemandScenarioForecastResponse =
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId,
            testdata.yearFilter
          );
      });
      await test.step("Verify only 2029 data is returned", async () => {
        for (let forecast of getDemandScenarioForecastResponse.forecast) {
          let counter = 1;
          for (let miniForecast of forecast.forecast) {
            expect(miniForecast.year).toBe(
              parseInt(testdata.yearFilter.timeFilter.years[0])
            );
            expect(miniForecast.month).toBe(counter);
            counter++;
          }
        }
      });
    });
  }
);

test.describe(
  "Verify user can filter data by year dropdown in Quarterly view",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId;
    const metrics = testdata.metrics;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    let getDemandScenarioForecastResponse;
    test("Verify user can filter data by year dropdown in Quarterly view", async ({
      request,
    }) => {
      await test.step("Fetch the get-demand-scenario-forecast", async () => {
        getDemandScenarioForecastResponse =
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId,
            testdata.quarterFilter
          );
      });
      await test.step("Verify only 2029 data is returned", async () => {
        for (let forecast of getDemandScenarioForecastResponse.quarterlyForecast) {
          let counter = 1;
          for (let miniForecast of forecast.forecast) {
            expect(miniForecast.year).toBe(
              parseInt(testdata.quarterFilter.timeFilter.years[0])
            );
            expect(miniForecast.quarter).toBe(counter);
            counter++;
          }
        }
      });

      let getDemandScenarioForecastMonthViewResponse;
      await test.step("Get Month data of 2029", async () => {
        getDemandScenarioForecastMonthViewResponse =
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId,
            testdata.yearFilter
          );
      });

      await test.step("Verify months added up equate to quarter for all metrics", async () => {
        for (
          let i = 0,
            len = getDemandScenarioForecastResponse.quarterlyForecast.length;
          i < len;
          i++
        ) {
          let quarterForecast =
            getDemandScenarioForecastResponse.quarterlyForecast[i];
          let monthForecast =
            getDemandScenarioForecastMonthViewResponse.forecast[i];
          let sum = {};
          for (let j = 0; j < monthForecast.forecast.length; j++) {
            const miniForecastMonth = monthForecast.forecast[j];
            const miniForecastQuarter =
              quarterForecast.forecast[Math.floor(j / 3)];
            for (const metric of metrics) {
              sum[metric] = (sum[metric] || 0) + miniForecastMonth[metric];
            }
            if ((j + 1) % 3 === 0) {
              for (const metric of metrics) {
                expect(
                  Math.abs(sum[metric] - miniForecastQuarter[metric])
                ).toBeLessThanOrEqual(0.03);
              }
              sum = {};
            }
          }
        }
      });
    });
  }
);

test.describe(
  "Verify user can filter data by Quarter dropdown in Quarterly view",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId;
    const metrics = testdata.metrics;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    let getDemandScenarioForecastResponse;
    test("Verify user can filter data by Quarter dropdown in Quarterly view", async ({
      request,
    }) => {
      await test.step("Fetch the get-demand-scenario-forecast", async () => {
        getDemandScenarioForecastResponse =
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId,
            testdata.monthFilterWithQuarter
          );
      });
      await test.step("Verify only quarter 1 data is returned", async () => {
        for (let forecast of getDemandScenarioForecastResponse.quarterlyForecast) {
          let counter = 2020;
          for (let miniForecast of forecast.forecast) {
            expect(miniForecast.quarter).toBe(1);
            expect(miniForecast.year).toBe(counter);
            counter++;
          }
        }
      });

      let getDemandScenarioForecastMonthViewResponse;
      await test.step("Get Month data of everything", async () => {
        getDemandScenarioForecastMonthViewResponse =
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId
          );
      });

      await test.step("Verify months added up equate to quarter for all metrics in year view", async () => {
        for (
          let i = 0;
          i < getDemandScenarioForecastResponse.quarterlyForecast.length;
          i++
        ) {
          let quarterlyForecast =
            getDemandScenarioForecastResponse.quarterlyForecast[i];
          let monthForecast =
            getDemandScenarioForecastMonthViewResponse.forecast[i];
          let sum = {};
          let counter = 0;
          for (let j = 0; j < monthForecast.forecast.length; j++) {
            const miniForecastMonth = monthForecast.forecast[j];
            if (miniForecastMonth.month > 3) {
              continue;
            }
            for (const metric of metrics) {
              sum[metric] = (sum[metric] || 0) + miniForecastMonth[metric];
            }
            if ((j + 1) % 3 === 0) {
              for (const metric of metrics) {
                const miniForecastYear = quarterlyForecast.forecast[counter];
                expect(
                  Math.abs(sum[metric] - miniForecastYear[metric])
                ).toBeLessThanOrEqual(0.03);
              }
              counter++;
              sum = {};
            }
          }
        }
      });
    });
  }
);

test.describe(
  "Verify user can filter data by month dropdown in Monthly view",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    let getDemandScenarioForecastResponse;
    test("Verify user can filter data by month dropdown in Monthly view", async ({
      request,
    }) => {
      await test.step("Fetch the get-demand-scenario-forecast", async () => {
        getDemandScenarioForecastResponse =
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId,
            testdata.monthFilter
          );
      });
      await test.step("Verify only one month per year is returned (one specified)", async () => {
        for (let forecast of getDemandScenarioForecastResponse.forecast) {
          let counter = 2020;
          for (let miniForecast of forecast.forecast) {
            expect(miniForecast.year).toBe(counter);
            expect(miniForecast.month).toBe(5);
            counter++;
          }
        }
      });
    });
  }
);
