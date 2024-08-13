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

  test("Verify if the user is able to @getInvalidForecastCalendar", async ({
    request,
  }) => {
    let getInvalidForecastCalendar = await UfmUtility.getInvalidForecastCalendar(
      request
      );
    debug.log("Forecast is invalid  : ", getInvalidForecastCalendar);
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
  test("Verify if the user is able to @createDuplicateForecastCalendarCycles", async ({
    request,
  }) => {
    let createDuplicateForecastCalendarCycles =
    await UfmUtility.createDuplicateForecastCalendarCycles(fcst_id, request);
    debug.log(
      "Forecast calendar cycle already exists : "
      , JSON.stringify(createDuplicateForecastCalendarCycles, null, 2)
      );
  });

  test("Verify if the user is able to @createForecastCalendarDuplicate", async ({
    request,
  }) => {
    let createForecastCalendarDuplicate =
    await UfmUtility.createForecastCalendarDuplicate(request);
    debug.log(
      "Forecast calendar cycle already exists : "
      , JSON.stringify(createForecastCalendarDuplicate, null, 2)
      );
  });

  test("Verify if the user is able to @createForecastCalendarInvalidDimId", async ({
    request,
  }) => {
    let createForecastCalendarInvalidDimId =
    await UfmUtility.createForecastCalendarInvalidDimId(request);
    debug.log(
      "Forecast calendar cycle invalid dim id : "
      , JSON.stringify(createForecastCalendarInvalidDimId, null, 2)
      );
  });

  test("Verify if the user is able to @createForecastCalendarInvalidDimVal", async ({
    request,
  }) => {
    let createForecastCalendarInvalidDimVal =
    await UfmUtility.createForecastCalendarInvalidDimVal(request);
    debug.log(
      "Forecast calendar cycle invalid dim id : "
      , JSON.stringify(createForecastCalendarInvalidDimVal, null, 2)
      );
  });

  test("Verify if the user is able to @createForecastCalendarInvalidYear", async ({
    request,
  }) => {
    let createForecastCalendarInvalidYear =
    await UfmUtility.createForecastCalendarInvalidYear(request);
    debug.log(
      "Forecast calendar cycle invalid year : "
      , JSON.stringify(createForecastCalendarInvalidYear, null, 2)
      );
  });

  test("Verify if the user is able to @editForecastCalendarCycleNoChange", async ({
    request,
  }) => {
    let editForecastCalendarCycleNoChange =
    await UfmUtility.editForecastCalendarCycleNoChange(fcst_id, cycle_id, request);
    debug.log(
      "Forecast calendar cycle is not edited : "
      , JSON.stringify(editForecastCalendarCycleNoChange, null, 2)
      );
  });

  test("Verify if the user is able to @editForecastCalendarCycle", async ({
    request,
  }) => {
    let editForecastCalendarCycle =
    await UfmUtility.editForecastCalendarCycle(fcst_id, cycle_id, request);
    debug.log(
      "Forecast calendar cycle is edited : "
      , JSON.stringify(editForecastCalendarCycle, null, 2)
      );
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

  test("Verify if the user is able to @publishDuplicateForecastCalendar", async ({
    request,
  }) => {
    let publishDuplicateForecastCalendar = await UfmUtility.publishDuplicateForecastCalendar(
      fcst_id,
      request
      );
    debug.log("Forecast is a duplicate  : ", publishDuplicateForecastCalendar);
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

    test("Verify if the user is able to @deleteMissingForecastCalendarCycle", async ({
      request,
    }) => {
      let deleteMissingForecastCalendarCycle =
        await UfmUtility.deleteMissingForecastCalendarCycle(
          fcst_id,
          cycle_id,
          request
        );
      debug.log("Forecast cycle does not exist  : ", deleteMissingForecastCalendarCycle);
    });
  }
);
