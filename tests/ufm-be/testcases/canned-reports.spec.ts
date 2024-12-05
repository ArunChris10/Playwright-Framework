import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import cannedreportdata from "../testdata/canned-reports.json";
import BAList from "../constants/PBA_SBA_List.json";
import cannedreportmapping from "../constants/common.json";

let BA_canned_url = cannedreportmapping.CannedReportMappingList;
const BAName = BAList.PBAList;

BAName.forEach((BA) => {
  test.describe(
    "Verify the canned reports API for " + BA,
    { tag: "@Regression @canned_reports" },
    () => {
      test.describe.configure({ timeout: 240_000, mode: "parallel" });
      let responseBody;
      let endpointURL = `${process.env.apiBaseURLVISUALIZER}${cannedreportdata.endpoint}`;
      Utility.logIt(endpointURL);

      test(`Verify if get canned report api is returning data for ${BA} BA on canned report screen`, async ({
        request,
      }) => {
        endpointURL = endpointURL + BA_canned_url[BA];
        cannedreportdata.payload.month = await Utility.getQuarter();
        if (BA != "ECOMMERCE") cannedreportdata.payload.filters = [];
        responseBody = await request.post(endpointURL, {
          data: cannedreportdata.payload,
        });
        let response = await Utility.assertAndLog(responseBody);
        expect(JSON.stringify(response.messages)).not.toContain(
          cannedreportdata.errormessage
        );
      });
    }
  );
});
