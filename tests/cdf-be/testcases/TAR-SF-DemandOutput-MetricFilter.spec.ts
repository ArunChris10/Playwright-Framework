import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
  "Verify user can filter data by specific metrics using a single select for all the metrics",
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
    test("Get scenario forecast", async ({ request }) => {
      await test.step("Fetch the get-demand-scenario-forecast", async () => {
        getDemandScenarioForecastResponse =
          await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId,
            {
              includeDerivedMetrics: true,
            }
          );
      });

      await test.step("Verify all metrics are present", async () => {
        let forecast =
          getDemandScenarioForecastResponse.forecast[0].forecast.slice(-1)[0];

        expect(forecast.amount).toBeDefined();
        expect(forecast.sales).toBeDefined();
        expect(forecast.units).toBeDefined();
        expect(forecast.aur).toBeDefined();
        expect(forecast.uomValue).toBeDefined();
        expect(forecast.forecastGrowth).toBeDefined();
        expect(
          forecast.forecastGrowth.yearOverYearSalesPercentage
        ).toBeDefined();
        expect(
          forecast.forecastGrowth.yearOverYearUnitsPercentage
        ).toBeDefined();
        expect(forecast.forecastGrowth.yearOverYearAurPercentage).toBeDefined();
        expect(forecast.forecastGrowth.saleMixPercentage).toBeDefined();
        expect(
          forecast.forecastGrowth.yearOverYearConvertedSalesPercentage
        ).toBeDefined();
        expect(forecast.forecastGrowth.yearOverYearUomPercentage).toBeDefined();
      });
    });
  }
);
