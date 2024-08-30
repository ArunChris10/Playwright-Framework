import debug from "debug";
import { expect } from "@playwright/test";
import getVisualizerTableFilterData from '../testdata/get-visualizer-table-filters.json';
import visualizerSaveData from '../testdata/visualizer-create-view-scenarios-list.json';
import visualizerSaveCurrentDemandData from '../testdata/publish-to-current-demand.json';
import visualizerTableDataCustomMetrics from '../testdata/visualizer-table-data-custom-metrics.json';
import visualizerDownloadData from '../testdata/visualizer-view-download.json';
import visualizerTableDataCustomScenarios from '../testdata/visualizer-table-data-custom-scenarios.json'
import visualizerTableData from '../testdata/visualizer-table-data.json';

export class VisualizerUtility {

    static headers = {
        "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
        "WM_SVC.NAME": process.env.WM_SVC_NAME,
        "WM_SVC.ENV": process.env.envName
      }

    // Method to call the get-visualizer-table-filters api
    static async getVisualizerTableFilters(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${getVisualizerTableFilterData.endpoint}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { headers: VisualizerUtility.headers }
        );

        return response;
    }

    static async getTemplate(request, appId = 1) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}/api/visualizer/templates/${appId}`;
        debug.log(endpointURL);
        const response = await request.get(
            endpointURL,
            { headers: VisualizerUtility.headers }
        )
        expect(response).toBeOK();
        const responseBody = await response.json();
        return responseBody;
    }

    static async searchScenario(request, templateId: string, appId = 1, size = 50) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}/api/visualizer/templates/${appId}/scenarios/${templateId}/search?filterValue=&size=${size}`;
        debug.log(endpointURL);
        const response = await request.get(
            endpointURL,
            { headers: VisualizerUtility.headers }
        )
        expect(response).toBeOK();
        const responseBody = await response.json();
        return responseBody;
    }

    // Method to call visualizer-save api to publish to current demand
    static async visualizerSave(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerSaveData.endpoint}`;
        debug.log(endpointURL);

        const response = await request.put(
            endpointURL,
            { data: visualizerSaveData.payload, headers: VisualizerUtility.headers }
        )

        return response;
    }
   static async visualizerSaveCurrentDemand(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerSaveCurrentDemandData.endpoint}`;
        debug.log(endpointURL);

        const response = await request.put(
            endpointURL,
            { data: visualizerSaveCurrentDemandData.payload, headers: VisualizerUtility.headers }
        )

        return response;
    }

    static async getVisualizerTableData(request, templateId: string, payloadExtension = {}, appId = 1) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}/api/visualizer/templates/${appId}/scenarios/${templateId}/data`;
        debug.log(endpointURL);
        const response = await request.post(
            endpointURL,
            { data: {...visualizerTableData.payload, ...payloadExtension}, headers: VisualizerUtility.headers }
        )
        expect(response).toBeOK();
        const responseBody = await response.json();
        return responseBody;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Sum
    static async visualizerTableDataCustomMetricsForSum(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomMetrics.payload_for_sum.scenarioIdentification[0].demandStackScenarioId = visualizerTableDataCustomMetrics.payload_for_sum.scenarioIdentification[0].demandStackScenarioId.replace("demandStackId", demandId);
        visualizerTableDataCustomMetrics.payload_for_sum.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = visualizerTableDataCustomMetrics.payload_for_sum.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId.replace("demandStackId", demandId)

        visualizerTableDataCustomMetrics.payload_for_sum.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomMetrics.payload_for_sum.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandId

        const {
            v1: uuidv1
        } = require('uuid');
        const derivedMetricId = uuidv1();
        visualizerTableDataCustomMetrics.payload_for_sum.derivedMetricList[0].identificationId = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_sum.derivedMetricList[0].columnName = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_sum.metricOrderList[3].columnName = derivedMetricId

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_sum, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Difference
    static async visualizerTableDataCustomMetricsForDifference(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomMetrics.payload_for_difference.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomMetrics.payload_for_difference.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandId

        const {
            v1: uuidv1
        } = require('uuid');
        const derivedMetricId = uuidv1();
        visualizerTableDataCustomMetrics.payload_for_difference.derivedMetricList[0].identificationId = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_difference.derivedMetricList[0].columnName = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_difference.metricOrderList[3].columnName = derivedMetricId

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_difference, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Percent Difference
    static async visualizerTableDataCustomMetricsForPercentDifference(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomMetrics.payload_for_percent_difference.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomMetrics.payload_for_percent_difference.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandId

        const {
            v1: uuidv1
        } = require('uuid');
        const derivedMetricId = uuidv1();
        visualizerTableDataCustomMetrics.payload_for_percent_difference.derivedMetricList[0].identificationId = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_percent_difference.derivedMetricList[0].columnName = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_percent_difference.metricOrderList[3].columnName = derivedMetricId

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_percent_difference, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Year on Year Percent
    static async visualizerTableDataCustomMetricsForYearOverYearPercent(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomMetrics.payload_for_yoy.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomMetrics.payload_for_yoy.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandId

        const {
            v1: uuidv1
        } = require('uuid');
        const derivedMetricId = uuidv1();
        visualizerTableDataCustomMetrics.payload_for_yoy.derivedMetricList[0].identificationId = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_yoy.derivedMetricList[0].columnName = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_yoy.metricOrderList[3].columnName = derivedMetricId

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_yoy, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Yoy difference
    static async visualizerTableDataCustomMetricsForYoyDifference(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomMetrics.payload_for_yoy_difference.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomMetrics.payload_for_yoy_difference.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandId

        const {
            v1: uuidv1
        } = require('uuid');
        const derivedMetricId = uuidv1();
        visualizerTableDataCustomMetrics.payload_for_yoy_difference.derivedMetricList[0].identificationId = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_yoy_difference.derivedMetricList[0].columnName = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_yoy_difference.metricOrderList[3].columnName = derivedMetricId

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_yoy_difference, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Last Year Value
    static async visualizerTableDataCustomMetricsForLastYearValue(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomMetrics.payload_for_last_year_value.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomMetrics.payload_for_last_year_value.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandId

        const {
            v1: uuidv1
        } = require('uuid');
        const derivedMetricId = uuidv1();
        visualizerTableDataCustomMetrics.payload_for_last_year_value.derivedMetricList[0].identificationId = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_last_year_value.derivedMetricList[0].columnName = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_last_year_value.metricOrderList[3].columnName = derivedMetricId

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_last_year_value, headers: VisualizerUtility.headers }
        )
        
        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Percent of Sales
    static async visualizerTableDataCustomMetricsForPercentOfSales(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomMetrics.payload_for_percent_of_sales.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomMetrics.payload_for_percent_of_sales.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandId

        const {
            v1: uuidv1
        } = require('uuid');
        const derivedMetricId = uuidv1();
        visualizerTableDataCustomMetrics.payload_for_percent_of_sales.derivedMetricList[0].identificationId = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_percent_of_sales.derivedMetricList[0].columnName = derivedMetricId
        visualizerTableDataCustomMetrics.payload_for_percent_of_sales.metricOrderList[3].columnName = derivedMetricId


        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_percent_of_sales, headers: VisualizerUtility.headers }
        )

        return response;
    }

    static async getVisualizerData(request, demandScenarioId, type){
        let suffix;
        if (type === visualizerDownloadData.excel)
            suffix = visualizerDownloadData.excelEndpointSuffix;
        else if (type === visualizerDownloadData.csv)
            suffix = visualizerDownloadData.csvEndpointSuffix;
        else if (type === visualizerDownloadData.data)
            suffix = visualizerDownloadData.dataEndpointSuffix;
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerDownloadData.endpointPrefix}${suffix}`;
        debug.log(endpointURL);

        visualizerDownloadData.dataPayload.scenarioIdentification[0].demandStackScenarioId = demandScenarioId;
        visualizerDownloadData.dataPayload.scenarioOrderList[0].scenarioIdentification.demandStackScenarioId = demandScenarioId;

        const response = await request.post(
            endpointURL,
            { data: visualizerDownloadData.dataPayload, headers: VisualizerUtility.headers }
        )

        return response;
    }
    
    static async visualizerTableDataCustomScenarioSumDiff(request, demandId1, demandId2) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomScenarios.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.scenarioIdentification[0].demandStackScenarioId = demandId1
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.scenarioIdentification[1].demandStackScenarioId = demandId2
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.derivedScenariosList[0].scenarios[0].scenarioIdentification.demandStackScenarioId = demandId1
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.derivedScenariosList[0].scenarios[1].scenarioIdentification.demandStackScenarioId = demandId2
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.derivedScenariosList[1].scenarios[0].scenarioIdentification.demandStackScenarioId = demandId1
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.derivedScenariosList[1].scenarios[1].scenarioIdentification.demandStackScenarioId = demandId2
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.derivedScenariosList[2].scenarios[0].scenarioIdentification.demandStackScenarioId = demandId1
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.derivedScenariosList[2].scenarios[1].scenarioIdentification.demandStackScenarioId = demandId2
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.scenarioOrderList[0].scenarioIdentification!.demandStackScenarioId = demandId1
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff.scenarioOrderList[1].scenarioIdentification!.demandStackScenarioId = demandId2

        debug.log(visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomScenarios.visualizer_table_data_payload_sum_diff, headers: VisualizerUtility.headers }
        )

        return response;
    }

    static async visualizerTableDataCustomScenarioYoy(request, demandId, dateIntervalStart, dateIntervalEnd) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomScenarios.endpoint}`;
        debug.log(endpointURL);

        visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy.scenarioIdentification[0].demandStackScenarioId = demandId
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy.derivedScenariosList[0].scenarios[0].scenarioIdentification.demandStackScenarioId = demandId
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy.derivedScenariosList[1].scenarios[0].scenarioIdentification.demandStackScenarioId = demandId
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy.derivedScenariosList[2].scenarios[0].scenarioIdentification.demandStackScenarioId = demandId
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy.scenarioOrderList[0].scenarioIdentification!.demandStackScenarioId = demandId
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy.dateIntervalFilter.startInterval = dateIntervalStart
        visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy.dateIntervalFilter.endInterval = dateIntervalEnd

        debug.log(visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomScenarios.visualizer_table_data_payload_yoy, headers: VisualizerUtility.headers }
        )

        return response;
    }

      static async deleteView(request, viewId) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}/api/visualizer/views/${viewId}`;
        console.log(endpointURL);
        const response = await request.delete(
            endpointURL,

            { headers: VisualizerUtility.headers }
          );

           return response;
      }
}