import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import forecastCalendarData from "../testdata/forecast-calendar-api.json";

export class ForecastCalendarUtil {
  // This method will create a forecast calendar and assert the response
  static async createForecastCalendar(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarPayload,
    });

    expect(responseBody.status_code).toEqual(
      forecastCalendarData.createSuccessResponseCode
    );
    return responseBody;
  }

  // This method will create a duplicate forecast calendar and assert the response
  static async createForecastCalendarDuplicate(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarPayload,
    });
    expect(response.status === 422);
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(
      forecastCalendarData.createErrorDuplicateResponse
    );
    return responseBody;
  }

  // This method will create a forecast calendar using invalid permissions and assert the response
  static async createForecastCalendarInvalidDimId(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarPayloadInvalidDimId,
    });
    expect(response.status === 403);
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(
      forecastCalendarData.createErrorInvalidPermissionResponse
    );
    return responseBody;
  }

  // This method will create a forecast calendar using invalid dim val and assert the response
  static async createForecastCalendarInvalidDimVal(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarPayloadInvalidDimVal,
    });
    expect(response.status === 403);
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(
      forecastCalendarData.createErrorInvalidDimValResponse
    );
    return responseBody;
  }

  // This method will create a forecast calendar using invalid year and assert the response
  static async createForecastCalendarInvalidYear(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarPayloadInvalidYear,
    });
    expect(response.status === 422);
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(
      forecastCalendarData.createErrorInvalidYear
    );
    return responseBody;
  }

  // This method will get the forecast cycle and assert the response
  static async getForecastCalendar(request, fcst_id, validate = true) {
    Utility.logIt(fcst_id);
    const params = new URLSearchParams({
      dim_id: forecastCalendarData.getForecastCalendarPayload.dim_id,
      dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
      classification_id:
        forecastCalendarData.getForecastCalendarPayload.classification_id,
      fiscal_year: forecastCalendarData.getForecastCalendarPayload.fiscal_year,
    });
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint
      }?${params.toString()}`;
    const response = await request.get(endpointURL, { params: null });

    let responseBody = await Utility.assertAndLog(response);


    if (validate == true) {
      expect(responseBody.calendar_id).toEqual(fcst_id);
    }
    return responseBody
  }

  static async deleteAllForecastCycles(request) {
    Utility.logIt("Deleting all acctive forecast cycles for the year " + forecastCalendarData.getForecastCalendarPayload.fiscal_year);

    let responseBody = await ForecastCalendarUtil.getForecastCalendar(request, "", false)



    for (let i = 0; i < responseBody.submission_cycles.length; i++) {
      await ForecastCalendarUtil.deleteForecastCalendarCycle(
        responseBody.calendar_id,
        responseBody.submission_cycles[i].cycle_id,
        request
      );

      console.log("Cycle deleted ", responseBody.submission_cycles[i].cycle_id)
    }


  }
  // This method will get a nonexistent forecast cycle and assert the response
  static async getInvalidForecastCalendar(request) {
    const params = new URLSearchParams({
      dim_id: forecastCalendarData.getForecastCalendarPayload.invalid_dim_id,
      dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
      classification_id:
        forecastCalendarData.getForecastCalendarPayload.classification_id,
      fiscal_year: forecastCalendarData.getForecastCalendarPayload.fiscal_year,
    });
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint
      }?${params.toString()}`;
    const response = await request.get(endpointURL, { params: null });
    expect(response.status === 403);
    let responseBody = await response.json();
    Utility.logIt(responseBody);
    expect(responseBody.message).toEqual(
      forecastCalendarData.getCalendarErrorDoesNotExist
    );
  }

  // This method will create the forecast calendar cycle and assert the response
  static async createForecastCalendarCycles(fcst_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}/cycles`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarCyclesPayload,
    });

    let responseBody = await Utility.assertAndLog(response);
    expect(responseBody.cycle_id).not.toEqual(null);
    return responseBody;
  }

  // This method will edit the forecast calendar cycle with no change and assert the response
  static async editForecastCalendarCycleNoChange(fcst_id, cycle_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}/cycles/${cycle_id}`;
    const response = await request.patch(endpointURL, {
      data: forecastCalendarData.createForecastCalendarCyclesPayload,
    });
    expect(response.status === 422);
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(
      forecastCalendarData.editCycleNoChange
    );
    return responseBody;
  }

  // This method will edit the forecast calendar cycle and assert the response
  static async editForecastCalendarCycle(fcst_id, cycle_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}/cycles/${cycle_id}`;
    const response = await request.patch(endpointURL, {
      data: forecastCalendarData.editForecastCalendarCyclesPayload,
    });

    let responseBody = await Utility.assertAndLog(response);
    expect(responseBody.message).toEqual(
      forecastCalendarData.editCycleSuccessResponse
    );
    return responseBody;
  }

  // This method will create a duplicate forecast calendar cycle and assert the response
  static async createDuplicateForecastCalendarCycles(fcst_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}/cycles`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarCyclesPayload,
    });
    expect(response.status === 422);
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(
      forecastCalendarData.createDuplicateForecastCycleResponse
    );
    return responseBody;
  }

  // This method will publish the forecast and assert the response
  static async publishForecastCalendar(fcst_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}`;
    const payload = {
      published_flag: true,
    };
    const response = await request.patch(endpointURL, { data: payload });
    let responseBody = await Utility.assertAndLog(response);
    expect(responseBody.calendar_id).not.toEqual(null);

    return responseBody.calendar_id
  }

  // This method will publish a duplicate forecast and assert the response
  static async publishDuplicateForecastCalendar(fcst_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}`;
    const payload = {
      published_flag: true,
    };
    const response = await request.patch(endpointURL, { data: payload });
    expect(response.status === 400);
    let responseBody = await response.json();
    expect(responseBody.message).toEqual(
      forecastCalendarData.publishForecastCalendarErrorAlreadyExists
    );
    return responseBody.message
  }

  // This method will get the forecast deadlines and assert the response
  static async getForecastDeadlines(request) {

    const params = new URLSearchParams({
      dim_id: forecastCalendarData.getForecastCalendarPayload.dim_id,
      dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
      classification_id:
        forecastCalendarData.getForecastCalendarPayload.classification_id,
      children: "true",
      published: "true"
    });

    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}deadlines?${params.toString()}`;

    // const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/deadlines?dim_id=${forecastCalendarData.}&dim_val_id=130001&classification_id=12&children=true&published=true}`;

    console.log(endpointURL, params)
    const response = await request.get(endpointURL);
    let responseBody = await response.json();
    expect(responseBody.calendar_id).not.toEqual(null);

    return responseBody
  }

  // This method will delete the forecast cycle and assert the response to be ok
  static async deleteForecastCalendarCycle(fcst_id, cycle_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}${fcst_id}/cycles/${cycle_id}`;
    const response = await request.delete(endpointURL);
    expect(response).toBeOK();
  }

  // This method will delete a nonexistent forecast cycle and assert the response
  static async deleteMissingForecastCalendarCycle(fcst_id, cycle_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}${fcst_id}/cycles/${cycle_id}`;
    const response = await request.delete(endpointURL);
    expect(response === 404);
  }
}
