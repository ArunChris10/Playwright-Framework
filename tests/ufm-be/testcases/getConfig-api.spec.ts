import { test, expect } from '../../common/fixtures/test-hook';
import testdatafile from "../testdata/getConfig.json";
import debug from "debug";

test.describe("Verify the @getConfig API @Regression", () => {
    let responseBody;
    const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.endpoint}`;
    debug.log(endpointURL);
    testdatafile.config.forEach(config_payload => {
        test("Verify if the api is returning " + config_payload.type + " configurations", async ({ request }) => {
            //post request for the get config  
            await test.step("Make a Post Request for getting " + config_payload.type + "  configs", async () => {
                debug.log("Make a Post Request for getting  " + config_payload.type + " configs");
                responseBody = await request.post(endpointURL, {
                    data: config_payload.query
                })
                expect(responseBody).toBeOK();
                debug.log(JSON.stringify(responseBody));
                responseBody = JSON.parse(await responseBody.text());
            });
            //Assertion
            await test.step("Check if the response has  " + config_payload.type + " config", async () => {
                expect(responseBody).toEqual(config_payload.expected_response)
            });
        });
    });
})
