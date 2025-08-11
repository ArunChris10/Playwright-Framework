import { Corporate } from '../testdata/forecast_cycle.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";

Corporate.forEach(filter => {
    test.describe('Create forecast Cycle', { tag: "@Smoke @createForecastCycle @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {
        let payload = filter
        test.describe.configure({ timeout: 300_000, mode: "serial" })
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test('Verify user can create forecast cycle with corporate date', { tag: "@createForecastCycleCorporate" },
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

                await test.step('Click on Rolling forecast Tab', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnRollingForecastTab()
                })

                await test.step('Validate the nudge message create due date in Rolling forecast page', async () => {
                    await expect(await objpageFactory.ufmPageFactory().currentForecast().isCreateDueDateNudgeMessageDisplayed()).toBeTruthy()
                })

                await test.step('Click on Rolling forecast calendar Tab', async () => {
                    await objpageFactory.ufmPageFactory().currentForecast().clickOnRollingForecastCalendarTab()
                })

                await test.step('Check if cycle already exist in the list', async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString))
                        .toBeFalsy()
                })
                await test.step("Click on Add cycle", async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnAddCycle()
                })

                await test.step("Validate Create Forecast Cycle Opens on clicking Add cycle button", async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCreateForecastCycleModalOpened).toBeTruthy()
                })

                await test.step("Verify User get message when saving without selecting date", async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseDateMessageDisplayed()).toBeTruthy()
                })

                await test.step('Click on save forecast cycle without filling data and validate no effecton clicking', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveForecastCycle()
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseDateMessageDisplayed()).toBeTruthy()
                })

                await test.step('Click on cancel and validate create modal is closed', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnCancel()
                })

                await test.step("Click on Add cycle", async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnAddCycle()
                })

                await test.step("Verify the time zone in CST", async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().validateTimeZoneInCST()
                })

                await test.step("Verify user can select the time format in Am/PM", async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectAMOrPMTimeFormat()
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

                await test.step('Click on Rolling forecast Tab', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnRollingForecastTab()
                })

                await test.step('Validate the nudge message is not displayed in Rolling forecast page', async () => {
                    expect(await objpageFactory.ufmPageFactory().currentForecast().isCreateDueDateNudgeMessageDisplayed()).toBeFalsy()
                })

            })

        test('Verify user can publish a created corporate forecast cycle', { tag: "@publishForecastCycle" }, async () => {

            await test.step('Click on Rolling forecast calendar Tab', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnRollingForecastCalendarTab()
            })

            await test.step('Validate the nudge message for publish due date is displayed in Rolling forecast calendar page', async () => {
                expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isPublishDueDateNudgeMessageDisplayed()).toBeTruthy()
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
                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString, true))
                    .toBeTruthy()

                let property = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                expect(property.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
            })

            await test.step('Click on Rolling forecast Tab', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnRollingForecastTab()
            })

            await test.step(`Validate Corporate Due date message is displayed as ${payload.monthString} ${payload.date} with corresponding year`, async () => {
                let corporateDueDate = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getCorporateDueDateMessage()

                const currentDate = new Date();
                let year = currentDate.getFullYear();

                let corporateDueDateTemplate = `The corporate forecast is due on ${payload.monthString} ${payload.date}, ${year}`

                expect(corporateDueDate).toEqual(corporateDueDateTemplate)
            })
        })

        test('Verify user can delete a corporate forecast cycle', { tag: "@deleteForecastCycle" }, async () => {

            await test.step('Click on Rolling forecast calendar Tab', async () => {
                await objpageFactory.ufmPageFactory().currentForecast().clickOnRollingForecastCalendarTab()
            })
            await test.step('Click on More for the created cycle', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnCycleMoreSettings(payload.date, payload.monthString)
            })

            await test.step('Click on Delete Cycle', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnDeleteCycle()
            })

            await test.step('Click on Cancel in Delete Cycle Modal', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().waitForDeleteCycleModal("visible")
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnCancelModal()
            })

            await await test.step('Validate cycle is not removed list the list of available cycle', async () => {
                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString, true))
                    .toBeTruthy()

                let property = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                await expect(property.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
            })

            await test.step('Click on More for the created cycle', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnCycleMoreSettings(payload.date, payload.monthString)
            })

            await test.step('Click on Delete Cycle', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnDeleteCycle()
            })

            await test.step('Click on Delete Cycle in Modal', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().waitForDeleteCycleModal("visible")
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnDeleteCycleInModal()
            })

            await test.step('Validate cycle is removed list the list of available cycle', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().waitForDeleteCycleModal("hidden")
                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString, false))
                    .toBeFalsy()

                let property = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                expect(property.backgroundColour).toMatch(/rgb(a)?\(0, 0, 0, 0\)/
                )
            })
        })
    })
})