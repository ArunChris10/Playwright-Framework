import fs from "fs";
import * as XLSX from "xlsx";
import { expect } from "../../common/fixtures/test-hook";
import commonData from "../constants/common.json";
import getKpiData from "../testdata/getKpi.json";
import inputNodes from "../testdata/inputnodes.json";
import { UfmUtility } from "./ufm-utils";
import { Utility } from "../../common/fixtures/utils";

export class SOTUtility {
  /**
   * Retrieves KPI payloads based on the given parameters.
   *
   * @param {string} lobName - The name of the line of business.
   * @param {object} scenario_details - The details of the scenario.
   * @param {string} node - The node to retrieve.
   * @param {string} monthYear - The month and year.
   * @param {object} filter - The filter to apply.
   * @param {array} driverList - The list of drivers.
   * @param {object} request - The request object.
   * @return {Promise<object>} A Promise that resolves to the KPI payloads.
   */
  static async getKpiPayloads(
    lobName,
    scenario_details,
    node,
    monthYear,
    filter,
    driverList,
    request
  ) {
    let nodes = await this.getNodevarNamefromID(node, driverList);

    const endpointURL = `${process.env.apiBaseURLUFM}${getKpiData.endpoint}`;

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

    if (nodes.length == 0) {
      return [];
    } else {
      let response2 = await request.post(endpointURL, {
        data: getKpiData.payloads,
      });
      return response2.json();
    }
  }

  /**
   * Retrieves the node variable names from the given node ID list.
   *
   * @param {Array<string>} node_idList - The list of node IDs.
   * @param {Object} driversList - The list of drivers.
   * @return {Promise<Array<string>>} The list of node variable names.
   */
  static async getNodevarNamefromID(node_idList, driversList) {
    const nodes: string[] = [];
    for (const nodeID of node_idList) {
      const node = driversList.nodes.find((item) => item.node_id === nodeID);
      if (node) {
        if (
          Number.isInteger(
            Number(node.node_var_name.charAt(node.node_var_name.length - 1))
          )
        ) {
          node.node_var_name = node.node_var_name.substring(
            0,
            node.node_var_name.length - 1
          );
        } else if (node.node_var_name.lastIndexOf("_") !== -1) {
          node.node_var_name = node.node_var_name.substring(
            0,
            node.node_var_name.lastIndexOf("_")
          );
        }
        nodes.push(node.node_var_name);
      }
    }
    return nodes;
  }

  /**
   * Retrieves the drivers for a given line of business.
   *
   * @param {string} lobName - The name of the line of business.
   * @param {number} type - The type of the driver.
   * @param {APIRequestContext} request - The request object.
   * @return {Promise<object>} - A promise that resolves to the JSON response.
   */
  static async getDrivers(lobName, type, request) {
    const inendpointURL = `${process.env.apiBaseURLUFM}${inputNodes.endpoint}`;

    inputNodes.payloads.dim_val_id = await UfmUtility.getMapping(
      lobName,
      "dim_val_id"
    );
    inputNodes.payloads.driver_type = type;

    let web_response = await request.post(inendpointURL, {
      data: inputNodes.payloads,
    });

    // asserting the response
    await expect.soft(web_response).toBeOK();
    return await web_response.json();
  }

  /**
   * Creates a report in HTML format with the provided table data and saves it to a file.
   *
   * @param {string} tableData - The HTML content of the table.
   * @param {string} lobName - The name of the line of business.
   * @return {void}
   */
  static async createReport(tableData, lobName) {
    let filepath = `./tests/ufm-be/validation-files/${lobName}_sotValidation_report.html`;

    // Create the table
    let table = `<table border="1" style="border-collapse: collapse;">`;
    table += `<tr><th style="padding: 8px;">NODE ID</th><th style="padding: 8px;">NODE NAME</th><th style="padding: 8px;">SOT VALUES</th><th style="padding: 8px;">IBG VALUES</th><th style="padding: 8px;">VARIANCE</th></tr>`;

    table += tableData;
    table += "</table>";

    // Create the HTML document
    const reportHTML = `
          <html>
          <head>
              <title>SOT Validation Report</title>
          </head>
          <body>
              <h1>SOT Validation Report for LOB - ${lobName}</h1>
              ${table}
          </body>
          </html>
      `;

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
    fs.writeFileSync(filepath, reportHTML);

    // Create a new Blob with the HTML content
    // const blob = new Blob([html], { type: "text/html" });

    // // Create a URL for the Blob
    // const url = URL.createObjectURL(blob);

    // // Create a link to download the HTML report
    // const link = document.createElement("a");
    // link.href = url;
    // link.download = "filter-payload-report.html";
    // link.click();
  }

  /**
   * Creates a payload object with the given dimension ID, filter name, and selected IDs.
   *
   * @param {number} dim_id - The dimension ID.
   * @param {string} filterName - The name of the filter.
   * @param {Array<{id: number, name: string}>} selectedIds - An array of objects containing the ID and name of the selected IDs.
   * @return {Object} The payload object with the specified properties.
   */
  static async createPayload(dim_id, filterName, selectedIds) {
    return {
      dim_id: dim_id,
      filterName: filterName,
      selectedIds: selectedIds.map(({ id, name }) => ({ id, name })),
    };
  }

  /**
   * Retrieves the month and year from a given key.
   *
   * @param {Array} keysfromSot - An array of keys to search for the desired key.
   * @return {Array} An array containing the found key and the corresponding month and year.
   */
  static async getMonthYearfromKey(keysfromSot) {
    let yearMonthKeys: any = [];
    let yearMonths: any = [];
    let yearMonth;

    for (const key of keysfromSot) {
      const yearMonthKey = Object.keys(key).filter((key) =>
        /FY\d{2} M\d{1,2}/.test(key)
      );
      yearMonthKeys = new Set([...yearMonthKeys, ...yearMonthKey]);
    }
    const uniqueYearMonthKeys: any = Array.from(yearMonthKeys);

    for (let i = 0; i < uniqueYearMonthKeys.length; i++) {
      const year = parseInt(
        uniqueYearMonthKeys[i].match(/FY(\d{2})/)?.[1] ?? ""
      );
      const month = parseInt(
        uniqueYearMonthKeys[i].match(/M(\d{1,2})/)?.[1] ?? ""
      );
      yearMonth = (year + 2000) * 100 + month;
      yearMonths.push(yearMonth);
    }
    return [uniqueYearMonthKeys, yearMonths];
  }

  /**
   * Retrieves the selection IDs based on the given dimension array, dimension name, and mapping response.
   *
   * @param {Array} dimensionArray - The array of dimensions.
   * @param {string} dimensionName - The name of the dimension.
   * @param {Array} mappingResponse - The response from the mapping.
   * @return {Promise<number|Object>} The payload containing the selection IDs or 0 if no childArray is found.
   */
  static async getSelectionIds(dimensionArray, dimensionName, mappingResponse) {
    let getiDName: any = [];
    let childArray: any = new Map();
    let dimensionError: any = [];
    let dimFilter;
    let errorFilter = "";
    for (let j = 0; j < dimensionArray.length; j++) {
      dimFilter = await mappingResponse.filter(
        (i) =>
          i["child_name"] == dimensionArray[j].toUpperCase().trim() &&
          i["child_dim_id"] == commonData[dimensionName.toUpperCase()]
      )[0];
      if (dimFilter != undefined) {
        getiDName.push(dimFilter);
      } else {
        errorFilter = errorFilter + dimensionArray[j] + ", ";
        console.log(
          `Mapping not found for dimensions - , ${dimensionName} - ${dimensionArray[j]} `
        );
      }
    }
    if (errorFilter != "") {
      errorFilter.substring(0, errorFilter.lastIndexOf(","));
      dimensionError.push(
        `Error in Mapping for - ${dimensionName} - ${errorFilter}`
      );
    }
    try {
      childArray = getiDName.map((child) => ({
        id: child.child_id,
        name: child.child_name,
      }));
    } catch (error) {
      dimensionError.push(
        `Error in Mapping for - ${dimensionName} - ${errorFilter}`
      );
    }
    if (childArray.length != 0) {
      return this.createPayload(
        commonData[dimensionName.toUpperCase()],
        dimensionName,
        childArray
      );
    }
    return dimensionError.length == 0 ? 0 : dimensionError;
  }
  /**
   * Processes a dimension from the given SOT data and adds the corresponding selection IDs to the final payload.
   *
   * @param {any} sotData - The SOT data containing the dimension information.
   * @param {any[]} finalPayload - The array to which the selection IDs will be added.
   * @param {string} dimension - The name of the dimension.
   * @param {JSON} mappingResponse - The mapping response containing the selection IDs.
   * @return {Promise<void>} A promise that resolves when the processing is complete.
   */
  static async processDimension(
    sotData: any,
    finalPayload: any[],
    dimension: string,
    mappingResponse: JSON
  ) {
    if (
      Object.keys(sotData).includes(dimension) &&
      sotData[dimension] != "All" &&
      sotData[dimension] != "*"
    ) {
      const dimensionfromExcel = sotData[dimension].split(",");

      const payload = await this.getSelectionIds(
        dimensionfromExcel,
        dimension,
        mappingResponse
      );
      if (payload != 0) finalPayload.push(payload);
    }
  }

  /**
   * Converts a JSON object to an Excel file.
   *
   * @param {object} data - The JSON object to be converted.
   * @param {string} filename - The name of the output Excel file.
   * @return {Promise<void>} A promise that resolves when the conversion is complete.
   */
  static async jsonToExcel(data, filename) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Generates an array of objects with the name property set to each month in the monthData array and the columnsMenuParams property set to "middleColumns".
   *
   * @param {Array<string>} monthData - An array of strings representing the months.
   * @return {Array<{name: string, columnsMenuParams: string}>} An array of objects with the name and columnsMenuParams properties.
   */
  static async templateIncludeHeaders(monthData) {
    const templateIncludeHeaders = monthData.map((month) => ({
      name: month,
      columnsMenuParams: "middleColumns",
    }));
    return templateIncludeHeaders;
  }
}

interface Line {
  Channel: string;
  SBU: string;
  Department: string;
  Entity: string;
  Location: string;
}

export class Dimensioncombination {
  /**
   * Returns the value if it is defined, otherwise returns the default value.
   *
   * @param {string} value - The value to check.
   * @param {any} defaultValue - The default value to return if the value is undefined.
   * @return {Promise<any>} The value or the default value.
   */
  static async getValueOrDefault(
    value: string,
    defaultValue: any
  ): Promise<any> {
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Generates a combination of lines based on the given JSON.
   *
   * @param {Array<Line>} sotJson - The JSON containing the lines.
   * @return {Promise<{ [key: string]: Line[] }>} - The cleaned data with the combination of lines.
   */
  static async getCombination(sotJson) {
    const data: Line[] = sotJson;

    const cleanedData: { [key: string]: Line[] } = {};

    for (const line of data) {
      const key =
        (await this.getValueOrDefault(line.Channel, "")) +
        (await this.getValueOrDefault(line.SBU, "")) +
        (await this.getValueOrDefault(line.Department, "")) +
        (await this.getValueOrDefault(line.Entity, "")) +
        (await this.getValueOrDefault(line.Location, ""));
      if (key in cleanedData) {
        cleanedData[key].push(line);
      } else {
        cleanedData[key] = [line];
      }
    }
    // Utility.logIt(cleanedData);
    return cleanedData;
  }
}
