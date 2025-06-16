import debug from "debug";
import fs from "fs";
import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import filterData from "../testdata/filter-service.json";
import getKpiData from "../testdata/getKpi.json";
import inputNodes from "../testdata/inputnodes.json";
import endpoints from "../testdata/statusendpoints.json";
import { ForecastUtility } from "./forecast-utils";
import { SOTUtility } from "./SOTUtility";
import mappingData from "../constants/mapping.json"

export class UfmUtility {
  private static readonly mappingfilepath: string =
    "./tests/ufm-be/constants/mapping.json";
  /**
   * This method will get all the current forecast for BA and assert the response
   *
   * @param {string} lobName - the name of the line of business
   * @param {Request} request - the request object
   * @returns {Promise<Array<object>>} - the current forecast list
   */
  static async getCurrentForecastList(lobName, request) {
    //Making the get call to create forecast
    Utility.logIt(`Getting current forecast list for lob : ${lobName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.get_report_endpoint}`;
    Utility.logIt(endpointURL);
    const response = await request.post(endpointURL, {
      data: {
        unit: "Millions",
        dim_id: commonData.ba_dim_id,
        dim_val_id: await UfmUtility.getMapping(lobName, "parent_id"),
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

  /**
   * This method will create filter
   *
   * @param {object} payload - the payload for creating the filter
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async createFilter(payload, request) {
    //Making the get call to create filter
    const endpointURL = `${process.env.apiBaseURLUFM}${filterData.endpoint}`;
    Utility.logIt(endpointURL);

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

  /**
   * This method will fetch historical forecast based on the particular forecast name
   *
   * @param {string} forecastname - the name of the forecast
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  // static async GetHistorical(forecastname: string, request) {
  //   let responseData, responseBody;

  //   const historicalEndpointURL = `${process.env.apiBaseURLUFM}${hisTestdatafile.endpoint}`;
  //   const body = hisTestdatafile.sba_datas.filter(
  //     (forecast) => forecast.forecastname === forecastname
  //   );

  //   responseData = await request.get(historicalEndpointURL, {
  //     params: {
  //       ...body["queryParams"],
  //     },
  //   });
  //   responseBody = await responseData.json();
  //   return responseBody;
  // }

  /**
   * This method will list the progress tracker and give you status of LOB or BA based on which screen is passed in argument
   * Technically screen is BA screen or Segment finance screen
   *
   * @param {string} screen - the screen to get the progress tracker for
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async getProgresstracker(screen, request) {
    let template_id, dim_id, dim_val_id;
    Utility.logIt(`Getting progress tracker for screen : ${screen}`);
    if (screen == "Segment_Finance") {
      template_id = commonData.Segment_Finance.template_id;
      dim_id = commonData.Segment_Finance.dim_id;
      dim_val_id = commonData.Segment_Finance.dim_val_id;
    } else {
      template_id = commonData.ba_template_id;
      dim_id = commonData.ba_dim_id;
      dim_val_id = await UfmUtility.getMapping(screen, "dim_val_id", "PBA");
    }
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.get_report_endpoint}`;
    const response = await request.post(endpointURL, {
      data: {
        dim_id: dim_id,
        dim_val_id: dim_val_id,
        template_id: template_id,
        classification_id: commonData.classification_id,
      },
    });

    return await Utility.assertAndLog(response);
  }

  /**
   * This method will give details of BA from canned report screen
   *
   * @param {string} orgName - the name of the organization
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async getIndividualstatus(orgName, request , ba_type = "PBA") {
    Utility.logIt(`Getting Individual status for org : ${orgName}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.individual_status_endpoint}`;
    let payload = {
        dim_id: commonData.ba_dim_id,
        dim_val_id: await UfmUtility.getMapping(orgName, "dim_val_id", ba_type),
        classification_id: commonData.classification_id,
      }
    if(orgName == "WMT_US_SEGMENT_FINANCE"){
      payload.dim_id = commonData.Segment_Finance.dim_id
    }
    const response = await request.post(endpointURL, {
      data: payload,
    });

    return await Utility.assertAndLog(response);
  }

  /**
   * This method will give you the scenario details if you pass the scenario id and current forecast list
   *
   * @param {Array<object>} forecast_list - the list of forecasts
   * @param {number} scenario_id - the id of the scenario
   * @returns {Promise<number>} - the scenario version
   */
  static async getScenarioDetails(forecast_list, scenario_id) {
    let scenarioDetails;
    Utility.logIt(`Getting Scenario version`);
    forecast_list.filter(function (i) {
      if (i["scenarioId"] == scenario_id) {
        scenarioDetails = i;
        return;
      }
    });
    return scenarioDetails;
  }

  /**
   * This method will give you the last locked scenario
   *
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async getLastLockedScenario(request) {
    Utility.logIt(`Getting last locked scenario`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.last_locked_scenario_endpoint}`;
    const response = await request.get(endpointURL, { params: null });

    let responseBody = await Utility.assertAndLog(response);

    return responseBody;
  }

  /**
   * This method will send LOB to BA review and BA to Segment review based on scenario id, dim val id and status passed
   *
   * @param {number} scenario_id - the id of the scenario
   * @param {number} scenario_version - the version of the scenario
   * @param {string} status - the status to send the scenario to
   * @param {number} dim_id - the id of the dimension
   * @param {number} dim_val_id - the id of the dimension value
   * @param {Request} request - the request object
   * @returns {Promise<object>} - the response body
   */
  static async changeToStatus(
    scenario_id,
    scenario_version,
    status,
    dim_id,
    dim_val_id,
    request
  ) {
    Utility.logIt(`Sending scenario id : ${scenario_id} to status : ${status}`);
    const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.review_endpoint}`;
    Utility.logIt(endpointURL);

    const queryParams = {
      scenario_id: scenario_id,
      scenario_version: scenario_version,
      status: status,
    };
    let response;
    await expect(async () => {
      response = await request.put(endpointURL, {
        params: queryParams,
        data: {
          dim_id: dim_id,
          dim_val_id: dim_val_id,
        },
      });
      expect(response.status()).toBe(200);
    }).toPass({ intervals: [30_000, 30_000], timeout: 480_000 });

    let responseBody = await Utility.assertAndLog(response);
    await expect(responseBody).toEqual(endpoints.sendToReviewSuccessful);
  }

  /**
   * Retrieves the list of input nodes for a given line of business.
   *
   * @param {string} lobName - The name of the line of business.
   * @param {Request} request - The request object.
   * @returns {Promise<string[]>} - A promise that resolves to an array of input node names.
   */
  static async getDriverList(lobName, driverType, request, nexusTokens = "") {
    const endpointURL = `${process.env.apiBaseURLUFM}${inputNodes.endpoint}`;
    let response;

    Utility.logIt(`Find input nodes for ${lobName} scenario`);
    inputNodes.payloads.dim_val_id = await UfmUtility.getMapping(
      lobName,
      "dim_val_id"
    );
    if (driverType == "Input")
      inputNodes.payloads.driver_type = commonData.Input_Driver_Type;
    else inputNodes.payloads.driver_type = commonData.All_Driver_Type;
    if (nexusTokens == "") {
      response = await request.post(endpointURL, {
        data: inputNodes.payloads,
      });
    } else {
      response = await request.post(endpointURL, {
        headers: {
          Authorization: nexusTokens,
        },
        data: inputNodes.payloads,
      });
    }
    // asserting the response
    await expect.soft(response).toBeOK();
    let responseBody = await response.json();

    let inputnodes = responseBody.nodes.filter((i) => i["is_editable"] == true);

    Utility.logIt(`No of input nodes for ${lobName} - ${inputnodes.length}`);
    return inputnodes;
  }

  /**
   * Retrieves the required data based on the given base data, text, and BA type.
   * text can be - childName , dim_val_id , parent_id
   *
   * @param {string} base_data - The base data to search for.
   * @param {string} text - The text to search for.
   * @param {string} [BAtype="SBA"] - The BA type to search for.
   * @return {Promise<any>} The required data.
   */
  static async getMapping(base_data, text: string, BAtype = "SBA") {
    let required_data;
    let body = JSON.parse(fs.readFileSync(this.mappingfilepath, "utf8"));

    switch (text) {
      case "childName":
        body.filter(function (i) {
          if (i["child_id"] == base_data) {
            required_data = i["child_name"];
          }
        });
        break;
      case "dim_val_id":
        body.filter(function (i) {
          if (i["child_name"] == base_data && i["child_dim_name"] == BAtype) {
            required_data = i["child_id"];
          }
        });
        break;
      case "parent_id":
        body.filter(function (i) {
          if (i["child_name"] == base_data && i["child_dim_name"] == BAtype) {
            required_data = i["parent_id"];
          }
        });
    }

    return required_data;
  }

  /**
   * Creates and sends a forecast to BA review for each line of business (LOB)
   * of a given organization.
   *
   * @param {object} request - The request object.
   * @param {string} orgName - The name of the organization.
   * @return {Promise<void>} A Promise that resolves when the function is complete.
   */
  static async createAndSendToBAReview(request, orgName) {
    let response, lobName, scenario_details, isNewCreated;
    //Getting Status of all LOB of an Org by progress tracker
    response = await UfmUtility.getProgresstracker(orgName, request);
    Utility.logIt(response.rowData.length);
    for (let j = 0; j < response.rowData.length; j++) {
      let dim_val_id = response.rowData[j].lineOfBusiness;
      lobName = await UfmUtility.getMapping(dim_val_id, "childName");
      Utility.logIt(lobName);

      //checking if status is Not started or draft , then deleting all other and creating new forecast
      if (
        response.rowData[j].forecastStatus != commonData.Segment_Review &&
        response.rowData[j].forecastStatus != commonData.BA_Review
      ) {
        if (
          (await ForecastUtility.countOfScenario(
            lobName,
            process.env.ufmUser,
            request
          )) >= commonData.MAX_SCENARIO_COUNT
        ) {
          //Deleting forecast created by logged in user
          await ForecastUtility.deleteAllforecastofUser(
            request,
            lobName,
            process.env.ufmUser
          );
        }

        [scenario_details, isNewCreated] =
          await ForecastUtility.getOrCreateForecastIfNotExists(
            lobName,
            request
          );

        //Sending created forecast to BA review
        await UfmUtility.changeToStatus(
          scenario_details["scenarioId"],
          scenario_details["scenarioVersion"],
          commonData.BA_Review,
          commonData.lob_dim_id,
          await UfmUtility.getMapping(lobName, "dim_val_id"),
          request
        );
        Utility.logIt(`Sent ${lobName} to BA Review`);
      }
    }
  }

  /**
   * Sends forcast to change request status for scenarios in the review status.
   *
   * @param {object} request - The request object.
   * @param {string} screen - The screen to get the progress tracker for.
   * @return {Promise<void>} A Promise that resolves when the function is complete.
   */
  static async changeRequest(request, screen, count) {
    let response, status, dim_id, dim_val_id;
    response = await UfmUtility.getProgresstracker(screen, request);
    if (screen == "Segment_Finance") {
      status = commonData.Segment_Review;
      dim_id = commonData.Segment_Finance.dim_id;
      dim_val_id = commonData.Segment_Finance.dim_val_id;
    } else {
      status = commonData.BA_Review;
      dim_id = commonData.ba_dim_id;
      dim_val_id = await UfmUtility.getMapping(screen, "dim_val_id", "PBA");
    }
    Utility.logIt(response.rowData.length);
    if (count != "ALL")
      response = response.rowData.filter(
        (item) =>
          item.organization ==
          UfmUtility.getMapping(screen, "dim_val_id", "PBA")
      );
    console.log(response.rowData);
    for (let i = 0; i < response.rowData.length; i++) {
      if (response.rowData[i].forecastStatus == status) {
        console.log(
          response.rowData[i].organization,
          response.rowData[i].forecastStatus
        );
        await UfmUtility.changeToStatus(
          response.rowData[i].scenarioId,
          response.rowData[i].scenarioVersion,
          commonData.Change_Requested,
          dim_id,
          dim_val_id,
          request
        );
        Utility.logIt(
          `Change request Successful for Org Id - ${response.rowData[i].organization}`
        );
      }
    }
  }
  static async filterPayload(filtersSelectedArr: any) {
    const filterParentIdMappings = [
      {
        dimId: commonData.CHANNEL,
        parentDimId: commonData["CHANNEL GROUP"], // Channel Group and Channel
      },
      {
        dimId: commonData.DEPARTMENT,
        parentDimId: commonData.SBU, // SBU and Department
      },
    ];

    const getFilteredParams = (filtersSelectedArr = []) => {
      if (filtersSelectedArr.length === 0) return [];

      const filterParams: any = [];
      const filterSelectionObj = filtersSelectedArr.map((filterObj) =>
        Object.assign({}, filterObj)
      ) as { dim_id: number; dim_val_ids: number[]; selectedIds: any[] }[];

      filterSelectionObj.sort((first, second) => second.dim_id - first.dim_id);
      filterSelectionObj.forEach((selectedFilter) => {
        const mappedRecord = filterParentIdMappings.find(
          (item) => item.dimId === selectedFilter.dim_id
        );
        if (mappedRecord) {
          const parentRecord = filterParams.find(
            (item) => item.dim_id === mappedRecord.parentDimId
          );
          if (parentRecord) {
            parentRecord.children.push({
              dim_id: selectedFilter.dim_id,
              dim_val_ids: selectedFilter.selectedIds.map((v) => v.id),
              children: [],
            });
          } else {
            filterParams.push({
              dim_id: selectedFilter.dim_id,
              dim_val_ids: selectedFilter.selectedIds.map((v) => v.id),
              children: [],
            });
          }
        } else {
          filterParams.push({
            dim_id: selectedFilter.dim_id,
            dim_val_ids: selectedFilter.selectedIds.map((v) => v.id),
            children: [],
          });
        }
      });
      // console.log("filterParams", filterParams);
      return filterParams;
    };

    return getFilteredParams(filtersSelectedArr);
  }

  static async kpiPayload(
    lobName,
    scenario_details,
    filter = [],
    monthYear,
    inputNodes
  ) {
    let input_nodes = new Map(
      inputNodes.map((node) => [node.node_name, node.node_var_name])
    );

    const nodes: any = Array.from(input_nodes.values());

    getKpiData.payloads.scenario_id = scenario_details["scenarioId"];
    getKpiData.payloads.scenario_version = scenario_details["scenarioVersion"];

    getKpiData.payloads.dim_val_id = await UfmUtility.getMapping(
      lobName,
      "dim_val_id"
    );
    getKpiData.payloads.additional_filters.template_include_headers[1] =
      await SOTUtility.templateIncludeHeaders(monthYear);
    getKpiData.payloads.additional_filters.month = monthYear;

    getKpiData.payloads.additional_filters.nodes = nodes;
    getKpiData.payloads.filters = filter;
    return getKpiData.payloads;
  }

  static async getMappingValue(
      searchCriteria: Record<string, any>,
      returnKey: string
    ) {
      const found = mappingData.find((item: any) =>
        Object.entries(searchCriteria).every(
          ([key, value]) => item[key] === value
        )
      );
      return found ? found[returnKey] : undefined;
    }

    /**
 * Compares calculated and API node values for all months and nodes.
 * @param comparisonObj - { [month: string]: { calculatedNodes: Record<string, number>, apiNodeValues: Record<string, number> } }
 * @param tolerance - Allowed difference between forecasts.
 * @throws Error if any node/month pair mismatches beyond tolerance.
 */
static async compareNodeValuesByMonth(
  comparisonObj: Record<string, { calculatedNodes: Record<string, number>, apiNodeValues: Record<string, number> }>,
  tolerance: number = 0.5
) {
  const mismatches: string[] = [];
  for (const monthKey in comparisonObj) {
    const { calculatedNodes, apiNodeValues } = comparisonObj[monthKey];
    for (const node in calculatedNodes) {
      if (apiNodeValues[node] !== undefined) {
        const diff = Math.abs(calculatedNodes[node] - apiNodeValues[node]);
        if (diff > tolerance) {
          mismatches.push(
            `Mismatch for ${node} (${monthKey}): calculated=${calculatedNodes[node]}, api=${apiNodeValues[node]}, diff=${diff}`
          );
        }
      }
    }
  }

  // Use Playwright's expect for assertion
  expect(mismatches, mismatches.join('\n')).toHaveLength(0);

}
}
