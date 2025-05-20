import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import nodeGranularities from "../testdata/nodegranularity.json";
import nodePermission from "../testdata/nodepermission.json";
import nodeMetaData from "../testdata/nodemetadata.json";
import nodeComposite from "../testdata/nodecomposite.json";
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
    isError: boolean = false,
    typeoffailure:  string = "defaulterror"
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
      await expect.soft(response.status()).toEqual(409);
      this.assertErrorMessage(
        typeoffailure,
        responseBody.detail,
        driver_tree_key,
        driver_tree_version,
        node_key,
        node_variant_key  
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
   * @param {string} [typeOfError="default"] - The type of error expected.
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
    isUpdate: boolean = false,
    typeOfError : string= "default"
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
        let responseBody = await Utility.assertAndLog(response,isError);
        if (!isError) {
          
          await expect.soft(responseBody[0].dim_val_id).toEqual(
            parseInt(dimValId, 10)
          );
        } else {
          await expect.soft(response.status()).toEqual(409);
          this.assertErrorMessage(typeOfError,responseBody.detail, driver_tree_key, driver_tree_version, node_key, node_variant_key);
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
        let responsebody = await Utility.assertAndLog(response,isError);
        if (!isError) {
            await expect.soft(responsebody[0].lob_id).toEqual(
            parseInt(lobId, 10)
          );
          await expect.soft(responsebody[0].permission_type).toEqual(
            permissionType
          );
          await expect.soft(responsebody[0].node_variant_key).toEqual(
            node_variant_key
          );
        } else {
          await expect.soft(response.status()).toEqual(409);
          this.assertErrorMessage(typeOfError,responsebody.detail, driver_tree_key, driver_tree_version, node_key, node_variant_key);
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
        endpointURL = (await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig));
        Utility.logIt(
          `Creating Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
        );
        if(!isUpdate)
        {endpointURL = endpointURL.replace("/0","");
        response = await request.post(endpointURL, {
          data: requestData,
        });
      }
        else
        {
          response=await request.patch(endpointURL, {
            data: requestData,});
        }
        if (!isError) {
          let responseBody = await Utility.assertAndLog(response,isError);
          await expect.soft(responseBody[0].node_name).toEqual(nodeName);
          await expect.soft(responseBody[0].calc_text).toEqual(calcText);
          await expect.soft(responseBody[0].aggr_text).toEqual(aggrText);
          return responseBody[0].node_variant_key;
        } else {
          let responseBody = await Utility.assertAndLog(response,isError);
          await expect.soft(response.status()).toEqual(409);
          this.assertErrorMessage(typeOfError,responseBody.detail, driver_tree_key, driver_tree_version, node_key, node_variant_key,"","",true);
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


    /**
     * Deletes node granularities, permissions, or metadata based on the type.
     *
     * @param {number} driver_tree_key - The key of the driver tree.
     * @param {number} driver_tree_version - The version of the driver tree.
     * @param {number} node_key - The ID of the node.
     * @param {number} node_variant_key - The ID of the node variant.
     * @param {object} request - The request object for making API calls.
     * @param {string} type - The type of request ("Granularity", "Permissions", "Metadata").
     * @param {boolean} [isError=false] - Indicates whether the response is expected to be an error.
     * @param {string} [typeOfError="default"] - The type of error expected.
     * @returns {Promise<object>} - The response body or the response object.
     */
    static async deleteNodeDetails(
        driver_tree_key: number,
        driver_tree_version: number,
        node_key: number,
        node_variant_key: number,
        request: any,
        type: string,
        isError: boolean = false,
        typeOfError: string = "default"
    ): Promise<object> {
        let endpointConfig, requestData, response, endpointURL;

        switch (type) {
            case "Granularity":
                // Handle granularity-specific logic
                endpointConfig = nodeGranularities;
                requestData = endpointConfig.requestBodyDelete;
                endpointURL = await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig);
                Utility.logIt(
                    `Deleting Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
                );
                response = await request.delete(endpointURL, { data: requestData, });

                let response_body = await Utility.assertAndLog(response, isError);
                if (isError) {
                    await expect.soft(response.status()).toEqual(409);
                    this.assertErrorMessage(typeOfError, response_body.detail, driver_tree_key, driver_tree_version, node_key, node_variant_key);
                }

                break;

            case "Permissions":
                // Handle permissions-specific logic
                endpointConfig = nodePermission;
                requestData = endpointConfig.requestBodyForDelete;

                endpointURL = await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig);
                Utility.logIt(
                    `Deleting Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
                );
                response = await request.delete(endpointURL, {
                    data: requestData,
                });
                let responsebody = await Utility.assertAndLog(response, isError);
                if (isError) {
                    await expect.soft(response.status()).toEqual(409);
                    this.assertErrorMessage(typeOfError, responsebody.detail, driver_tree_key, driver_tree_version, node_key, node_variant_key);
                }
                break;

            case "Metadata":
                // Handle metadata-specific logic
                endpointConfig = nodeMetaData;
                endpointURL = await this.getFinalEndPoint(driver_tree_key, driver_tree_version, node_key, node_variant_key, endpointConfig);
                Utility.logIt(
                    `Deleting Node ${type} data for driver tree key ${driver_tree_key}, driver tree version ${driver_tree_version}, node key ${node_key}, node variant key ${node_variant_key}`
                );
                response = await request.delete(endpointURL);
                let responseBody = await Utility.assertAndLog(response, isError);
                if (isError) {
                    await expect.soft(response.status()).toEqual(409);
                    this.assertErrorMessage(typeOfError, responseBody.detail, driver_tree_key, driver_tree_version, node_key, node_variant_key);
                }
                break;

            default:
                throw new Error(`Unsupported type: ${type}`);
        }
        return response;
    }

  private static async assertErrorMessage(
    type: string,
    actualErrorMessage: string,
    driver_tree_key: number,
    driver_tree_version: number,
    node_key: number,
    node_variant_key: number,
    lob_Id: string = "",
    dim_val_id: string = "",
    is_create: boolean = false
    
   ){
    
     {
      switch (type) {
         case "IncorrectNodeVariantKey":
          if(!is_create)
          await expect.soft(actualErrorMessage).toEqual(commonData.error_messages.incorrect_Node_Variant_Key.replace("{NodeVariantKey}",String(node_variant_key)).replace("{NodeKey}",String(node_key)));
          break;
        case "IncorrectNodeKey":
          if(!is_create)
          await expect.soft(actualErrorMessage).toEqual(commonData.error_messages.incorrect_Node_Variant_Key.replace("{NodeVariantKey}",String(node_variant_key)).replace("{NodeKey}",String(node_key)));
          else
          await expect.soft(actualErrorMessage).toEqual(commonData.error_messages.incorrect_node_key_create.replace("{NodeKey}",String(node_key)));
          break;
        case "IncorrectDriverTreeKey":
          await expect.soft(actualErrorMessage).toEqual(commonData.error_messages.incorrect_driver_tree_key.replace("{DriverTreeKey}",String(driver_tree_key)));
          break;
        case "IncorrectDriverTreeVersionKey":
          await expect.soft(actualErrorMessage).toEqual(commonData.error_messages.incorrect_driver_tree_version.replace("{DriverTreeKey}",String(driver_tree_key)).replace("{DriverVersion}",String(driver_tree_version)));
          break;
        case "IncorrectDimValId":
        await expect.soft(actualErrorMessage).toEqual(commonData.error_messages.incorrect_dim.replace("{DimIds}",dim_val_id));
        break;
        case "IncorrectLobId":
          await expect.soft(actualErrorMessage).toEqual(commonData.error_messages.incorrect_lob.replace("{LobIds}",lob_Id));
        break;
    }
  }
}

static async createEditCompositeNodeVaraiant(
  driver_tree_key : number,
  driver_tree_version: number,
  node_key : number,
  node_variant_key : number,
  isUpdate : boolean,
  isError : boolean = false,
  typeofError : string = "default",
  isLOBUpdate : boolean = false,
  isDIMUpdate : boolean = false,
  request : any
):Promise<object> 
{  
   let endpointConfig = nodeComposite;
   let endpoint = await this.getFinalEndPoint(driver_tree_key,driver_tree_version,node_key,node_variant_key,endpointConfig);
   
   let lob_id = endpointConfig.lob_Id;
   let dim_val_id = endpointConfig.dim_val_Id;
   let permission_type = endpointConfig.permission_Type;
   let calc_text = endpointConfig.calc_Text;
   let aggr_text = endpointConfig.aggr_Text;
   let node_name = endpointConfig.node_Name;
   let requestBody = endpointConfig.requestBody.replace("{lob_id}",String(lob_id)).replace("{dim_val_id}",String(dim_val_id)).replace("{permission_type}",String(permission_type)).replace("{calc_text}",String(calc_text)).replace("{aggr_text}",String(aggr_text)).replace("{node_name}",String(node_name));
   let response;
    if(!isUpdate)
    { 
      endpoint= endpoint.replace("/0",""); 
      response = await request.post(endpoint, {data : requestBody});
    }

    else
    {
      endpoint= endpoint.replace("create","edit")
      requestBody = requestBody.replaceAll("Composite","CompositeUpdated");
      if(isLOBUpdate)
      {
        if(!isError)
          requestBody = requestBody.replace("110008","110006");
        else
          requestBody = requestBody.replace("110008","123");
      }

      if(isDIMUpdate)
      {
        if(!isError)
          requestBody = requestBody.replace("160164","160167");
        else
          requestBody = requestBody.replace("160164","123");
      }
      response = await request.patch(endpoint, {data : requestBody});
    }

    let responseBody = await Utility.assertAndLog(response,isError);
    if(!isError)
     {
      if(!isUpdate)
    {
      await expect.soft(responseBody[0].permissions[0].permission_assignees[0].lob_id).toEqual(lob_id);
      await expect.soft(responseBody[0].dimensions[0].dim_vals[0].dim_val_id).toEqual(parseInt(dim_val_id,10));
      await expect.soft(responseBody[0].permissions[0].permission_type).toEqual(permission_type);
      await expect.soft(responseBody[0].calc_text).toEqual(calc_text);
      await expect.soft(responseBody[0].aggr_text).toEqual(aggr_text);
      await expect.soft(responseBody[0].node_name).toEqual(node_name);
    }

    else
    {
      if(isLOBUpdate)
        lob_id= 110006;
      if(isDIMUpdate)
        dim_val_id= "160167";
      await expect.soft(responseBody[0].permissions[0].permission_assignees[0].lob_id).toEqual(lob_id);
      await expect.soft(responseBody[0].dimensions[0].dim_vals[0].dim_val_id).toEqual(parseInt(dim_val_id,10));
      await expect.soft(responseBody[0].permissions[0].permission_type).toEqual(permission_type);
      await expect.soft(responseBody[0].calc_text).toEqual(calc_text.replace("Composite","CompositeUpdated"));
      await expect.soft(responseBody[0].aggr_text).toEqual(aggr_text.replace("Composite","CompositeUpdated"));
      await expect.soft(responseBody[0].node_name).toEqual(node_name.replace("Composite","CompositeUpdated"));
     }
  }
  else{
    if(isLOBUpdate)
        lob_id= 123;
    if(isDIMUpdate)
        dim_val_id= "123";
    await expect.soft(response.status()).toEqual(409);
    if(isUpdate)
    this.assertErrorMessage(typeofError,responseBody.detail,driver_tree_key,driver_tree_version,node_key,node_variant_key,String(lob_id),dim_val_id,false)
    if(!isUpdate)
     this.assertErrorMessage(typeofError,responseBody.detail,driver_tree_key,driver_tree_version,node_key,node_variant_key,String(lob_id),dim_val_id,true) 

  }

  return responseBody;
}
}