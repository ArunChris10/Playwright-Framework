import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { WorkflowUtility } from "../fixtures/workflow-utils";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";

const orgForSendingReview = "DEMAND";
let dataForBAOverride = ["HOME OFFICE", "SEGMENT"]; // Give LOB & it's Org Name
let dataForBARecall = ["RX", "HEALTH & WELLNESS"]; // Give LOB & it's Org Name
const orgForChnageReq = ["MERCHANDISING OPERATIONS"];

test.describe("Verify Scenario Workflow",
    { tag: "@Smoke @Regression @scenario_workflow" },
    async () => {
        test.describe.configure({ timeout: 3000_000, mode: "parallel" });

        test(`Validate Workflow of LoB to BA Review, the Segment Review and Segment performs CR for Org- ${orgForSendingReview}`, async ({ request }) => {
            let crValidated = await WorkflowUtility.stateChangePreRequisite(
                orgForSendingReview,
                request
            );
            await WorkflowUtility.CreateAndSendToBAReview(orgForSendingReview, request);
            await WorkflowUtility.checkAndSendForSegmentReview(orgForSendingReview, request);
            if (crValidated == true) {
                Utility.logIt("Change Request validated successfully");
            }
            else {
                await WorkflowUtility.sendForChangeRequest(orgForSendingReview, request);
                await WorkflowUtility.validateBAAndForecastStatus(orgForSendingReview, request, 'All', commonData.Change_Requested);
            }
        });


        test(`Validate if one lob is in BA review, another same lob can be sent to ba review, and first is recalled for LoB- ${dataForBAOverride[0]}`, async ({ request }) => {
            await WorkflowUtility.stateChangePreRequisite(
                dataForBAOverride[1],
                request
            );
            let lobName = dataForBAOverride[0];
            let existingScenarioId, isNewCreated, scenario_details;
            [scenario_details, isNewCreated] =
                await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
            existingScenarioId = scenario_details["scenarioId"];
            await WorkflowUtility.changeToStatus(
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
            await WorkflowUtility.changeToStatus(
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

        test(`Verify user is able to recall scenario from ba review for LoB- ${dataForBARecall[0]}`, async ({ request }) => {
            let lobName = dataForBARecall[0];
            let orgName = dataForBARecall[1];
            let scenario_details;
            await WorkflowUtility.stateChangePreRequisite(
                orgName,
                request
            );
            [scenario_details] =
                await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
            let dim_val_id = await UfmUtility.getMapping(lobName, "dim_val_id");
            await WorkflowUtility.changeToStatus(
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
                commonData.BA_Review,
                commonData.lob_dim_id,
                dim_val_id,
                request
            );
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

    orgForChnageReq.forEach((orgName) => {
        test.describe("Verify Change Request Scenario Workflow",
            { tag: "@Smoke @Regression @pallavi" },
            async () => {
                test.describe.configure({ timeout: 3000_000, mode: "serial" });
    
                test(`Verify BA user is able to change request LOB scenario ${orgName}`, async ({ request }) => {
                 await WorkflowUtility.ChangeRequestFromBAPreRequisite(orgName,request);
    
                 console.log(`Submit ${orgName} LOB to Change Request from BA screen`);
                 await WorkflowUtility.sendToChangeRequestFromBA(orgName,request);
    
                });
    
    
            });
    });