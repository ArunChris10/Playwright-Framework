import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "./ufm-utils";

/**
 * Represents the root object for an allocation.
 *
 * @typedef {Object} Root
 * @property {Array} display_nodes - An array of display nodes.
 * @property {number} scenario_id - The scenario ID.
 * @property {number} dim_val_id - The dimension value ID.
 * @property {number} dim_id - The dimension ID.
 * @property {boolean} preview - Whether or not this is a preview.
 * @property {Array} edits - An array of edit objects.
 * @property {Array} filters - An array of filters.
 * @property {string} period_view - The period view.
 */
export interface Root {
  display_nodes: any[];
  scenario_id: number;
  dim_val_id: number;
  dim_id: number;
  preview: boolean;
  edits: any;
  filters: any[];
  period_view: string;
}

/**
 * Represents an edit object.
 *
 * @typedef {Object} Edit
 * @property {string} node_var_name - The node variable name.
 * @property {NodeDimension} node_dimension - The node dimension.
 * @property {Object} data - The data.
 * @property {Allocation} allocation - The allocation.
 */
export interface Edit {
  node_var_name: string;
  node_dimension: NodeDimension;
  data: any;
  allocation: Allocation;
}

/**
 * Represents a node dimension.
 *
 * @typedef {Object} NodeDimension
 */
export interface NodeDimension {}

/**
 * Represents an allocation.
 *
 * @typedef {Object} Allocation
 * @property {number} method - The allocation method.
 * @property {any} interval - The interval.
 * @property {any} offset - The offset.
 */
export interface Allocation {
  method: number;
  interval: any;
  offset: any;
}

/**
 * Represents an allocation utility.
 */
export class AllocationUtility {
  /**
   * Allocates a scenario.
   *
   * @param {string} lobName - The line of business name.
   * @param {number} scenarioId - The scenario ID.
   * @param {number} allocation_method - The allocation method.
   * @param {Object} request - The request object.
   * @returns {Promise<Root>} A promise that resolves to the root object.
   */
  public static async allocation(
    lobName: string,
    scenarioId: number,
    allocation_method: number,
    request
  ) {
    let obj = {} as Root;
    let edit: Edit[] = [];
    let data = {};

    // let allocation = {} as Allocation;
    let node_dimension: NodeDimension = {};

    //Get current month and year
    let cellValue = await Utility.randomInt(1, 5000);
    let monthYear = await Utility.getMonthYear();
    data[monthYear] = cellValue;

    //Get all input node of LOB
    let inputNodes = await UfmUtility.getDriverList(lobName, "Input", request);

    for (const inputNode of inputNodes) {
      const { node_var_name, node_grain } = inputNode;

      let allocation = {} as Allocation;
      allocation.method = allocation_method;

      console.log(node_var_name, node_grain, node_grain.length);

      if (node_grain[0] === "month" && node_grain.length === 1) {
        allocation.method = commonData["Constant value"];
      }
      edit.push({
        node_var_name: `${node_var_name}`,
        node_dimension: node_dimension,
        data: data,
        allocation: allocation,
      });
    }

    obj.display_nodes = [];
    obj.scenario_id = scenarioId;
    obj.dim_val_id = await UfmUtility.getMapping(lobName, "dim_val_id");
    obj.dim_id = 11;
    obj.edits = edit;
    obj.filters = [];
    obj.period_view = "month";
    obj.preview = true;

    Utility.logIt(obj);
    return obj;
  }
}
