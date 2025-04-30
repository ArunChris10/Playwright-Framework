import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import forecastCalendarData from "../testdata/forecast-calendar-api.json";

export class ForecastCalendarUtil {
  /**
   * This method will create a forecast calendar and assert the response.
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async createForecastCalendar(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarPayload,
    });

    expect(response.status_code).toEqual(
      forecastCalendarData.createSuccessResponseCode
    );
    return response;
  }

  /**
   * This method will create a duplicate forecast calendar and assert the response.
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
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

  /**
   * This method will create a forecast calendar using invalid dim id and assert the response.
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
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

  /**
   * This method will create a forecast calendar using invalid dim val and assert the response.
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
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

  /**
   * This method will create a forecast calendar using invalid year and assert the response.
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
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

  /**
   * This method will get the forecast cycle and assert the response.
   *
   * @param {Request} request - the request object
   * @param {string} fcst_id - the forecast calendar id
   * @param {boolean} validate - whether to validate the response
   * @returns {Promise<object>} - the response body
   */
  static async getForecastCalendar(request, fcst_id, validate = true) {
    Utility.logIt(fcst_id);
    const params = new URLSearchParams({
      dim_id: forecastCalendarData.getForecastCalendarPayload.dim_id,
      dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
      classification_id:
        forecastCalendarData.getForecastCalendarPayload.classification_id,
      fiscal_year: forecastCalendarData.getForecastCalendarPayload.fiscal_year,
    });
    const endpointURL = `${process.env.apiBaseURLUFM}${
      forecastCalendarData.endpoint
    }?${params.toString()}`;
  console.log("Endpoint URL:", endpointURL);
    const response = await request.get(endpointURL, { params: null });

    let responseBody = await Utility.assertAndLog(response);

    if (validate == true) {
      expect(responseBody.calendar_id).toEqual(fcst_id);
    }
    return responseBody;
  }

  /**
   * This method will delete all existing cycles.
   *
   * @param {Request} request - the request object
   * @returns {Promise<void>}
   */
  static async deleteAllForecastCycles(request) {
    Utility.logIt(
      "Deleting all acctive forecast cycles for the year " +
        forecastCalendarData.getForecastCalendarPayload.fiscal_year
    );

    let responseBody = await ForecastCalendarUtil.getForecastCalendar(
      request,
      "",
      false
    );

    for (let i = 0; i < responseBody.submission_cycles.length; i++) {
      await ForecastCalendarUtil.deleteForecastCalendarCycle(
        responseBody.calendar_id,
        responseBody.submission_cycles[i].cycle_id,
        request
      );

      console.log("Cycle deleted ", responseBody.submission_cycles[i].cycle_id);
    }
  }

  /**
   * This method will get a nonexistent forecast cycle and assert the response.
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async getInvalidForecastCalendar(request) {
    const params = new URLSearchParams({
      dim_id: forecastCalendarData.getForecastCalendarPayload.invalid_dim_id,
      dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
      classification_id:
        forecastCalendarData.getForecastCalendarPayload.classification_id,
      fiscal_year: forecastCalendarData.getForecastCalendarPayload.fiscal_year,
    });
    const endpointURL = `${process.env.apiBaseURLUFM}${
      forecastCalendarData.endpoint
    }?${params.toString()}`;
    const response = await request.get(endpointURL, { params: null });
    expect(response.status === 403);
    let responseBody = await response.json();
    Utility.logIt(responseBody);
    expect(responseBody.message).toEqual(
      forecastCalendarData.getCalendarErrorDoesNotExist
    );
  }

  /**
   * This method will create the forecast calendar cycle and assert the response.
   *
   * @param {string} fcst_id - the forecast calendar id
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async createForecastCalendarCycles(fcst_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}/cycles`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarCyclesPayload,
    });

    let responseBody = await Utility.assertAndLog(response);
    expect(responseBody.cycle_id).not.toEqual(null);
    return responseBody;
  }

  /**
   * This method will edit the forecast calendar cycle with no change and assert the response.
   *
   * @param {string} fcst_id - the forecast calendar id
   * @param {string} cycle_id - the cycle id
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
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

  /**
   * This method will edit the forecast calendar cycle and assert the response.
   *
   * @param {string} fcst_id - the forecast calendar id
   * @param {string} cycle_id - the cycle id
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
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

  /**
   * Creates a duplicate forecast calendar cycle and asserts the response.
   *
   * @param {string} fcst_id - The ID of the forecast calendar.
   * @param {Request} request - The request object.
   * @returns {Promise<object>} - The response body.
   */
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

  /**
   * Publishes a forecast calendar.
   *
   * @param {string} fcst_id - The ID of the forecast calendar.
   * @param {Request} request - The request object.
   * @returns {Promise<string>} The ID of the published forecast calendar.
   */
  static async publishForecastCalendar(fcst_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}`;
    const payload = {
      published_flag: true,
    };
    const response = await request.patch(endpointURL, { data: payload });
    let responseBody = await Utility.assertAndLog(response);
    expect(responseBody.calendar_id).not.toEqual(null);

    return responseBody.calendar_id;
  }

  /**
   * Publishes a duplicate forecast calendar.
   *
   * @param {string} fcst_id - The ID of the forecast calendar.
   * @param {object} request - The request object.
   * @return {Promise<string>} The error message.
   */
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
    return responseBody.message;
  }

  /**
   * Retrieves the forecast deadlines using the provided request.
   *
   * @param {Request} request - The request object.
   * @return {Promise<object>} The response body containing the forecast deadlines.
   */
  static async getForecastDeadlines(request) {
    const params = new URLSearchParams({
      dim_id: forecastCalendarData.getForecastCalendarPayload.dim_id,
      dim_val_id: forecastCalendarData.getForecastCalendarPayload.dim_val_id,
      classification_id:
        forecastCalendarData.getForecastCalendarPayload.classification_id,
      children: "true",
      published: "true",
    });

    // // const endpointURL = `${process.env.apiBaseURLUFM}${
    // //   forecastCalendarData.endpoint
    // // }deadlines?${params.toString()}`;

     const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}deadlines?dim_id=${forecastCalendarData.getForecastCalendarPayload.dim_id}&dim_val_id=130001&classification_id=12&children=${true}&published=${true}`;

     console.log("url is" +endpointURL);
     console.log(endpointURL, params);
    const response = await request.get(endpointURL);
    let responseBody = await response.json();
    expect(responseBody.calendar_id).not.toEqual(null);

    return responseBody;
  }

  /**
   * Deletes a forecast calendar cycle.
   *
   * @param {string} fcst_id - The forecast calendar ID.
   * @param {string} cycle_id - The cycle ID.
   * @param {Request} request - The request object.
   * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  static async deleteForecastCalendarCycle(fcst_id, cycle_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}${fcst_id}/cycles/${cycle_id}`;
    console.log("Deleting forecast cycle :" + cycle_id);
    const response = await request.delete(endpointURL);
    expect(response).toBeOK();
  }

  /**
   * Deletes a missing forecast calendar cycle.
   *
   * @param {string} fcst_id - The forecast calendar ID.
   * @param {string} cycle_id - The cycle ID.
   * @param {Request} request - The request object.
   * @return {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  static async deleteMissingForecastCalendarCycle(fcst_id, cycle_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}${fcst_id}/cycles/${cycle_id}`;
    const response = await request.delete(endpointURL);
    expect(response === 404);
  }
}
