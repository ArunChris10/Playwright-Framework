import debug from "debug";
import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { ForecastCalendarUtil } from "../fixtures/forecastCalendar-utils";
import forecastCalendarData from "../testdata/forecast-calendar-api.json";

test.describe(
  "Verify forecast calendar APIs",
  { tag: "@Regression @forecastCalendar ibg-ufm-metadata-service ibg-ufm-core-service" },
  () => {
    test.describe.configure({ timeout: 120_000, mode: "serial" });
    let fcst_id = "3461B40C-F149-4734-8E4C-95722B1F01EA";

    let cycle_id: string;

    test("Delete all existing cycles", { tag: "@Regression @test11" }, async ({ request }) => {
      await ForecastCalendarUtil.deleteAllForecastCycles(request);
    });

    //Skipping below No need to create forecast calendar as we cannot delete a calendar it is easy to delete the cycles within the calendar
    // test.skip("Verify if the user is able to @addNewForecastCalendar", async ({
    //   request,
    // }) => {
    //   let forecastCalendarCreated =
    //     await ForecastCalendarUtil.createForecastCalendar(request);
    //   fcst_id = forecastCalendarCreated.calendar_id;
    //   debug.log("Forecast is created  : ", forecastCalendarCreated);
    // });

    test("Verify if the user is able to @createForecastCalendarCycles", { tag: "@Regression @test11" }, async ({
      request,
    }) => {
      let createForecastCalendarCycles =
        await ForecastCalendarUtil.createForecastCalendarCycles(
          fcst_id,
          request
        );
      expect(createForecastCalendarCycles.cycle_id).toBeDefined();
      debug.log(
        "Forecast calendar cycle is created : ",
        JSON.stringify(createForecastCalendarCycles, null, 2)
      );
      cycle_id = createForecastCalendarCycles.cycle_id;
    });


    test("Verify if the user is able to @getForecastCalendar", { tag: "@Regression @test1" }, async ({
      request,
    }) => {
      let getForecastCalendar = await ForecastCalendarUtil.getForecastCalendar(
        request,
        fcst_id
      );
      //get the existing forecast calender ID
      fcst_id = getForecastCalendar.calendar_id;
      Utility.logIt(`Forecast is retrieved : ${getForecastCalendar}`);
    });

    test("Verify if the user is able to @getInvalidForecastCalendar", async ({
      request,
    }) => {
      let getInvalidForecastCalendar =
        await ForecastCalendarUtil.getInvalidForecastCalendar(request);
      Utility.logIt(`Forecast is invalid : ${getInvalidForecastCalendar}`);
    });


    test("Verify if the user is able to @publishForecastCalendar", { tag: "@test11" }, async ({
      request,
    }) => {
      let publishForecastCalendar =
        await ForecastCalendarUtil.publishForecastCalendar(fcst_id, request);
      Utility.logIt(`Forecast is published :  ${publishForecastCalendar}`);
    });

    test("Verify if the user is able to @publishDuplicateForecastCalendar", { tag: "@duplct" }, async ({
      request,
    }) => {
      let publishDuplicateForecastCalendar =
        await ForecastCalendarUtil.publishDuplicateForecastCalendar(
          fcst_id,
          request
        );
      Utility.logIt(
        `Forecast is a duplicate  : ${publishDuplicateForecastCalendar}`
      );
    });

    test("Verify if the user is able to @getForecastDeadlines", { tag: "@test11" }, async ({
      request,
    }) => {
      let getForecastDeadlines =
        await ForecastCalendarUtil.getForecastDeadlines(request);
      const expectedObject = {
        dim_id: forecastCalendarData.getForecastCalendarPayload.dim_id,
        dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
        forecast_cal_id: fcst_id,
        cycle_id: cycle_id,
        event_id: 28,
      };

      // Normalize keys and values for case-insensitive comparison
      const normalizedOutput = getForecastDeadlines.map((obj) => ({
        ...obj,
        cycle_id: obj.cycle_id.toLowerCase(),
        dim_id: obj.dim_id.toString(),
        dim_val_id: obj.dim_val_id.toString(),
      }));

      const normalizedExpected = {
        ...expectedObject,
        cycle_id: expectedObject.cycle_id.toLowerCase(),
        dim_id: expectedObject.dim_id.toString(),
        dim_val_id: expectedObject.dim_val_id.toString(),
      };

      // Check if the normalized output contains the normalized expected object
      const containsObject = normalizedOutput.some((obj) =>
        Object.entries(normalizedExpected).every(
          ([key, value]) => obj[key] === value
        )
      );

      expect(containsObject).toBeTruthy();

    });



    test("Verify if the user is able to @createDuplicateForecastCalendarCycles", async ({
      request,
    }) => {
      let createDuplicateForecastCalendarCycles =
        await ForecastCalendarUtil.createDuplicateForecastCalendarCycles(
          fcst_id,
          request
        );
      Utility.logIt(
        "Forecast calendar cycle already exists : " +
        JSON.stringify(createDuplicateForecastCalendarCycles, null, 2)
      );
    });

    test("Verify if the user is able to @createForecastCalendarDuplicate", async ({
      request,
    }) => {
      let createForecastCalendarDuplicate =
        await ForecastCalendarUtil.createForecastCalendarDuplicate(request);
      Utility.logIt(
        "Forecast calendar cycle already exists : " +
        JSON.stringify(createForecastCalendarDuplicate, null, 2)
      );
    });

    test("Verify if the user is able to @createForecastCalendarInvalidDimId", async ({
      request,
    }) => {
      let createForecastCalendarInvalidDimId =
        await ForecastCalendarUtil.createForecastCalendarInvalidDimId(request);
      Utility.logIt(
        "Forecast calendar cycle invalid dim id : " +
        JSON.stringify(createForecastCalendarInvalidDimId, null, 2)
      );
    });

    test("Verify if the user is able to @createForecastCalendarInvalidDimVal", async ({
      request,
    }) => {
      let createForecastCalendarInvalidDimVal =
        await ForecastCalendarUtil.createForecastCalendarInvalidDimVal(request);
      Utility.logIt(
        "Forecast calendar cycle invalid dim id : " +
        JSON.stringify(createForecastCalendarInvalidDimVal, null, 2)
      );
    });

    test("Verify if the user is able to @createForecastCalendarInvalidYear", async ({
      request,
    }) => {
      let createForecastCalendarInvalidYear =
        await ForecastCalendarUtil.createForecastCalendarInvalidYear(request);
      Utility.logIt(
        "Forecast calendar cycle invalid year : " +
        JSON.stringify(createForecastCalendarInvalidYear, null, 2)
      );
    });

    test("Verify if the user is able to @editForecastCalendarCycleNoChange", async ({
      request,
    }) => {
      let editForecastCalendarCycleNoChange =
        await ForecastCalendarUtil.editForecastCalendarCycleNoChange(
          fcst_id,
          cycle_id,
          request
        );
      Utility.logIt(
        "Forecast calendar cycle is not edited : " +
        JSON.stringify(editForecastCalendarCycleNoChange, null, 2)
      );
    });

    test("Verify if the user is able to @editForecastCalendarCycle", async ({
      request,
    }) => {
      let editForecastCalendarCycle =
        await ForecastCalendarUtil.editForecastCalendarCycle(
          fcst_id,
          cycle_id,
          request
        );
      Utility.logIt(
        "Forecast calendar cycle is edited : " +
        JSON.stringify(editForecastCalendarCycle, null, 2)
      );
    });

    // test("Verify if the user is able to @publishForecastCalendar", async ({
    //   request,
    // }) => {
    //   let publishForecastCalendar =
    //     await ForecastCalendarUtil.publishForecastCalendar(fcst_id, request);
    //   Utility.logIt(`Forecast is published :  ${publishForecastCalendar}`);
    // });






    test("Verify if the user is able to @deleteForecastCalendarCycle", async ({
      request,
    }) => {
      let deleteForecastCalendarCycle =
        await ForecastCalendarUtil.deleteForecastCalendarCycle(
          fcst_id,
          cycle_id,
          request
        );
      Utility.logIt(`Forecast cycle is deleted  : ${cycle_id}`);
    });

    test("Verify if the user is able to @deleteMissingForecastCalendarCycle", async ({
      request,
    }) => {
      let deleteMissingForecastCalendarCycle =
        await ForecastCalendarUtil.deleteMissingForecastCalendarCycle(
          fcst_id,
          cycle_id,
          request
        );
      Utility.logIt(
        `Forecast cycle does not exist  : 
        ${cycle_id}`
      );
    });
  }
);
