import debug from "debug";
import testDataForManage from '../testdata/manage-rebase.json';

export class ManageRebaseUtility {

    static headers = {
        "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
        "WM_SVC.NAME": process.env.WM_SVC_NAME,
        "WM_SVC.ENV": process.env.envName
    }

    static async getDemandScenarioForecast(request, demandId, endpoint, payload) {
        const endpointURL = `${process.env.apiBaseURLCDF}${endpoint}${demandId}`;
        console.log("Endpoint URL for getDemandScenarioForecast: ", endpointURL);

        // API Request
        const response = await request.post(
            endpointURL,
            {
                data: payload,
                headers: ManageRebaseUtility.headers
            }
        );

        return response;
    }

    static async createManualAdjustmentLayer(request, demandId, endpoint, payload) {
        const endpointURL = `${process.env.apiBaseURLCDF}${endpoint}${demandId}`;
        console.log(endpointURL);

        // API Request
        const response = await request.put(
            endpointURL,
            { 
                data: payload,
                headers: ManageRebaseUtility.headers
            }
        );

        return response;
    }

    static async manageLayers(request, demandId, endpoint, payload, layer1LayerId, layer2LayerId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${endpoint}${demandId}`;
        debug.log(endpointURL);

        testDataForManage.payloadForManageLayers.layers[0].layerId = layer2LayerId;
        testDataForManage.payloadForManageLayers.layers[1].layerId = layer1LayerId;

        // API Request
        const response = await request.put(
            endpointURL,
            {
                data: testDataForManage.payloadForManageLayers,
                headers: ManageRebaseUtility.headers
            }
        )

        return response;
    }

    static async getDemandScenarioForecastWithLayerId(request, demandId, endpoint, payload) {
        const endpointURL = `${process.env.apiBaseURLCDF}${endpoint}${demandId}`;
        console.log("Endpoint URL for getDemandScenarioForecast: ", endpointURL);

        // API Request
        const response = await request.post(
            endpointURL,
            {
                data: payload,
                headers: ManageRebaseUtility.headers
            }
        );

        return response;
    }

    static async switchBaseDSResponse(request, demandId, forecastVersion) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testDataForManage.endpointForUpdateDemandScenarioBaseForecast}`;
        console.log("Endpoint URL for switchBaseDSResponse: ", endpointURL);

        testDataForManage.payloadForUpdateDemandScenarioBaseForecast.demandStackId = demandId;
        testDataForManage.payloadForUpdateDemandScenarioBaseForecast.forecastVersion = forecastVersion;

        // API Request
        const response = await request.put(
            endpointURL,
            {
                data: testDataForManage.payloadForUpdateDemandScenarioBaseForecast,
                headers: ManageRebaseUtility.headers
            }
        )

        return response;
    }

    static async getDemandScenarioForecastDSRebase(request, demandId, testDataFileManageRebase) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testDataFileManageRebase.endpointForGetDemandScenarioForecast}${demandId}`;
        console.log("Endpoint URL for getDemandScenarioForecast: ", endpointURL);

        // API Request
        const response = await request.post(
            endpointURL,
            {
                data: testDataFileManageRebase.payloadForGetDemandScenarioForecastAfterBaseDSRebase,
                headers: ManageRebaseUtility.headers
            }
        );

        return response;
    }

    static async getDemandScenarioForecastDSRebaseWithLayerId(request, demandId, testDataFileManageRebase, layerId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testDataFileManageRebase.endpointForGetDemandScenarioForecast}${demandId}`;
        console.log("Endpoint URL for getDemandScenarioForecast: ", endpointURL);

        testDataFileManageRebase.payloadForGetDemandScenarioForecastAdjustmentLayer.layerIds[0] = layerId

        // API Request
        const response = await request.post(
            endpointURL,
            {
                data: testDataFileManageRebase.payloadForGetDemandScenarioForecastAdjustmentLayer,
                headers: ManageRebaseUtility.headers
            }
        );

        return response;
    }

    static async getForecastInfoList(request, demandId, endpoint, payload) {
        const endpointURL = `${process.env.apiBaseURLCDF}${endpoint}`;
        console.log("Endpoint URL for getForecastInfoList: ", endpointURL);

        // API Request
        const response = await request.post(
            endpointURL,
            {
                data: testDataForManage.payloadForForecastInfoList,
                headers: ManageRebaseUtility.headers
            }
        );

        return response;
    }
}