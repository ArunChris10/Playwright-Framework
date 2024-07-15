import { Corporate } from '../testdata/forecast_cycle.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";

Corporate.forEach(cycle => {
    test.describe('Create and Edit Corporate forecast Cycle', { tag: "@Smoke @editCorpForecastCycle" }, async () => {
        let payload = cycle
        test.describe.configure({ timeout: 300_000, mode: "serial" })
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test('Verify user can edit forecast cycle with corporate date', { tag: "@editForecastCycleCorporate" },
            async () => {

                test.setTimeout(300000);

                await test.step('Go To UFM Page', async () => {
                    await objpageFactory.ufmPageFactory().organisationSelection().navigate();
                })
                await test.step(`Click on ${payload.sbaName} Organization`, async () => {
                    await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(payload.sbaName);
                })
                await test.step('Click on Rolling forecast calendar Tab', async () => {
                    await objpageFactory.ufmPageFactory().currentForecast().clickOnRollingForecastCalendarTab()
                })

                await test.step('Delete all available cycle', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().deleteAllCycles()
                })

                await test.step('Check if cycle already exist in the list', async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString))
                        .toBeFalsy()
                })

                await test.step("Click on Add cycle", async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnAddCycle()
                })

                await test.step('Select no to set organization date', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().setOrganizationRadioButton("No")
                })

                await test.step(`Select ${payload.date} from ${payload.monthString} Month as corporate date`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectCalendarDate(payload.date, payload.month)
                })

                await test.step('Click on save forecast cycle and validate create cycle modal is closed', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveForecastCycle()
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseDateMessageDisplayed()).toBeFalsy()
                })

                await test.step('Validate created cycle is added to the list of available cycle', async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString, true))
                        .toBeTruthy()

                    let property = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                    expect(property.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
                })

                await test.step('Click on More for the created cycle', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnCycleMoreSettings(payload.date, payload.monthString)
                })

                await test.step('Click on Edit cycle', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnEditCycle()
                })

                await test.step('Validate the header text of the Edit cycle card', async () => {
                    let cycleHeaderText = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getCycleCardHeaderText()
                    expect(cycleHeaderText).toEqual('Edit Forecast Cycle')
                })

                await test.step(`Select ${payload.date} from ${payload.monthString} Month as edited corporate date`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectCalendarDate(payload.editDate, payload.month)
                })

                await test.step('Click on save forecast cycle and validate create cycle modal is closed', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveForecastCycle()
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseDateMessageDisplayed()).toBeFalsy()
                })

                await test.step('Validate created cycle is added to the list of available cycle', async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.editDate, payload.monthString, true))
                        .toBeTruthy()

                    let property = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.editDate, payload.month)
                    expect(property.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
                })



            })

        test('Verify user can publish a edited corporate forecast cycle', { tag: "@publishForecastCycle" }, async () => {

            await test.step('Click on Rolling forecast calendar Tab', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnRollingForecastCalendarTab()
            })

            await test.step('Click on publish rolling forecast calendar', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnPublishCalendar()
            })

            await test.step('Click on Publish Dates in publish modal', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().waitForPublishCalendarModal()

                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnPublishDates()
            })

            await test.step('Cycle should prevail in cycle list after publishing', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().waitForPublishSuccessMessage()
                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.editDate, payload.monthString, true))
                    .toBeTruthy()

                let property = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.editDate, payload.month)
                expect(property.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
            })

            await test.step('Click on Rolling forecast Tab', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnRollingForecastTab()
            })

            await test.step(`Validate Corporate Due date message is displayed as ${payload.monthString} ${payload.editDate} with corresponding year`, async () => {
                let corporateDueDate = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getCorporateDueDateMessage()

                const currentDate = new Date();
                let year = currentDate.getFullYear();

                let corporateDueDateTemplate = `The corporate forecast is due on ${payload.monthString} ${payload.editDate}, ${year}`

                expect(corporateDueDate).toEqual(corporateDueDateTemplate)
            })
        })
    })
})