import debug from "debug";

export class AdjustmentUtility {

    static headers = {
        "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
        "WM_SVC.NAME": process.env.WM_SVC_NAME,
        "WM_SVC.ENV": process.env.envName
    }

    static async createEMTLayer(request, demandId, testdatafileCreateEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileCreateEMT.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.put(
            endpointURL,
            { 
                data: testdatafileCreateEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async getEMTLayer(request, demandId, testdatafileGetEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileGetEMT.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileGetEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async editEMTLayer(request, demandId, testdatafileEditEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileEditEMT.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileEditEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async deleteEMTLayer(request, layerId, demandId, testdatafileDeleteEMT) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileDeleteEMT.endpoint}${demandId}/layer/${layerId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.delete(
            endpointURL,
            { 
                data: testdatafileDeleteEMT.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async createManualAdjustmentLayer(request, demandId, testdatafileCreateManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileCreateManualAdjustment.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.put(
            endpointURL,
            { 
                data: testdatafileCreateManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async getManualAdjustmentLayer(request, demandId, testdatafileGetManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileGetManualAdjustment.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileGetManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async editManualAdjustmentLayer(request, demandId, testdatafileEditManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileEditManualAdjustment.endpoint}${demandId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.get(
            endpointURL,
            { 
                data: testdatafileEditManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }

    static async deleteManualAdjustmentLayer(request, layerId, demandId, testdatafileDeleteManualAdjustment) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdatafileDeleteManualAdjustment.endpoint}${demandId}/layer/${layerId}`;
        debug.log(endpointURL);

        // API Request
        const response = await request.delete(
            endpointURL,
            { 
                data: testdatafileDeleteManualAdjustment.payload,
                headers: AdjustmentUtility.headers
            }
        );

        return response;
    }
}