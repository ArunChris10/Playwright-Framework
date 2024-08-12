import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";
import { UfmUtility } from "../fixtures/ufm-utils";

test.describe(
  "Verify forecast calendar APIs",
   { tag: "@Smoke @Regression @forecastCalendar" },
  () => {
  test.describe.configure({ timeout: 120_000, mode: "serial" });
  let fcst_id: string;
  let cycle_id: string;

  test("Verify if the user is able to @addNewForecastCalendar", async ({
    request,
  }) => {
    let forecastCalendarCreated = await UfmUtility.createForecastCalendar(
      request
      );
    fcst_id = forecastCalendarCreated.calendar_id;
    debug.log("Forecast is created  : ", forecastCalendarCreated);
  });

  test("Verify if the user is able to @getForecastCalendar", async ({
    request,
  }) => {
    let getForecastCalendar = await UfmUtility.getForecastCalendar(
      request,
      fcst_id
      );
    debug.log("Forecast is retrieved  : ", getForecastCalendar);
  });

  test("Verify if the user is able to @createForecastCalendarCycles", async ({
    request,
  }) => {
    let createForecastCalendarCycles =
    await UfmUtility.createForecastCalendarCycles(fcst_id, request);
    expect(createForecastCalendarCycles.cycle_id).toBeDefined();
    debug.log(
      "Forecast calendar cycle is created : "
      , JSON.stringify(createForecastCalendarCycles, null, 2)
      );
    cycle_id = createForecastCalendarCycles.cycle_id;
  });

  test("Verify if the user is able to @publishForecastCalendar", async ({
    request,
  }) => {
    let publishForecastCalendar = await UfmUtility.publishForecastCalendar(
      fcst_id,
      request
      );
    debug.log("Forecast is published  : ", publishForecastCalendar);
  });

    test("Verify if the user is able to @getForecastDeadlines", async ({
      request,
    }) => {
      let getForecastDeadlines = await UfmUtility.getForecastDeadlines(request);
      debug.log("Forecast calendar deadlines  : ", getForecastDeadlines);
    });

    test("Verify if the user is able to @deleteForecastCalendarCycle", async ({
      request,
    }) => {
      let deleteForecastCalendarCycle =
        await UfmUtility.deleteForecastCalendarCycle(
          fcst_id,
          cycle_id,
          request
        );
      debug.log("Forecast cycle is deleted  : ", deleteForecastCalendarCycle);
    });
  }
);
