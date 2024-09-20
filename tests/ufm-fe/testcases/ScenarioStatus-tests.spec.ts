import { expect, test } from '../../common/fixtures/test-hook';
import forecast from '../testdata/forecast.json';
import { PageFactory } from '../../common/pages/page-factory';

test.describe('Verify user is able to update forecast status', { tag: "@Smoke @ForecastStatus" }, () => {

    let objpageFactory: PageFactory;
    let forcastName
    test.describe.configure({ mode: "serial" })
    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    })

    let testdata = forecast.Merch
    test(`Check if the user is able to send forecast to review for LOB: ${testdata.LOB}`, { tag: "@sendToReview" }, async () => {

        test.setTimeout(480000);

        await test.step('Go To UFM Page' + testdata.nameOfTheSBA, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on ${forecast.DataVentures.nameOfTheSBA} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(testdata.nameOfTheSBA);
        })

        await test.step('Clicks on three dots of first scenario', async () => {

            forcastName = await objpageFactory.ufmPageFactory().currentForecast().clickOnParticularForecastEllipses(testdata.LOB)
        });

        await test.step('Clicks on the send to organization review button' + testdata.nameOfTheSBA, async () => {

            await objpageFactory.ufmPageFactory().currentForecast().clickOnSendToReview(testdata.nameOfTheSBA);
        });

        await test.step(`Validate the header and description of Send to review modal for LOB: ${testdata.nameOfTheSBA}`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().validateSendToReviewModal(testdata.nameOfTheSBA)
        })

        await test.step(`Click on Send in send to review modal`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnSendButton()
        })

        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitforSendToReviewToComplete(testdata.nameOfTheSBA)
        })

        await test.step(`Validate the scenario status is updated as ${testdata.nameOfTheSBA} Review`, async () => {
            let forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(forcastName)

            expect(forecastStatus).toEqual(`${testdata.nameOfTheSBA} Review`)
        })

    })

    test(`Check if the user is able to recall forecast from review LOB: ${testdata.LOB}`, { tag: "@recallForecast" }, async () => {

        await test.step('Clicks on three dots of first scenario', async () => {
            forcastName = await objpageFactory.ufmPageFactory().currentForecast().clickOnParticularForecastEllipses(testdata.LOB)
        });

        await test.step('Clicks on the Recall forecast ' + testdata.nameOfTheSBA, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnRecallForecast();
        });

        await test.step(`Validate the header and description of Recall forecast modal for LOB: ${testdata.nameOfTheSBA}`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().validateRecallForecastModal(testdata.LOB)
        })

        await test.step(`Click on Recall forecast to review modal`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOnRecallButton()
        })


        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
            await objpageFactory.ufmPageFactory().currentForecast().waitforRecallForecastToComplete(testdata.nameOfTheSBA)
        })

        await test.step(`Validate the scenario status is updated as draft for ${testdata.nameOfTheSBA} after recall`, async () => {
            let forecastStatus = await objpageFactory.ufmPageFactory().currentForecast().getScenarioStatus(forcastName)
            expect(forecastStatus).toEqual(`Draft`)
        })

    })
});