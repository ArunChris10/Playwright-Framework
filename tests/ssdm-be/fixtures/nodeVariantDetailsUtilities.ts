import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import nodeVariantsForDriverTree from "../testdata/nodevaraintsfordrivertree.json";

export class GetNodeVariantforDriverTreeUtility {
  /**
   * Fetches node variant details for a given driver tree key and version.
   *
   * @param {number} driver_tree_key - The key of the driver tree.
   * @param {number} driver_tree_version - The version of the driver tree.
   * @param {object} request - The request object for making API calls.
   * @param {boolean} isError - Indicates whether the response is expected to be an error.
   * @param {string} type - The type of request ("NodeVariantMetadata", "NodeVariantPermissions", "NodeVariantDimensions", "NodeVariantCompositeData").
   * @param {number} metadatarefreshid - Optional metadata refresh ID for filtering results.
   * @returns {Promise<object>} - The response body or the response object.
   */
  static async getNodeVariantsDetailsforDriverTreeKeyAndDriverTreeVersion(
    driver_tree_key: number,
    driver_tree_version: number,
    request: any,
    isError: boolean = false,
    type: string = "NodeVariantMetadata",
    metadatarefreshid: number = 0
  ): Promise<object> {
    let endpointURL, response, responsebody;

    switch (type) {
      case "NodeVariantMetadata":
        // Fetch metadata for node variants
        endpointURL = `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getNodeVariantsbyDriverTreeandDriverTreeversionEndPoint}`
          .replace("{driver_tree}", String(driver_tree_key))
          .replace("{driver_tree_version}", String(driver_tree_version));
        Utility.logIt(
          `Getting Node Variants data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}`
        );
        response = await request.get(endpointURL);
        if (isError) 
          await expect.soft(response.status()).toEqual(404);
        else
        responsebody = await Utility.assertAndLog(response);
        return response;

      case "NodeVariantPermissions":
        // Fetch permissions for node variants
        if (metadatarefreshid == 0) {
          endpointURL = `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getNodeVariantPermissionsByDriverTreeandDriverTreeversionEndPoint}`
            .replace("{driver_tree}", String(driver_tree_key))
            .replace("{driver_tree_version}", String(driver_tree_version));
          Utility.logIt(
            `Getting Permissions for all Node Variants for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}`
          );
        } else {
          endpointURL = `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getNodeVariantPermissionsByDriverTreeandDriverTreeversionEndPoint}`
            .replace("{driver_tree}", String(driver_tree_key))
            .replace("{driver_tree_version}", String(driver_tree_version)) +
            "?metadata_refresh_id=" +
            metadatarefreshid;
          Utility.logIt(
            `Getting Permissions for all Node Variants for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version} and metadata_refresh_id ${metadatarefreshid}`
          );
        }
        console.log(endpointURL);
        response = await request.get(endpointURL);
        if (isError) 
          await expect.soft(response.status()).toEqual(404);
        else
        responsebody = await Utility.assertAndLog(response);
        return response;

      case "NodeVariantDimensions":
        // Fetch dimensions for node variants
        if (metadatarefreshid == 0) {
          endpointURL = `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getNodeVariantDimensionsByDriverTreeandDriverTreeversionEndPoint}`
            .replace("{driver_tree}", String(driver_tree_key))
            .replace("{driver_tree_version}", String(driver_tree_version));
          Utility.logIt(
            `Getting Dimensions for all Node Variants for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}`
          );
        } else {
          endpointURL = `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getNodeVariantDimensionsByDriverTreeandDriverTreeversionEndPoint}`
            .replace("{driver_tree}", String(driver_tree_key))
            .replace("{driver_tree_version}", String(driver_tree_version)) +
            "?metadata_refresh_id=" +
            metadatarefreshid;
          Utility.logIt(
            `Getting Dimensions for all Node Variants for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version} and metadata_refresh_id ${metadatarefreshid}`
          );
        }
        console.log(endpointURL);
        response = await request.get(endpointURL);
        responsebody = await Utility.assertAndLog(response,isError);
        if (isError) await expect.soft(response.status()).toEqual(404);
        return response;

      case "NodeVariantCompositeData":
        // Fetch composite data for node variants
        if (metadatarefreshid == 0) {
          endpointURL = `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getNodeVariantCompositeDataByDriverTreeandDriverTreeversionEndPoint}`
            .replace("{driver_tree}", String(driver_tree_key))
            .replace("{driver_tree_version}", String(driver_tree_version));
          Utility.logIt(
            `Getting Composite Data for all Node Variants for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}`
          );
        } else {
          endpointURL = `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getNodeVariantCompositeDataByDriverTreeandDriverTreeversionEndPoint}`
            .replace("{driver_tree}", String(driver_tree_key))
            .replace("{driver_tree_version}", String(driver_tree_version)) +
            "?metadata_refresh_id=" +
            metadatarefreshid;
          Utility.logIt(
            `Getting Composite Data for all Node Variants for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version} and metadata_refresh_id ${metadatarefreshid}`
          );
        }
        response = await request.get(endpointURL);
        responsebody = await Utility.assertAndLog(response,isError);
        if (isError) await expect.soft(response.status()).toEqual(404);
        return response;

      default:
        // Return response for unsupported types
        return response;
    }
  }

  /**
   * Fetches driver Tree as well as Driver Tree Version.
   ** @param {number} driver_tree_key - The key of the driver tree.
   * @param {boolean} isError - Indicates whether the response is expected to be an error.
   * @param {object} request - The request object for making API calls.
   * @returns {Promise<object>} - The response body or the response object.
   */
  static async getDriverTreeandDriverTreeVersion(
    driverTreeKey: number = 0 ,
    isError : boolean= false,
    request: any,
  ): Promise<object> {
    let endpointURL, response;
    endpointURL= `${process.env.apiBaseURLSSDM}${nodeVariantsForDriverTree.getDriverTree}`;
    if(driverTreeKey==0)
    {
    console.log(endpointURL)  ;
    Utility.logIt('Getting Driver Tree');
    response = await request.get(endpointURL);
    return Utility.assertAndLog(response,false);
    }
    else{
      Utility.logIt('Getting Driver Tree Versions for key ${driverTreeKey}');
      endpointURL= endpointURL+driverTreeKey+"/versions"
      response= await request.get(endpointURL);
      
      if(isError)
      {
        expect.soft(response.status()).toEqual(404);
        return response;
      }
      else
      {
        let responseBody= Utility.assertAndLog(response);
        return responseBody;
      }
    }
    

  }
}