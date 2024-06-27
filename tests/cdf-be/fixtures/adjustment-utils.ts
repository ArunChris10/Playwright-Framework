import debug from "debug";
import createEmtLayer from '../testdata/create-emt-layer.json';
import editEmtLayer from '../testdata/edit-emt-layer.json';
import deleteEmtLayer from '../testdata/delete-emt-layer.json';
import getEmtLayer from '../testdata/get-emt-layer.json';

export class AdjustmentUtility {

    static headers = {
        "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
        "WM_SVC.NAME": process.env.WM_SVC_NAME,
        "WM_SVC.ENV": process.env.envName
    }

    static async createEMTLayer(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${createEmtLayer.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.put(
            endpointURL,
            { 
                data: createEmtLayer.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async getEMTLayer(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${getEmtLayer.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: getEmtLayer.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async editEMTLayer(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${editEmtLayer.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: editEmtLayer.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async deleteEMTLayer(request, layerId, demandId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${deleteEmtLayer.endpoint}${demandId}/layer/${layerId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.delete(
            endpointURL,
            { 
                data: deleteEmtLayer.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }
}