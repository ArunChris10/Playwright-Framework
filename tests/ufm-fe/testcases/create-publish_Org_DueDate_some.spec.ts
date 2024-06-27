import { someOrganization } from '../testdata/forecast_cycle.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";

someOrganization.forEach(data => {
    test.describe('Create forecast Cycle', { tag: "@Smoke @organizationForecastCycle @organizationForecastCycleSome" }, async () => {
        let payload = data
        test.describe.configure({ timeout: 300_000, mode: "serial" })
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
        })

        test('Verify user can create forecast cycle with corporate and organization due date date', { tag: "@createForecastCycleSomeOrganization" },
            async () => {

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

                await test.step('Validate choose organization message is not displayed for All org selection', async () => {
                    expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseOrgMessageDisplayed()).toBeFalsy()
                })
                await test.step('Click on "some" in organization assignment section', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectOrganizationAssignment('Some')
                })

                await test.step('Validate choose organization message is not displayed after clicking some organization', async () => {
                    expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseOrgMessageDisplayed(true)).toBeTruthy()
                })


                await test.step(`Select ${payload.LOBSBAName} as Organization}`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectOrganization(payload.LOBSBAName)
                })
                await test.step(`Select ${payload.orgDueDate} from ${payload.OrgMonthString} Month as corporate date`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectCalendarDate(payload.orgDueDate, payload.orgDueMonth)
                })

                await test.step('Validate selected org due date is displayed in the cycle creation dialog box', async () => {
                    let calendarDateText = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getOrganizationCalendarDateText()
                    expect(calendarDateText).toMatch(new RegExp(`${payload.OrgMonthString} ${payload.orgDueDate}, \\d+`))
                })

                await test.step('Click on Save and Set next due date', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveSetNextDueDate()
                })

                await test.step(`Select ${payload.LOBSBAName} as Organization}`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectOrganization("All remaining organizations")
                })

                await test.step(`Select ${payload.orgDueDate2} from ${payload.OrgMonthString} Month as corporate date for all remaining organization`, async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().selectCalendarDate(payload.orgDueDate2, payload.orgDueMonth)
                })
                await test.step('Click on save forecast cycle and validate create cycle modal is closed', async () => {
                    await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().clickOnSaveForecastCycle()
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isChooseDateMessageDisplayed()).toBeFalsy()
                })

                await test.step('Validate created cycle is added to the list of available cycle', async () => {
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isCycleExists(payload.date, payload.monthString, true))
                        .toBeTruthy()

                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isOrgCycleExists(payload.LOBSBAName, payload.orgDueDate, payload.OrgMonthString, true))
                        .toBeTruthy()
                    await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isOrgCycleExists('all', payload.orgDueDate2, payload.OrgMonthString, true))
                        .toBeTruthy()

                })

                await test.step('Validate created corporate date is highlighted blue in calendar', async () => {
                    let corpDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                    expect(corpDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
                    expect(corpDueDateProperty.border).toMatch(/rgb(a)?\(255, 255, 255/)
                })
                await test.step('Validate created organization date is highlighted with yellow border  in calendar', async () => {
                    let orgDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.orgDueDate, payload.orgDueMonth)
                    let orgDueDateProperty2 = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.orgDueDate2, payload.orgDueMonth)
                    expect(orgDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 0, 0/)
                    expect(orgDueDateProperty.border).toMatch(/rgb(a)?\(255, 194, 32/)
                    expect(orgDueDateProperty2.backgroundColour).toMatch(/rgb(a)?\(0, 0, 0/)
                    expect(orgDueDateProperty2.border).toMatch(/rgb(a)?\(255, 194, 32/)
                })

            })

        test('Verify user can publish a created forecast cycle', { tag: "@publishForecastCycle" }, async () => {


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
                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isOrgCycleExists(payload.LOBSBAName, payload.orgDueDate, payload.OrgMonthString, true))
                    .toBeTruthy()
                await expect(await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().isOrgCycleExists('all', payload.orgDueDate2, payload.OrgMonthString, true))
                    .toBeTruthy()
            })

            await test.step('Validate created corporate date is highlighted blue in calendar', async () => {
                let corpDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.date, payload.month)
                expect(corpDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 113, 220/)
                expect(corpDueDateProperty.border).toMatch(/rgb(a)?\(255, 255, 255/)
            })
            await test.step('Validate created organization date is highlighted with yellow border  in calendar', async () => {
                let orgDueDateProperty = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.orgDueDate, payload.orgDueMonth)
                let orgDueDateProperty2 = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getDateProperty(payload.orgDueDate2, payload.orgDueMonth)
                expect(orgDueDateProperty.backgroundColour).toMatch(/rgb(a)?\(0, 0, 0/)
                expect(orgDueDateProperty.border).toMatch(/rgb(a)?\(255, 194, 32/)
                expect(orgDueDateProperty2.backgroundColour).toMatch(/rgb(a)?\(0, 0, 0/)
                expect(orgDueDateProperty2.border).toMatch(/rgb(a)?\(255, 194, 32/)
            })
        })

        test('Verify User can validate some organization due dates as an LOB Inputter', { tag: "@LOBDueDateValidation" }, async () => {


            await test.step('Go To organization selection page', async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().clickOnOrganizationBreadcrumb()
            })
            await test.step(`Click on ${data.LOBSBAName} Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(data.LOBSBAName);
            })

            await test.step(`Validate Corporate and Organization Due date message with corresponding date format`, async () => {
                let corporateDueDate = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getCorporateDueDateMessage()
                let organizationDueDate = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getOrganizationDueDateMessage()

                const currentDate = new Date();
                let year = currentDate.getFullYear();

                let corporateDueDateTemplate = `The corporate forecast is due on ${payload.monthString} ${payload.date}, ${year}`
                let organizationDueDateTemplate = `The organisation forecast submission is due on ${payload.OrgMonthString} ${payload.orgDueDate}, ${year}`

                expect(corporateDueDate.trim()).toEqual(corporateDueDateTemplate.trim())
                expect(organizationDueDate.trim()).toEqual(organizationDueDateTemplate.trim())

            })

            await test.step('Go To organization selection page', async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().clickOnOrganizationBreadcrumb()
            })
            await test.step(`Click on ${data.LOBSBA2Name} Organization`, async () => {
                await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(data.LOBSBA2Name);
            })

            await test.step(`Validate Corporate and Organization Due date message with corresponding date format`, async () => {
                let corporateDueDate = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getCorporateDueDateMessage()
                let organizationDueDate = await objpageFactory.ufmPageFactory().rollingForecastCalendarPage().getOrganizationDueDateMessage()

                const currentDate = new Date();
                let year = currentDate.getFullYear();

                let corporateDueDateTemplate = `The corporate forecast is due on ${payload.monthString} ${payload.date}, ${year}`
                let organizationDueDateTemplate = `The organisation forecast submission is due on ${payload.OrgMonthString} ${payload.orgDueDate2}, ${year}`

                expect(corporateDueDate.trim()).toEqual(corporateDueDateTemplate.trim())
                expect(organizationDueDate.trim()).toEqual(organizationDueDateTemplate.trim())

            })



        })

    })
})