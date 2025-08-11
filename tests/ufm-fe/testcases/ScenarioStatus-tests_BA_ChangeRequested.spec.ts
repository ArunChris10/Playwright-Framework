import { expect, test } from '../../common/fixtures/test-hook';
import forecast from '../testdata/forecast.json';
import { PageFactory } from '../../common/pages/page-factory';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import commonData from "../../ufm-be/constants/common.json"



test.describe('Verify user is able to update forecast status', { tag: "@Smoke @ForecastStatus @changeRequested @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, () => {

    let objpageFactory: PageFactory;
    let forecastName
    let scenarioId_1
    let scenarioId_2
    let workflowStatus
    let forecastStatus
    let scenario_details_1
    let scenario_details_2
    test.describe.configure({ timeout: 1200_000, mode: "serial" })

    let testdata = forecast.Optical

    test.beforeAll(async ({ pageFactory, request }) => {
        objpageFactory = pageFactory;
        scenarioId_1 = await ForecastUtility.createForecast(testdata.LobName.toUpperCase(), request);

        let currentForecast_1 = await UfmUtility.getCurrentForecastList(
            testdata.LobName,
            request
        );

        scenarioId_2 = await ForecastUtility.createForecast(testdata.LobName.toUpperCase(), request);

        let currentForecast_2 = await UfmUtility.getCurrentForecastList(
            testdata.LobName,
            request
        );

        scenario_details_1 = await UfmUtility.getScenarioDetails(
            currentForecast_1,
            scenarioId_1
        );

        scenario_details_2 = await UfmUtility.getScenarioDetails(
            currentForecast_2,
            scenarioId_2
        );



    })

    test.afterAll(async ({ request }) => {
        await ForecastUtility.deleteForecast(
            scenario_details_1["scenarioId"],
            scenario_details_1["scenarioVersion"],
            commonData.ba_dim_id,
            await UfmUtility.getMapping(testdata.LobName, "dim_val_id"),
            request
        );

        await ForecastUtility.deleteForecast(
            scenario_details_2["scenarioId"],
            scenario_details_2["scenarioVersion"],
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
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId_1)

            expect(forecastStatus).toEqual("Draft")
        })

        await test.step('Clicks on three dots of scenario', async () => {

            forecastName = await objpageFactory.ufmPageFactory().currentForecast().clickOnParticularForecastEllipses(scenario_details_1["name"])
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
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToStart("sendToReview", scenarioId_1)
        })

        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToComplete("sendToReview", scenarioId_1)
        })

        await test.step(`Validate the scenario status is updated as ${testdata.LobName} Review`, async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId_1)

            expect(forecastStatus).toEqual(`${testdata.sbaName} Review`)
        })

        await test.step(`Validate the alert banner message reflects correct workflow status`, async () => {
            workflowStatus = await objpageFactory.ufmPageFactory().currentForecast().validateWorflowAlertMessage("sent for review", scenario_details_1["name"])

            expect(workflowStatus).toBeTruthy()
        })

    })

    test(`Check if the user is able to send a new scenario to review when another scenario is already in review for LOB: ${testdata.sbaName}`, { tag: "@sendToReview" }, async () => {

        await test.step("Verify newly created scenario status is draft", async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId_2)

            expect(forecastStatus).toEqual("Draft")
        })

        await test.step('Go To UFM Page' + testdata.sbaName, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on ${forecast.DataVentures.nameOfTheSBA} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(testdata.sbaName);
        })

        await test.step('Clicks on three dots of scenario', async () => {

            forecastName = await objpageFactory.ufmPageFactory().currentForecast().clickOnParticularForecastEllipses(scenario_details_2["name"])
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
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToStart("sendToReview", scenarioId_2)
        })

        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToComplete("sendToReview", scenarioId_2)
        })

        await test.step(`Validate the scenario status is updated as ${testdata.LobName} Review`, async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId_2)

            expect(forecastStatus).toEqual(`${testdata.sbaName} Review`)
        })

        await test.step(`Validate the alert banner message reflects correct workflow status`, async () => {
            workflowStatus = await objpageFactory.ufmPageFactory().currentForecast().validateWorflowAlertMessage("sent for review", scenario_details_2["name"])

            expect(workflowStatus).toBeTruthy()
        })

        await test.step("Validate the other scenario status changes to draft", async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId_1)

            expect(forecastStatus).toEqual("Draft")
        })

    })


    test.only(`Send back scenario from org review to LOB: ${testdata.sbaName}`, { tag: "@changeRequested" }, async () => {


        await test.step("Click on send back to LOB using progress table", async () => {
            await objpageFactory.ufmPageFactory().currentForecast().sendBackToOrg(testdata.LobName)
        })

        await test.step("Click send in send back to LOB modal", async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnSendButton()
        })

        await test.step('Go To UFM Page' + testdata.sbaName, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })

        await test.step("Wait until scenario status changes to sending for review %", async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToStart("sendBack", scenarioId_2)
        })

        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToComplete("sendBack", scenarioId_2)
        })

        await test.step(`Validate the scenario status is updated as changeRequested `, async () => {
            forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(scenarioId_2)

            expect(forecastStatus).toEqual(`Change requested`)
        })
    })


});
