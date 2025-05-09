import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import nodeGranularities from "../testdata/nodegranularity.json";
import nodePermission from "../testdata/nodepermission.json";
import nodeMetaData from "../testdata/nodemetadata.json";
import commonData from "../constants/common.json";

export class NodeUtility {
  // Static headers used for API requests


  /**
   * Fetches node details for granularities, permissions, or metadata based on the type.
   *
   * @param {number} driver_tree_key - The key of the driver tree.
   * @param {number} driver_tree_version - The version of the driver tree.
   * @param {number} node_key - The ID of the node.
   * @param {number} node_variant_key - The ID of the node variant.
   * @param {object} request - The request object for making API calls.
   * @param {string} type - The type of request ("granularity", "permission", "metadata").
   * @param {boolean} [isError=false] - Indicates whether the response is expected to be an error.
   * @returns {Promise<object>} - The response body or the response object.
   */
  static async getNodeDetails(
    driver_tree_key: number,
    driver_tree_version: number,
    node_key: number,
    node_variant_key: number,
    request: any,
    type: string,
    isError: boolean = false
  ): Promise<object> {
    // Determine the endpoint configuration based on the type
    let endpointConfig, parameter;
    switch (type) {
      case "Granularity":
        endpointConfig = nodeGranularities;
        break;
      case "Permissions":
        endpointConfig = nodePermission;
        break;
      case "Metadata":
        endpointConfig = nodeMetaData;
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    // Construct the endpoint URL by replacing placeholders with actual values
    const endpointURL = await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig);

    // Log the details of the request being made
    Utility.logIt(
      `Getting Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
    );

    // Make the GET request to the endpoint
    const response = await request.get(endpointURL);

    // Assert and log the response
    const responseBody = await Utility.assertAndLog(response, isError);

    if (isError) {
      // Validate error response
      await expect.soft(response.status()).toEqual(404);
      await expect.soft(responseBody).toEqual(
        JSON.parse(
          `{"detail": "${type} not found for nodeVariantKey ${node_variant_key} nodeKey ${node_key}"}`
        )
      );
    }

    // Return the response body
    return responseBody;
  }

  /**
   * Creates or updates node granularities, permissions, or metadata based on the type.
   *
   * @param {number} driver_tree_key - The key of the driver tree.
   * @param {number} driver_tree_version - The version of the driver tree.
   * @param {number} node_key - The ID of the node.
   * @param {number} node_variant_key - The ID of the node variant.
   * @param {object} request - The request object for making API calls.
   * @param {string} type - The type of request ("granularity", "permission", "metadata").
   * @param {boolean} [isError=false] - Indicates whether the response is expected to be an error.
   * @param {boolean} [isUpdate=false] - Indicates whether the request is for an update.
   * @returns {Promise<object>} - The response body or the response object.
   */
  static async createNodeDetails(
    driver_tree_key: number,
    driver_tree_version: number,
    node_key: number,
    node_variant_key: number,
    request: any,
    type: string,
    isError: boolean = false,
    isUpdate: boolean = false
  ): Promise<object> {
    let endpointConfig, requestData, response, endpointURL;

    switch (type) {
      case "Granularity":
        // Handle granularity-specific logic
        endpointConfig = nodeGranularities;
        let dimValId = endpointConfig.dim_val_id;
        requestData = endpointConfig.requestBody;
        endpointURL = await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig);
          Utility.logIt(
          `Creating Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
        );
        response = await request.post(endpointURL, {data: requestData,});
        if (!isError) {
          let responseBody = await Utility.assertAndLog(response);
          await expect.soft(typeof responseBody[0].variantGranularityId).toBe(
            "number"
          );
          await expect.soft(responseBody[0].dimValId).toEqual(
            parseInt(dimValId, 10)
          );
        } else {
          await expect.soft(response.status()).toEqual(500);
        }
        break;

      case "Permissions":
        // Handle permissions-specific logic
        endpointConfig = nodePermission;
        let lobId = endpointConfig.lob_id,
          permissionType = endpointConfig.permission_type;
        requestData = endpointConfig.requestBody;
        endpointURL = await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig);
        Utility.logIt(
          `Creating Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
        );
        response = await request.post(endpointURL, {
          data: requestData,
        });
        if (!isError) {
          let responseBody = await Utility.assertAndLog(response);
          await expect.soft(typeof responseBody[0].nodePermissionId).toBe(
            "number"
          );
          await expect.soft(responseBody[0].lobId).toEqual(
            parseInt(lobId, 10)
          );
          await expect.soft(responseBody[0].permissionType).toEqual(
            permissionType
          );
          await expect.soft(responseBody[0].nodeVariantKey).toEqual(
            node_variant_key
          );
        } else {
          await expect.soft(response.status()).toEqual(500);
        }
        break;

      case "Metadata":
        // Handle metadata-specific logic
        endpointConfig = nodeMetaData;
        let nodeName = endpointConfig.nodeNm,
          aggrText = endpointConfig.aggrText,
          calcText = endpointConfig.calcText;
        if (isUpdate)
          nodeName = nodeName + "Updated",
            aggrText = aggrText + "Updated",
            calcText = calcText + "Updated";
        requestData = endpointConfig.requestbody
          .replace("{nodeName}", String(nodeName))
          .replace("{calcText}", String(calcText))
          .replace("{aggrText}", String(aggrText));
        endpointURL = await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig);
        Utility.logIt(
          `Creating Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
        );
        response = await request.post(endpointURL, {
          data: requestData,
        });
        if (!isError) {
          let responseBody = await Utility.assertAndLog(response);
          await expect.soft(responseBody[0].nodeNm).toEqual(nodeName);
          await expect.soft(responseBody[0].calcText).toEqual(calcText);
          await expect.soft(responseBody[0].aggrText).toEqual(aggrText);
          return responseBody[0].nodeVariantKey;
        } else {
          await expect.soft(response.status()).toEqual(500);
        }
        break;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }
    return response;
  }

  private static async getFinalEndPoint(
    driver_tree_key: number,
    driver_tree_version: number,
    node_key: number,
    node_variant_key: number,
    end_point_config: any){
  
      let endpoint= `${process.env.apiBaseURLSSDM}${end_point_config.endPoint}`
      .replace("{driverTreeKey}", String(driver_tree_key))
      .replace("{driverTreeVersion}", String(driver_tree_version))
      .replace("{nodeKey}", String(node_key))
      .replace("{nodeVersion}", String(node_variant_key));
      return endpoint

    }
}