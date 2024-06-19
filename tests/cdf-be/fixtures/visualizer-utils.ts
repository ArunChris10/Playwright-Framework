import debug from "debug";
import getVisualizerTableFilterData from '../testdata/get-visualizer-table-filters.json';
import visualizerSaveData from '../testdata/publish-to-current-demand.json';

export class VisualizerUtility {

    // Method to call the get-visualizer-table-filters api
    static async getVisualizerTableFilters(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${getVisualizerTableFilterData.endpoint}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { headers: process.env.headers }
        );

        return response;
    }

    // Method to call visualizer-save api to publish to current demand
    static async visualizerSave(request) {
        const endpointURL = `${process.env.apiBaseURLVISUALIZER}${visualizerSaveData.endpoint}`;
        debug.log(endpointURL);

        const response = await request.put(
            endpointURL,
            { data: visualizerSaveData.payload, headers: process.env.headers }
        )

        return response;
    }
}