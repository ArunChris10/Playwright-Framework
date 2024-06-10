import { testData } from '../testdata/forecast_cycle.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";

testData.forEach(filter => {
    test.describe('Create forecast Cycle', { tag: "@Smoke @organizationForecastCycle" }, async () => {
        let payload = filter
        test.describe.configure({ timeout: 300_000, mode: "serial" })
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })
        test.afterAll(async () => {
            await test.step('Delete all available cycle', async () => {
                await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().deleteAllCycles()
            })
        })
        test('Verify user can create forecast cycle with corporate date', { tag: "@createForecastCycleOrganization" },
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

                await test.step("Click on Add cycle", async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnAddCycle()
                })

                await test.step("Validate Create Forecast Cycle Opens on clicking Add cycle button", async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCreateForecastCycleModalOpened).toBeTruthy()
                })

                await test.step(`Select ${payload.date} from ${payload.monthString} Month as corporate date`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectCalendarDate(payload.date, payload.month)
                })

                await test.step('Select Yes to set organization date', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().setOrganizationRadioButton("Yes")
                })

                await test.step('Click on Save and Set next due date', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveSetNextDueDate()
                })

                await test.step('Click on save forecast cycle without filling data and validate no effect on clicking', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveForecastCycle()
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseDateMessageDisplayed()).toBeTruthy()
                })
                await test.step('Click on cancel', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnCancel()
                })

                await test.step('Validate cancelled corporate date cycle is not present in the cycle list', async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString))
                        .toBeFalsy()
                })
                await test.step("Click on Add cycle", async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnAddCycle()
                })

                await test.step(`Select ${payload.date} from ${payload.monthString} Month as corporate date`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectCalendarDate(payload.date, payload.month)
                })

                await test.step('Validate selected Corporate due date is displayed in the cycle creation dialog box', async () => {
                    let calendarDateText = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getCorporateCalendarDateText()
                    expect(calendarDateText).toMatch(new RegExp(`${payload.monthString} ${payload.date}, \\d+`))
                })
                await test.step('Select Yes to set organization date', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().setOrganizationRadioButton("Yes")
                })

                await test.step('Click on Save and Set next due date', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveSetNextDueDate()
                })

                await test.step(`Select ${payload.orgDueDate} from ${payload.OrgMonthString} Month as corporate date`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectCalendarDate(payload.orgDueDate, payload.orgDueMonth)
                })

                await test.step('Validate selected org due date is displayed in the cycle creation dialog box', async () => {
                    let calendarDateText = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getOrganizationCalendarDateText()
                    expect(calendarDateText).toMatch(new RegExp(`${payload.OrgMonthString} ${payload.orgDueDate}, \\d+`))
                })

                await test.step('Click on save forecast cycle and validate create cycle modal is closed', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveForecastCycle()
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseDateMessageDisplayed()).toBeFalsy()
                })

                await test.step('Validate created cycle is added to the list of available cycle', async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString, true))
                        .toBeTruthy()

                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isOrgCycleExists('all', payload.orgDueDate, payload.OrgMonthString, true))
                        .toBeTruthy()

                })

                await test.step('Validate created corporate date is highlighted blue in calendar', async () => {
                    let corpDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                    expect(corpDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
                    expect(corpDueDateProperty.border).toMatch(/rgb(a)?\(255, 255, 255/)
                })
                await test.step('Validate created organization date is highlighted with yellow border  in calendar', async () => {
                    let orgDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.orgDueDate, payload.orgDueMonth)
                    expect(orgDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 0, 0/)
                    expect(orgDueDateProperty.border).toMatch(/rgb(a)?\(255, 194, 32/)
                })

            })

        test('Verify user can publish a created corporate forecast cycle', { tag: "@publishForecastCycle" }, async () => {


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
                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString, true))
                    .toBeTruthy()

                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isOrgCycleExists('all', payload.orgDueDate, payload.OrgMonthString, true))
                    .toBeTruthy()
            })

            await test.step('Validate created corporate date is highlighted blue in calendar', async () => {
                let corpDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                expect(corpDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
                expect(corpDueDateProperty.border).toMatch(/rgb(a)?\(255, 255, 255/)
            })
            await test.step('Validate created organization date is highlighted with yellow border  in calendar', async () => {
                let orgDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.orgDueDate, payload.orgDueMonth)
                expect(orgDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 0, 0/)
                expect(orgDueDateProperty.border).toMatch(/rgb(a)?\(255, 194, 32/)
            })
        })

    })
})