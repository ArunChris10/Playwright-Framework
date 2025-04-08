import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import { CoreServicesUtility } from "../fixtures/coreServices-utils";
import { request } from "http";
import common from "mocha/lib/interfaces/common";

const org = ["HEALTH & WELLNESS"];
const lob = ["OPTICAL", "RX"];
let lobName, dim_val_id, scenario_details;
let isDefaulted = false;
let response;

lob.forEach((lobName) => {
    test.describe(
        "Verify Core Services scenarios",
        { tag: "@Smoke @Regression" },
        async () => {
            test.describe.configure({ timeout: 600_000, mode: "parallel" });

            test(`IBGROW-36379_Validate multiple LOB forecast creation ${lobName}`, async ({ request }) => {
                await ForecastUtility.createForecast(
                    lobName,
                    request
                );
            });
        }
    );
});

org.forEach((orgName) => {
    test.describe("Verify Scenario Workflow",
        { tag: "@Smoke @Regression @nidhi" },
        async () => {
            test.describe.configure({ timeout: 3000_000, mode: "serial" });

            test(`IBGROW-36378_IBGROW-36374_Validate User send LOB to BA review and then to Segment Review ${orgName}`, async ({ request }) => {
                isDefaulted = await CoreServicesUtility.stateChangePreRequisite(
                    orgName,
                    request
                );

                await CoreServicesUtility.CreateAndSendToBA(orgName, request);
                await CoreServicesUtility.checkAndSendForSegmentReview(orgName, request);
            });
            

        });
});

org.forEach((orgName) => {
    test.describe("Verify Scenario Workflow for end to end segment submission",
        { tag: "@Regression @rahul" },
        async () => {
            test.describe.configure({ timeout: 3000_000, mode: "serial" });

            test(`IBGROW-36149_Verfiy segment user is able to submit to corporate ${orgName}`, async ({ request }) => {
                        Utility.logIt(`Checking whether the ${orgName} is in segment review or not`);
                        response = await CoreServicesUtility.getProgresstracker("Segment_Finance", request);
                        let isInSegmentReview = false;     
                        response.rowData.forEach(async curRow => {
                            if (curRow.forecastStatus.statusCode == commonData.Segment_Review && !isInSegmentReview && curRow.organization){
                            console.log("Found Segment Review, performing Change Request for org: " + orgName)
                            await CoreServicesUtility.sendForChangeRequest(orgName,request);
                            await CoreServicesUtility.validateBAAndForecastStatus(orgName, request, 'All', commonData.Change_Requested);
                            console.log("Change request status validated for Segment_Finance")
                            await CoreServicesUtility.validateBAAndForecastStatus(orgName, request, 'All', commonData.Change_Requested);
                            console.log("Change request status validated for BA & Forecast")
                            Utility.logIt(`${orgName} is in segment review `);
                            isInSegmentReview = true;
                            }
                        });                        

                        await CoreServicesUtility.CreateAndSendToBA(orgName,request);
                        await CoreServicesUtility.checkAndSendForSegmentReview(orgName, request);
            });           

        });
});
