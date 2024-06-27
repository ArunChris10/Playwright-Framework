import debug from "debug";
import testdata from '../testdata/lock-scenario.json';

export class LockUnlockUtility {

    static headers = {
        "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
        "WM_SVC.NAME": process.env.WM_SVC_NAME,
        "WM_SVC.ENV": process.env.envName
    }

    static async lockDSSData(request, demandId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testdata.endpoint}${demandId}/lock`;
        debug.log(endpointURL);
        
        // API Request
        const response = await request.post(
            endpointURL,
            { 
                data: testdata.payload,
                headers: LockUnlockUtility.headers
            }
        );

        return response;
    }
}