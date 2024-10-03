import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import adjustmentData from "../testdata/adjustment.json";
import { AllocationUtility } from "./allocate-utils";
import { UfmUtility } from "./ufm-utils";

export class AdjustmentUtility {
  /**
   * This method will create the adjustment and assert the response
   *
   * @param {number} scenario_id - the id of the scenario
   * @param {number} scenario_version - the version of the scenario
   * @param {string} lobName - the name of the line of business
   * @param {object} payload - the payload for creating the adjustment
   * @param {Request} request - the request object
   * @param {boolean} isError - whether the request is expected to fail
   * @returns {Promise<object>} - the response body
   */
  static async createAdjustment(
    scenario_id,
    scenario_version,
    lobName,
    request
  ) {
    const endpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}`;
    Utility.logIt(`Create adjustment for ${lobName}`);
    adjustmentData.payloads.adjustment_metadata.adjustment_name =
      lobName + " Auto Adjustment " + new Date().toLocaleString();
    adjustmentData.payloads.adjustment_metadata.adjustment_reason =
      lobName + " Auto Adjustment Desc " + new Date().toLocaleString();
    adjustmentData.payloads.adjustment_metadata.scenario_id = scenario_id;
    adjustmentData.payloads.adjustment_metadata.scenario_version_timestamp =
      scenario_version;
    let allocationJson = await AllocationUtility.allocation(
      lobName,
      scenario_id,
      commonData["Maintain Ratio"],
      request
    );
    adjustmentData.payloads.dim_val_id = await UfmUtility.getMapping(
      lobName,
      "dim_val_id"
    );
    adjustmentData.payloads.allocation_request = allocationJson;
    console.log(adjustmentData.payloads.allocation_request);
    const response = await request.patch(endpointURL, {
      data: adjustmentData.payloads,
    });

    // asserting the response
    let responseBody = await Utility.assertAndLog(response);
    await expect
      .soft(responseBody.message)
      .toEqual(adjustmentData.successMessage);
    await expect
      .soft(responseBody.adjustment_metadata.adjustment_name)
      .toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_name);
    await expect
      .soft(responseBody.adjustment_metadata.adjustment_reason)
      .toEqual(adjustmentData.payloads.adjustment_metadata.adjustment_reason);

    let adjustment_id = responseBody.adjustment_metadata.adjustment_id;
    return responseBody.adjustment_metadata;
  }

  /**
   * This method will fetch available adjustments for the particular LOB scenario
   *
   * @param {number} scenario_id - the id of the scenario
   * @param {number} scenario_version - the version of the scenario
   * @param {string} lobName - the name of the line of business
   * @param {Request} request - the request object
   * @param {boolean} isError - whether the request is expected to fail
   * @returns {Promise<object>} - the response body
   */
  static async getAllAdjustments(
    scenario_id,
    scenario_version,
    lobName,
    request,
    isError = false
  ) {
    const endpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}?scenario_id=${scenario_id}&scenario_version_timestamp=${scenario_version}`;
    Utility.logIt(`Get adjustments for ${lobName}`);

    const response = await request.get(endpointURL);
    let responseBody = await Utility.assertAndLog(response, isError);
    return responseBody[0] ? responseBody[0] : responseBody;
  }

  /**
   * This method will delete the adjustment and assert the response
   *
   * @param {number} adjustment_id - the id of the adjustment
   * @param {number} scenario_id - the id of the scenario
   * @param {number} scenario_version - the version of the scenario
   * @param {Request} request - the request object
   * @param {boolean} isError - whether the request is expected to fail
   * @returns {Promise<object>} - the response body
   */
  static async deleteAdjustment(
    adjustment_id,
    scenario_id,
    scenario_version,
    request,
    isError = false
  ) {
    const endpointURL = `${process.env.apiBaseURLUFM}${adjustmentData.endpoint}${adjustment_id}?scenario_id=${scenario_id}&scenario_version_timestamp=${scenario_version}`;

    Utility.logIt(`Deleting adjustment with adjustment id ${adjustment_id}`);

    const response = await request.delete(endpointURL);

    let responseBody = await Utility.assertAndLog(response, isError);

    return responseBody[0] ? responseBody[0] : responseBody;
  }
}
