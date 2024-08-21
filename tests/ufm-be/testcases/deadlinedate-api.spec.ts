import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import testdata from "../testdata/deadlinedate-api.json";

test.describe(
  "Verify the deadline date API",
  { tag: "@Smoke @Regression @deadlinedate" },
  () => {
    // variable used to store the filter id and use it across the tests under this describe
    let apiResponse, apiResponseBody;
    // API endpoint URL
    const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
    const historicalEndpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
    Utility.logIt(endpointURL);

    test("Verify if the user is able to see the deadlinedate", async ({
      request,
    }) => {
      //Making a get request to fetch the deadline date
      await test.step("Make a Get Request to get the deadline date", async () => {
        //API Request
        Utility.logIt("Make a Get Request to get the deadline date");
        apiResponse = await request.get(endpointURL, {
          params: {
            ...testdata.queryParams,
          },
        });

        await Utility.assertAndLog(apiResponse);
      });

      //Date Assertion
      await test.step("Verify the deadline date received", async () => {
        //Getting historical data in a variable
        let responseData = await UfmUtility.GetHistorical("RX", request);

        //checking whether the historical data is null or not
        if (responseData["row_data"] === null) {
          // appending z to the date string from the response to make it time format as it is missing from the response
          let actualDate = new Date(apiResponseBody.date + "Z");

          // from the array of deadline dates for the whole year, find the next upcoming date
          let strExpdate = await Utility.getUpcomingForecastSubmissionDate(
            testdata.expected_reponse
          );

          //Comparing the actual aand expecetd dates
          Utility.logIt(`Checking if the deadline date is  :  ${strExpdate}`);
          expect(actualDate).toStrictEqual(strExpdate);
        }
      });
    });
  }
);
