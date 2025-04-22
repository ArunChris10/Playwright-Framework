import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import editForecast from "../testdata/editForecast.json"
import { UfmUtility } from "./ufm-utils";
import adjustmentData from "../testdata/adjustment.json"
import getKpiData from "../testdata/getKpi.json";
import { SOTUtility } from "./SOTUtility";

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
 * @param {boolean} [isError=false] - Whether the request is expected to fail.
 */

let currentFlow = "";
export interface Root {
    display_nodes: any[];
    scenario_id: number;
    dim_val_id: number;
    dim_id: number;
    preview: boolean;
    edits: any;
    filters: any[];
    period_view: string;
    adjustment_id: number;
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
export interface NodeDimension { }

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
 * Represents an edit forecast utility.
 */
export class EditForecastUtility {
    /**
     * Creates an allocation payload.
     *
     * @param {string} lobName - The line of business name.
     * @param {number} scenarioId - The scenario ID.
     * @param {number} allocation_method - The allocation method.
     * @param {string[]} additiveOrNonAdditive - The additive or non-additive nodes.
     * @param {NodeDimension} node_dimension - The node dimension.
     * @param {Object} request - The request object.
     * @returns {Promise<{ obj: Root; baselineValuesMap: Record<string, number[]>; months: string[] }>} A promise that resolves to the payload object.
     */

    static async createAllocationPayload(
        lobName: string,
        scenarioId: number,
        allocation_method: number,
        additiveOrNonAdditive,
        node_dimension,
        filters,
        request
    ) {
        let obj = {} as Root;
        let edit: Edit[] = [];

        let months: string[] = [];
        let baselineValuesMap: Record<string, number[]> = {};

        if (editForecast.testData[lobName]) {
            let lobData = editForecast.testData[lobName];
            let allocation = {} as Allocation;
            allocation.method = allocation_method;

            if (additiveOrNonAdditive.includes("Additive") && lobData.AdditiveNodes) {
                for (const node of lobData.AdditiveNodes) {
                    await this.processNodeData(node, months, edit, node_dimension, allocation);
                }
                let affectingNodes = lobData.AffectingNodes?.Additive || [];
                await this.processAffectingNodes(affectingNodes, lobName, scenarioId, months, baselineValuesMap, node_dimension, filters, obj, request);
            }

            if (additiveOrNonAdditive.includes("NonAdditive") && lobData.NonAdditiveNodes) {
                for (const node of lobData.NonAdditiveNodes) {
                    await this.processNodeData(node, months, edit, node_dimension, allocation);
                }
                let affectingNodes = lobData.AffectingNodes?.NonAdditive || [];
                await this.processAffectingNodes(affectingNodes, lobName, scenarioId, months, baselineValuesMap, node_dimension,filters,obj, request);
            }
        }

        Utility.logIt({ baselineValuesMap });

        obj.scenario_id = scenarioId;
        obj.dim_val_id = await UfmUtility.getMapping(lobName, "dim_val_id");
        obj.dim_id = 11;
        obj.edits = edit;
        obj.filters = filters;
        obj.period_view = "month";
        obj.preview = true;
        obj.adjustment_id = editForecast.testData[lobName]?.adjustmentId;
  
        return { obj, baselineValuesMap, months };
    }

    /**
     * Processes the node data.
     *
     * @param {string} node - The node name.
     * @param {string[]} months - The months array.
     * @param {Edit[]} edit - The edit array.
     * @param {NodeDimension} node_dimension - The node dimension.
     * @param {Allocation} allocation - The allocation object.
     */
    private static async processNodeData(
        node: string,
        months: string[],
        edit: Edit[],
        node_dimension: NodeDimension,
        allocation: Allocation
    ) {
        let data: Record<string, number> = {};

        for (let i = 0; i < 3; i++) {
            let monthYear = (parseInt(await Utility.getMonthYear()) + i + 1).toString();
            months.push(monthYear);
            data[monthYear] = (data[monthYear] || 0) + await Utility.randomInt(1, 5000);
        }

        const existingEdit = edit.find(e => e.node_var_name === node);
        if (existingEdit) {
            existingEdit.data = { ...existingEdit.data, ...data };
        } else {
            edit.push({
                node_var_name: node,
                node_dimension: node_dimension,
                data: data,
                allocation: allocation,
            });
        }
    }

    /**
     * Processes the affecting nodes.
     *
     * @param {string[]} affectingNodes - The array of affecting nodes.
     * @param {string} lobName - The line of business name.
     * @param {number} scenarioId - The scenario ID.
     * @param {string[]} months - The months array.
     * @param {Record<string, number[]>} baselineValuesMap - The baseline values map.
     * @param {Root} obj - The root object.
     * @param {Object} request - The request object.
     */
    private static async processAffectingNodes(
        affectingNodes: string[],
        lobName: string,
        scenarioId: number,
        months: string[],
        baselineValuesMap: Record<string, number[]>,
        node_dimension,
        filters: any[],
        obj: Root,
        request: any
    ) {
        for (const node of affectingNodes) {
            let kpiResponse = await this.getKpiForecast(lobName, scenarioId, months, node_dimension, node, filters,request);
            baselineValuesMap[node] = [];
            for (const month of months) {
                const row = kpiResponse.rowData.find((row: any) => {
                    if (node_dimension && Object.keys(node_dimension).length > 0) {
                        const key = Object.keys(node_dimension)[0]; 
                        return row[month] !== undefined && row[key] === node_dimension[key];
                    }
                    return row[month] !== undefined;
                });
                baselineValuesMap[node].push(row[month]?.baseline || null);
            }
        }
        obj.display_nodes = [...(obj.display_nodes || []), ...affectingNodes];
    }

    /**
     * Gets the KPI forecast.
     *
     * @param {string} lobName - The line of business name.
     * @param {Object} scenario_details - The scenario details.
     * @param {string} monthYear - The month and year.
     * @param {any[]} inputNodes - The input nodes array.
     * @param {Object} request - The request object.
     * @returns {Promise<any>} A promise that resolves to the response object.
     */
    static async getKpiForecast(lobName, scenario_details, monthYear, node_dimension, inputNodes,filter,request) {
        const endpointURL = `${process.env.apiBaseURLUFM}${getKpiData.endpoint}`;
        let kpiPayload = await this.createKpiPayloadNodeLevel(
            lobName,
            scenario_details,
          filter,
            monthYear,
            inputNodes,
            node_dimension
        );
        Utility.logIt({ kpiPayload });
        let apiResponse = await request.post(endpointURL, {
            data: kpiPayload,
        });
        return await Utility.assertAndLog(apiResponse);
    }

    /**
     * Creates a KPI payload for node level.
     *
     * @param {string} lobName - The line of business name.
     * @param {Object} scenario_details - The scenario details.
     * @param {any[]} filter - The filter array.
     * @param {string} monthYear - The month and year.
     * @param {any[]} nodes - The nodes array.
     * @returns {Promise<any>} A promise that resolves to the payload object.
     */
    static async createKpiPayloadNodeLevel(
        lobName,
        scenario_details,
        filter ,
        monthYear,
        nodes,
        node_dimension
    ) {
        getKpiData.payloads.scenario_id = scenario_details["scenarioId"];
        getKpiData.payloads.scenario_version = scenario_details["scenarioVersion"];

        getKpiData.payloads.dim_val_id = await UfmUtility.getMapping(
            lobName,
            "dim_val_id"
        );
        getKpiData.payloads.additional_filters.template_include_headers[1] =
            await SOTUtility.templateIncludeHeaders(monthYear);
        getKpiData.payloads.additional_filters.month = monthYear;


        getKpiData.payloads.additional_filters.nodes = Array.isArray(nodes) ? nodes : [nodes];
        if (node_dimension && Object.keys(node_dimension).length > 0) {
            const key = Object.keys(node_dimension)[0];
            if (!getKpiData.payloads.additional_filters.pivot_index?.includes(key)) {
            getKpiData.payloads.additional_filters.pivot_index = [
                ...(getKpiData.payloads.additional_filters.pivot_index || []),
                key,
            ];
            }
        }
        getKpiData.payloads.filters = filter;
        return getKpiData.payloads;
    }

    /**
     * Validates the forecast response.
     *
     * @param {any[]} responseBody - The response body.
     * @param {Root} obj - The root object.
     * @param {Record<string, number[]>} baselineValuesMap - The baseline values map.
     * @param {string[]} months - The months array.
     */
    static async validateForecastResponse(
        responseBody: any[],
        obj: Root,
        baselineValuesMap: Record<string, number[]>,
        months: string[]
    ) {
        for (const responseNode of responseBody) {
            const { node_var_name, edits: responseEdits } = responseNode;
    
            // Validate the edits (month and forecast values) for nodes present in obj.edits
            const payloadNode = obj.edits.find(edit => edit.node_var_name === node_var_name);
            if (payloadNode) {
                for (const [month, edit] of Object.entries(responseEdits as Record<string, { forecast: number }>)) {
                    const forecastValue = edit.forecast;
    
                    // Assert that the forecast value matches
                    const expectedValue = payloadNode.data[month];
                    const lowerBound = expectedValue * 0.99; // 1% less
                    const upperBound = expectedValue * 1.01; // 1% more
                    expect(forecastValue).toBeGreaterThanOrEqual(lowerBound);
                    expect(forecastValue).toBeLessThanOrEqual(upperBound);
                    Utility.logIt(`Forecast value for month ${month} matches for node ${node_var_name}: ${forecastValue}`);
                }
            }
    
            // Handle extra nodes (nodes not present in obj.edits)
            const extraNodes = Object.keys(baselineValuesMap).filter(
                (node) => !obj.edits.some((edit) => edit.node_var_name === node)
            );
            expect(extraNodes.length).toBeGreaterThan(0); // Ensure there are extra nodes
            extraNodes.forEach((extraNode) => {
                expect(responseBody.some((node) => node.node_var_name === extraNode)).toBeTruthy(); // Check if each extra node is in the response
            });
    
            if (extraNodes.includes(node_var_name)) {
                for (const [month, edit] of Object.entries(responseEdits as Record<string, { forecast: number }>)) {
                    const forecastValue = edit.forecast;
                    const baselineValuesForNode = baselineValuesMap[node_var_name];
                    expect(baselineValuesForNode).toBeDefined(); 
                    const baselineValue = baselineValuesForNode[months.indexOf(month)]; // Get the baseline value for the current month
                    expect(forecastValue).not.toBe(baselineValue); // Assert forecast for affecting nodes is updated with edit in Parent node
                    Utility.logIt(`Forecast value for month ${month} (${forecastValue}) for extra node ${node_var_name} changed from baseline value (${baselineValue})`);
                }
            }
        }
    }

    /**
     * Creates an adjustment.
     *
     * @param {number} scenario_id - The scenario ID.
     * @param {number} scenario_version - The scenario version.
     * @param {string} lobName - The line of business name.
     * @param {number} allocationMethod - The allocation method.
     * @param {string[]} additiveOrNonAdditive - The additive or non-additive nodes.
     * @param {NodeDimension} node_dimension - The node dimension.
     * @param {Object} request - The request object.
     * @returns {Promise<any>} A promise that resolves to the response object.
     */
    static async createAdjustment(
        scenario_id,
        scenario_version,
        lobName,
        allocationMethod,
        additiveOrNonAdditive: string[],
        node_dimension: NodeDimension = {},
        obj,
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
        adjustmentData.payloads.dim_val_id = await UfmUtility.getMapping(
            lobName,
            "dim_val_id"
        );
        obj.preview = false;
        adjustmentData.payloads.allocation_request = obj;
        Utility.logIt("Adjustment Payload" + JSON.stringify(adjustmentData.payloads))
        const response = await request.patch(endpointURL, {
            data: adjustmentData.payloads,
        });
        
        return await Utility.assertAndLog(response);
    }
}