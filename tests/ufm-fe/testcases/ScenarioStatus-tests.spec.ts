import { expect, test } from '../../common/fixtures/test-hook';
import forecast from '../testdata/forecast.json';
import { PageFactory } from '../../common/pages/page-factory';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import commonData from "../../ufm-be/constants/common.json"



test.describe('Verify user is able to update forecast status', { tag: "@Smoke @ForecastStatus" }, () => {

    let objpageFactory: PageFactory;
    let forecastName
    let scenarioId
    let workflowStatus
    let forecastStatus
    let scenario_details
    test.describe.configure({ timeout: 800_000, mode: "serial" })

    let testdata = forecast.Optical

    test.beforeAll(async ({ pageFactory, request }) => {
        objpageFactory = pageFactory;
        scenarioId = await ForecastUtility.createForecast(testdata.LobName.toUpperCase(), request);

        let currentForecast = await UfmUtility.getCurrentForecastList(
            testdata.LobName,
            request
        );

        scenario_details = await UfmUtility.getScenarioDetails(
            currentForecast,
            scenarioId
        );

    })

    test.afterAll(async ({ request }) => {
        await ForecastUtility.deleteForecast(
            scenario_details["scenarioId"],
            scenario_details["scenarioVersion"],
            commonData.ba_dim_id,
            await UfmUtility.getMapping(testdata.LobName, "dim_val_id"),
            request
        );
    })



    test(`Check if the user is able to send forecast to review for LOB: ${testdata.LobName}`, { tag: "@sendToReview" }, async () => {

        test.setTimeout(480000);

        await test.step('Go To UFM Page' + testdata.sbaName, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on ${forecast.DataVentures.nameOfTheSBA} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(testdata.sbaName);
        })

        await test.step("Verify newly created scenario status is draft", async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId)

            expect(forecastStatus).toEqual("Draft")
        })

        await test.step('Clicks on three dots of first scenario', async () => {

            forecastName = await objpageFactory.ufmPageFactory().currentForecast().clickOnParticularForecastEllipses(scenario_details["name"])
        });

        await test.step('Clicks on the send to organization review button' + testdata.LobName, async () => {

            await objpageFactory.ufmPageFactory().currentForecast().clickOnSendToReview(testdata.sbaName);
        });

        await test.step(`Validate the header and description of Send to review modal for LOB: ${testdata.LobName}`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().validateSendToReviewModal(testdata.LobName)
        })

        await test.step(`Click on Send in send to review modal`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnSendButton()
        })

        await test.step("Wait until scenario status changes to sending for review %", async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToStart("sendToReview", scenarioId)
        })

        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToComplete("sendToReview", scenarioId)
        })

        await test.step(`Validate the scenario status is updated as ${testdata.LobName} Review`, async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId)

            expect(forecastStatus).toEqual(`${testdata.sbaName} Review`)
        })

        await test.step(`Validate the alert banner message reflects correct workflow status`, async () => {
            workflowStatus = await objpageFactory.ufmPageFactory().currentForecast().validateWorflowAlertMessage("sent for review", scenario_details["name"])

            expect(workflowStatus).toBeTruthy()
        })

    })

    test(`Check if the user is able to recall forecast from review LOB: ${testdata.sbaName}`, { tag: "@recallForecast" }, async () => {

        await test.step('Clicks on three dots of first scenario', async () => {
            forecastName = await objpageFactory.ufmPageFactory().currentForecast().clickOnParticularForecastEllipses(scenario_details["name"])
        });

        await test.step('Clicks on the Recall forecast ' + testdata.sbaName, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnRecallForecast();
        });

        await test.step(`Validate the header and description of Recall forecast modal for LOB: ${testdata.sbaName}`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().validateRecallForecastModal(testdata.sbaName)
        })

        await test.step(`Click on Recall forecast to review modal`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnRecallButton()
        })

        await test.step("Wait until scenario status changes to Recalling forecast %", async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToStart("recall", scenarioId)

        })

        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToComplete("recall", scenarioId)
        })

        await test.step(`Validate the scenario status is updated as draft for ${testdata.sbaName} after recall`, async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId)
            expect(forecastStatus).toEqual(`Draft`)
        })

        await test.step(`Validate the alert banner message reflects correct workflow status`, async () => {
            workflowStatus = await objpageFactory.ufmPageFactory().currentForecast().validateWorflowAlertMessage("recalled", scenario_details["name"])

            expect(workflowStatus).toBeTruthy()
        })

    })
});
