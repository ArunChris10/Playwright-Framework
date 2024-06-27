import debug from "debug";
import getVisualizerTableFilterData from '../testdata/get-visualizer-table-filters.json';
import visualizerSaveData from '../testdata/publish-to-current-demand.json';
import visualizerTableDataCustomMetrics from '../testdata/visualizer-table-data-custom-metrics.json';

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

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Sum
    static async visualizerTableDataCustomMetricsForSum(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_sum, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Difference
    static async visualizerTableDataCustomMetricsForDifference(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_difference, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Percent Difference
    static async visualizerTableDataCustomMetricsForPercentDifference(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_percent_difference, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Year on Year Percent
    static async visualizerTableDataCustomMetricsForYearOverYearPercent(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_yoy, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Yoy difference
    static async visualizerTableDataCustomMetricsForYoyDifference(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_yoy_difference, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Last Year Value
    static async visualizerTableDataCustomMetricsForLastYearValue(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_last_year_value, headers: VisualizerUtility.headers }
        )

        return response;
    }

    // Method to call visualizer-table-data api to fetch the visualizer data for custom metric Percent of Sales
    static async visualizerTableDataCustomMetricsForPercentOfSales(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerTableDataCustomMetrics.endpoint}`;
        debug.log(endpointURL);

        const response = await request.post(
            endpointURL,
            { data: visualizerTableDataCustomMetrics.payload_for_percent_of_sales, headers: VisualizerUtility.headers }
        )

        return response;
    }
}