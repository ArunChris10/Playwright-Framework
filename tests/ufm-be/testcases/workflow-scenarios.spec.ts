import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { WorkflowUtility } from "../fixtures/workflow-utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";

const org = ["SEGMENT"];
let lobName, dim_val_id, scenario_details;

org.forEach((orgName) => {
    test.describe("Verify Scenario Workflow",
        { tag: "@Smoke @Regression" },
        async () => {
            test.describe.configure({ timeout: 3000_000, mode: "serial" });

            test(`Validate User send LOB to BA review and then to Segment Review ${orgName}`, async ({ request }) => {
                await WorkflowUtility.stateChangePreRequisite(
                    orgName,
                    request
                );

                await WorkflowUtility.CreateAndSendToBAReview(orgName, request);
                await WorkflowUtility.checkAndSendForSegmentReview(orgName, request);
            });
            //Validate Change Request
            test('Verify segment is able to do change request and all Lob is change requested ${orgName}', async ({ request }) => {
                // Sending for CR and asserting Segment screen progress tracker to have status as Change requested
                await WorkflowUtility.sendForChangeRequest(orgName, request);
                await WorkflowUtility.validateBAAndForecastStatus(orgName, request, 'All', commonData.Change_Requested);
                console.log("Change request status validated for BA & Forecast")
            });
            test('Validate if one lob is in BA review, another same lob can be sent to ba review, and first is recalled for Org ${orgName}', async ({ request }) => {
                //[scenario_details, dim_val_id, lobName] = await WorkflowUtility.sendBAReviewforSamelob(orgName, request);
                let existingScenarioId, isNewCreated;
                let responseProgTracker = await WorkflowUtility.getProgresstracker(orgName, request);
                let response = responseProgTracker.rowData;
                dim_val_id = response[0].lineOfBusiness;
                lobName = await UfmUtility.getMapping(dim_val_id, "childName");
                [scenario_details, isNewCreated] =
                    await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
                existingScenarioId = scenario_details["scenarioId"];
                await WorkflowUtility.sendToReview(
                    lobName,
                    scenario_details["scenarioId"],
                    scenario_details["scenarioVersion"],
                    commonData.BA_Review,
                    commonData.lob_dim_id,
                    await UfmUtility.getMapping(lobName, "dim_val_id"),
                    request
                );
                Utility.logIt(
                    `BA review submitted for 1st forecast of LOB - ${scenario_details["scenarioId"]}}`,
                );
                //again create a new if not existing forecast of same Lob and send for BA review
                [scenario_details, isNewCreated] =
                    await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
                    await WorkflowUtility.sendToReview(
                        lobName,
                        scenario_details["scenarioId"],
                        scenario_details["scenarioVersion"],
                        commonData.BA_Review,
                        commonData.lob_dim_id,
                        await UfmUtility.getMapping(lobName, "dim_val_id"),
                        request
                    );
                    Utility.logIt(
                        `BA review submitted for another forecast of same LOB - ${scenario_details["scenarioId"]}}`,
                    );

                let refreshResponse = await UfmUtility.getCurrentForecastList(lobName, request);
                for (let refreshResponseRow = 0; refreshResponseRow < refreshResponse.length; refreshResponseRow++) {
                    if ((refreshResponse[refreshResponseRow].scenarioId) == existingScenarioId) {
                        expect(refreshResponse[refreshResponseRow].forecastStatus.statusCode).toBe(commonData.Draft)
                        Utility.logIt("Assertion passed for old BA review record defaulting to Draft")
                        break;
                    }
                }
            });

            // Given 1 record is in BA review (as accomplished in above test INGROW-36375), test recall
            test('Verify user is able to recall scenario from ba review for Org ${orgName}', async ({ request }) => {
                await WorkflowUtility.changeToStatus(
                    lobName,
                    scenario_details["scenarioId"],
                    scenario_details["scenarioVersion"],
                    commonData.Draft,
                    commonData.lob_dim_id,
                    dim_val_id,
                    request
                );
                let response = await WorkflowUtility.getProgresstracker(orgName, request);
                for (let i = 0; i < response.rowData.length; i++) {
                    if (((response.rowData[i].lineOfBusiness) == dim_val_id) && (response.rowData[i].scenarioId) == scenario_details["scenarioId"]) {
                        expect(response.rowData[i].forecastStatus.statusCode).toBe(commonData.Draft)
                    }
                }
            });

        });
});
