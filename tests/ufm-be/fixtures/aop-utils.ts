import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/new-aop-version.json";

export class AOPUtils{
    static async getAOPVersion(request){
        const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.get_info_endpoint}`;

        const response = await request.get(endpointURL);

        if (!response.ok()) {
            console.error(`API request failed with status code: ${response.status()} for URL ${response.url()}`);
          }

        return response;
    }
}
