import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { UfmUtility } from "./ufm-utils";

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

export interface Edit {
  node_var_name: string;
  node_dimension: NodeDimension;
  data: any;
  allocation: Allocation;
}

export interface NodeDimension {}

export interface Allocation {
  method: number;
  interval: any;
  offset: any;
}

export class AllocationUtility {
  public static async allocation(
    lobName: string,
    scenarioId: number,
    allocation_method: number,
    request
  ) {
    let inputNodes: string[] = [];
    let obj = {} as Root;
    let edit: Edit[] = [];
    let data = {};

    let allocation = {} as Allocation;
    let node_dimension: NodeDimension = {};

    //Get current month and year
    let cellValue = await Utility.randomInt(1, 5000);
    let monthYear = await Utility.getMonthYear();
    data[monthYear] = cellValue;

    //Get all input node of LOB
    inputNodes = await UfmUtility.getInputNodelist(lobName, request);

    allocation.method = allocation_method;

    for (let i = 0; i < inputNodes.length; i++) {
      edit.push({
        node_var_name: `${inputNodes[i]}`,
        node_dimension: node_dimension,
        data: data,
        allocation: allocation,
      });
    }

    obj.display_nodes = [];
    obj.scenario_id = scenarioId;
    obj.dim_val_id = commonData[lobName].dim_val_id;
    obj.dim_id = 11;
    obj.edits = edit;
    obj.filters = [];
    obj.period_view = "month";
    obj.preview = true;

    Utility.logIt(obj);
    return obj;
  }
}
