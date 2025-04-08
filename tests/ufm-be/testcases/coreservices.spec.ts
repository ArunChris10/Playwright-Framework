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
        { tag: "@Smoke @Regression" },
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
            //Validate Change Request
            test('IBGROW-36373_Verify segment is able to do change request and all Lob is change requested ${orgName}', async ({ request }) => {
                if (isDefaulted != true) {
                    // Sending for CR and asserting Segment screen progress tracker to have status as Change requested
                    await CoreServicesUtility.sendForChangeRequest(orgName, request);
                    await CoreServicesUtility.validateBAAndForecastStatus(orgName, request, 'All', commonData.Change_Requested);
                    console.log("Change request status validated for BA & Forecast")
                }
                else {
                    expect(isDefaulted).toBe(true);
                    console.log("CR test was already validated as part of Pre-requiiste test")
                }
            });
            test('IBGROW-36375_Validate if one lob is in BA review, another same lob can be sent to ba review, and first is recalled for Org ${orgName}', async ({ request }) => {
                // Bring back from Segment review if present                
                //await CoreServicesUtility.stateChangePreRequisite(orgName, request);
                [scenario_details, dim_val_id, lobName] = await CoreServicesUtility.sendBAReviewforSamelob(orgName, request);
            });

            // Given 1 record is in BA review (as accomplished in above test INGROW-36375), test recall
            test('IBGROW-36377_Verify user is able to send LOB to recall scenario from ba reviewOrg ${orgName}', async ({ request }) => {
                await CoreServicesUtility.changeToStatus(
                    lobName,
                    scenario_details["scenarioId"],
                    scenario_details["scenarioVersion"],
                    commonData.Draft,
                    commonData.lob_dim_id,
                    dim_val_id,
                    request
                );
                let response = await CoreServicesUtility.getProgresstracker(orgName, request);
                for (let i = 0; i < response.rowData.length; i++) {
                    if (((response.rowData[i].lineOfBusiness) == dim_val_id) && (response.rowData[i].scenarioId) == scenario_details["scenarioId"]) {
                        console.log("Found___ Recalled scenario")
                        expect(response.rowData[i].forecastStatus.statusCode).toBe(commonData.Draft)
                    }
                }
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
                        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id");
                        response.rowData.forEach(async curRow => {
                            if (curRow.forecastStatus.statusCode == commonData.Segment_Review && !isInSegmentReview && curRow.organization == segmentReviewDimValId){
                            console.log("Found Segment Review, performing Change Request for org: " + orgName)
                            await CoreServicesUtility.sendForChangeRequest(orgName,request);
                            isInSegmentReview = true;
                            }
                        });                        

                        await CoreServicesUtility.CreateAndSendToBA(orgName,request);
                        await CoreServicesUtility.checkAndSendForSegmentReview(orgName, request);
            });           

        });
});
