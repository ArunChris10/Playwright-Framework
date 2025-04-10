import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import nodeGranularities from "../testdata/nodegranularity.json";
import nodePermission from "../testdata/nodepermission.json";
import nodeMetaData from "../testdata/nodemetadata.json";

export class NodeUtility {
  /**
   * This method will handle requests for node granularities, permissions, and metadata based on the type.
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
    // Determine the endpoint based on the type
    let endpointConfig,parameter;
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
    const endpointURL = `${process.env.apiBaseURLSSDM}${endpointConfig.endPoint}`
      .replace("{driverTreeKey}", String(driver_tree_key))
      .replace("{driverTreeVersion}", String(driver_tree_version))
      .replace("{nodeKey}", String(node_key))
      .replace("{nodeVersion}", String(node_variant_key));

    // Log the details of the request being made
    Utility.logIt(
      `Getting Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
    );

    // Make the GET request to the endpoint
    const response = await request.get(endpointURL);

    // Assert and log the response
    const responseBody = await Utility.assertAndLog(response, isError);

    if(isError)
    {
      await expect.soft(response.status()).toEqual(404);
      await expect.soft(responseBody).toEqual(JSON.parse("{\"detail\": \""+type + " not found for nodeVariantKey "+node_variant_key+" nodeKey "+node_key+"\"}"));
    }

    // Return the response body
    return responseBody;
  }
}