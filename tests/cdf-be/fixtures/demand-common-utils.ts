import debug from "debug";
import scenario from "../testdata/scenario.json";

export class DemandBaseClass {
  static headers = {
    "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
    "WM_SVC.NAME": process.env.WM_SVC_NAME,
    "WM_SVC.ENV": process.env.envName,
  };

  // This method will create the scenario and asserts the response
  static async getDemandStackDetails(request, demandStackId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${demandStackId}`;
    const response = await request.get(endpointURL, { headers: this.headers });
    return await response.json();
  }
}
