import debug from "debug";
import forecastData from "../testdata/forecast-api.json";
import scenarioIds from "../testdata/scenarioIds.json";
import forecastCalendarData from "../testdata/forecast-calendar-api.json";
import filterData from "../testdata/filter-service.json";
import hisTestdatafile from "../testdata/historical-forecast.json";
import commonData from "../testdata/common.json";
import { Utility } from "../../common/fixtures/utils";
import { expect } from "../../common/fixtures/test-hook";

export class UfmUtility {
  // This method will create a forecast calendar and assert the response
  static async createForecastCalendar(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: forecastCalendarData.createForecastCalendarPayload,
    });
    let responseBody = await Utility.assertAndLog(response);
    expect(responseBody.status_code).toEqual(
      forecastCalendarData.createSuccessResponseCode
    );
    return responseBody;
  }

  // This method will get the forecast cycle and assert the response
  static async getForecastCalendar(request, fcst_id) {
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
    const response = await request.get(endpointURL, { params: null });

    let responseBody = await Utility.assertAndLog(response);

    expect(responseBody.calendar_id).toEqual(fcst_id);
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

  // This method will publish the forecast and assert the response
  static async publishForecastCalendar(fcst_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}`;
    const payload = {
      published_flag: true,
    };
    const response = await request.patch(endpointURL, { data: payload });
    let responseBody = await Utility.assertAndLog(response);
    expect(responseBody.calendar_id).not.toEqual(null);
  }

  // This method will get the forecast deadlines and assert the response
  static async getForecastDeadlines(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/deadlines}`;
    const response = await request.patch(endpointURL);
    let responseBody = await response.json();
    expect(responseBody.calendar_id).not.toEqual(null);
  }

  // This method will delete the forecast cycle and assert the response to be ok
  static async deleteForecastCalendarCycle(fcst_id, cycle_id, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastCalendarData.endpoint}/${fcst_id}/cycles/${cycle_id}`;
    const response = await request.delete(endpointURL);
    expect(response).toBeOK();
  }

  // This method will create the forecast and assert the response
  static async createForecast(lobName, request) {
    //Making the get call to create forecast
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}`;
    debug.log(endpointURL);
    let payload = {
      type: commonData.type,
      source: {
        scenarios: [
          {
            scenario_id: scenarioIds.payloads.Primary.scenario_id,
          },
        ],
      },
      name: lobName + " Automation - ",
      classification_id: commonData.classification_id,
      dim_id: commonData.lob_dim_id,
      dim_val_id: commonData[lobName].dim_val_id,
    };

    payload.name = payload.name + new Date().toLocaleString();
    const response = await request.post(
      endpointURL,

      { data: payload }
    );
    //asserting the response
    let responseBody = await Utility.assertAndLog(response);
    expect
      .soft(responseBody.message)
      .toEqual(forecastData.createSuccessMessage);
    debug.log("Forecast is created  : ", responseBody.scenario.scenario_id);
    console.log("Forecast is created  : ", responseBody.scenario.scenario_id);

    //returning the scenario Id of the created forecast
    return responseBody.scenario.scenario_id;
  }

  // This method will get all the current forecast for BA and assert the response
  static async getCurrentForecastList(lobName, request) {
    //Making the get call to create forecast
    const endpointURL = `${process.env.apiBaseURLUFM}${commonData.endpoint}`;
    debug.log(endpointURL);
    const response = await request.post(endpointURL, {
      data: {
        unit: "Millions",
        dim_id: commonData.ba_dim_id,
        dim_val_id: commonData[lobName].org_dim_val_id,
        classification_id: commonData.classification_id,
        template_id: 1,
        filters: [],
        additional_filters: {
          template_include_headers: [
            {
              name: "vs LY",
              format: "percent",
            },
            {
              name: "vs Plan",
              format: "absolute",
            },
          ],
        },
      },
    });

    //asserting the response
    let responseBody = await Utility.assertAndLog(response);

    //returning the current forecast list
    return responseBody.rowData;
  }

  //This method will create filter
  static async createFilter(payload, request) {
    //Making the get call to create filter
    const endpointURL = `${process.env.apiBaseURLUFM}${filterData.endpoint}`;
    debug.log(endpointURL);

    const response = await request.post(endpointURL, {
      data: payload,
    });

    let responseBody = await response.json();
    if (response.status === 200) {
      expect(responseBody.message).toEqual(filterData.success_message);
    } else if (
      response.status === filterData.duplicate_filter_name_response.status_code
    ) {
      expect(responseBody.message).toEqual(
        filterData.duplicate_filter_name_response.message
      );
    }

    debug.log(JSON.stringify(responseBody));
    return responseBody;
  }

  // This method will delete the forecast
  static async deleteForecast(
    scenario_id,
    scenario_version,
    dimId,
    dimValId,
    request
  ) {
    const param = scenario_id + "/" + scenario_version;
    const endpointURL = `${process.env.apiBaseURLUFM}${forecastData.endpoint}${param}`;
    const payload = {
      dim_id: dimId,
      dim_val_id: dimValId,
    };
    const response = await request.delete(endpointURL, { data: payload });
    let forecastDeleted = await Utility.assertAndLog(response);
    debug.log("Forecast is deleted  : ", forecastDeleted);
    console.log("Forecast is deleted  : ", forecastDeleted);
    return forecastDeleted;
  }

  //This method will fetch historical forecast based on the particular forecast name
  static async GetHistorical(forecastname: string, request) {
    let responseData, responseBody;

    const historicalEndpointURL = `${process.env.apiBaseURLUFM}${hisTestdatafile.endpoint}`;
    const body = hisTestdatafile.sba_datas.filter(
      (forecast) => forecast.forecastname === forecastname
    );

    responseData = await request.get(historicalEndpointURL, {
      params: {
        ...body["queryParams"],
      },
    });
    responseBody = await responseData.json();
    return responseBody;
  }

  //This method will list the progress tracker and give you status of LOB or BA based on which screen is passed in argument
  //Technically screen is BA screen or Segment finance screen
  static async getProgresstracker(screen, request) {
    let template_id, dim_id;
    if (screen == "Segment_Finance") {
      template_id = commonData.Segment_Finance.template_id;
      dim_id = commonData.Segment_Finance.dim_id;
    } else {
      template_id = commonData.ba_template_id;
      dim_id = commonData.ba_dim_id;
    }
    const endpointURL = `${process.env.apiBaseURLUFM}${commonData.endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: dim_id,
        dim_val_id: commonData[screen].dim_val_id,
        template_id: template_id,
        classification_id: commonData.classification_id,
      },
    });

    return await Utility.assertAndLog(response);
  }

  //This method will give details of BA from canned report screen
  static async getIndividualstatus(orgName, request) {
    const endpointURL = `${process.env.apiBaseURLUFM}${commonData.individual_status_endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: commonData.ba_dim_id,
        dim_val_id: commonData[orgName].dim_val_id,
        classification_id: commonData.classification_id,
      },
    });

    return await Utility.assertAndLog(response);
  }

  //This method will give you the scenario version if you pass the scenario id and current forecast list
  static async getScenarioVersion(forecast_list, scenario_id) {
    let scenario_version;
    for (let i = 0; i < forecast_list.length; i++) {
      console.log(forecast_list[i]);
      if (forecast_list[i].scenarioId == scenario_id) {
        console.log(`Scenario Version: ${forecast_list[i].scenarioVersion}`);
        scenario_version = forecast_list[i].scenarioVersion;
        break;
      }
    }
    return scenario_version;
  }

  //This method will send LOB to BA review and BA to Segment review based on scenario id , dim val id and status paased
  static async sendToReview(
    scenario_id,
    scenario_version,
    status,
    dim_id,
    dim_val_id,
    request
  ) {
    const endpointURL = `${process.env.apiBaseURLUFM}${commonData.review_endpoint}`;
    debug.log(endpointURL);

    const queryParams = {
      scenario_id: scenario_id,
      scenario_version: scenario_version,
      status: status,
    };
    const response = await request.post(endpointURL, {
      params: queryParams,
      data: {
        dim_id: dim_id,
        dim_val_id: dim_val_id,
      },
    });
    expect(response).toBeOK();
    expect(response).toEqual(commonData.sendToReviewSuccessful);
    //asserting the response
    await Utility.assertAndLog(response);
  }
}
