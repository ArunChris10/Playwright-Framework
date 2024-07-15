import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from "../../common/pages/page-factory";
import testData from "../testdata/demand-output-filters.json"

import type { filterKey, testData as td } from "../types/demand-output-filters";

const { filterCategories, excludedCategories, metrics, figures }: td = testData;

test.describe("Demand Output Tests", { tag: "@Smoke @DemandOutputFilters"}, async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial"})

    const METRIC_WITH_FIGURE_VIEWS = 'GMV Shipped'
    let objPageFactory: PageFactory

    test.beforeEach(async ({ pageFactory }) => {
        objPageFactory = pageFactory
        await objPageFactory.cdfPageFactory().demandWorkspace().navigate()

        await test.step("Open the demand stack scenario", async () => {
            await objPageFactory.cdfPageFactory().demandWorkspace().openFirstDSS()
        })

        await test.step("Wait for the demand output to render", async () => {
            await objPageFactory.cdfPageFactory().dssPage().waitForDemandOutputToBeVisible()
        })
    })

    test.afterAll(async () => {
        await objPageFactory.cdfPageFactory().dssPage().resetDemandOutputFilters()
    })

    test("Verify data is shown as per selected filter", {}, async () => {
        await test.step("Clear any pre-existing filters related to the user", async () => {
            await objPageFactory.cdfPageFactory().dssPage().resetDemandOutputFilters()
        })

        // -- FIGURES -- //
        // Avoids flakiness from any user-stored filter retention for Figure step
        await test.step('Change to Metric where Figures can be applied', async () => {
            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .openFilterModal("metrics")

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyMetric(METRIC_WITH_FIGURE_VIEWS)
        })
        await test.step("Check that Figure filters are applied (Absolute, Millions, etc.)", async () => {
            for (const figure of figures) {
                await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .toggleDemandOutputView(figure.name)

                await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .assertDemandOutputHasUnit(figure.unit)
            }
        })
        // -- FIGURES (end) -- //

        // -- METRICS -- //
        await test.step('Check that Metric filters are applied', async () => {
            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .openFilterModal('metrics')

            for (const metric of metrics) {
                await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .applyMetric(metric.name)

                await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .assertDemandOutputHasUnit(metric.unit)
            }
        })
        // -- METRICS (end) --

        // -- CHANNELS -- //
        await test.step('Change demand output to display channels', async () => {
            await objPageFactory.cdfPageFactory().dssPage().toggleChannelView()
        })


        await test.step('Check that Channel Group filters are applied', async () => {
            const excludedGroupChannelRow = await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .getDemandOutputRow(excludedCategories[0])

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyFilters(filterCategories.channelGroups, 'channelGroups')

            await Promise.all(filterCategories.channels.map(async (channel) => {
                const channelRow = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputRow(channel)

                await expect(channelRow).toBeVisible()
            }))

            await expect(excludedGroupChannelRow).toBeHidden()
        })


        await test.step("Check that Channel filters are applied", async () => {
            const excludedChannelGroupCell = await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .getDemandOutputRow(excludedCategories.channels[0])

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyFilters(filterCategories.channels, 'channels')

            await Promise.all(filterCategories.channels.map(async (channel) => {
                const channelRow = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputRow(channel)

                await expect(channelRow).toBeVisible()
            }))

            await expect(excludedChannelGroupCell).toBeHidden()
        })
        // -- CHANNELS (end) -- //

        // -- SBUs/DEPARTMENTS -- //
        await test.step("Change demand output to display SBUs", async () => {
            await objPageFactory.cdfPageFactory().dssPage().toggleSBUView()
        })

        await test.step("Check that SBU filters are applied", async () => {
            const excludedSbuRow = await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .getDemandOutputRow(excludedCategories.sbus[0])

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyFilters(filterCategories.sbus, 'sbus')

            await Promise.all(filterCategories.sbus.map(async (SBU) => {
                const sbuRow = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputRow(SBU)

                await expect(sbuRow).toBeVisible()
            }))

            await expect(excludedSbuRow).toBeHidden()
        })


        await test.step("Check that Department filters are applied", async () => {
            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyFilters(filterCategories.departments, 'departments')

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .expandDemandOutputRows()

            await Promise.all(filterCategories.departments.map(async (department) => {
                const departmentRow = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputRow(department, 'departments')

                await expect(departmentRow).toBeVisible()
            }))

            await Promise.all(excludedCategories.departments.map(async (excludedDepartment) => {
                const departmentRow = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputRow(excludedDepartment, 'departments')

                await expect(departmentRow).toBeHidden()
            }))
        })
        // -- SBUs/Departments (end) -- //

        // -- TIME-SPANS -- //
        await test.step("Reset scroll position", async () => {
            await objPageFactory.utilities().scrollToTop()
        })

        await test.step("Change demand output to display years", async () => {
            await objPageFactory.cdfPageFactory().dssPage().toggleDemandOutputView('year')
        })

        await test.step("Check that Year filters are applied", async () => {
            const excludedYearColumnHeader = await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .getDemandOutputRow(excludedCategories.years[0])

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyFilters(filterCategories.years, 'years')

            await Promise.all(filterCategories.years.map(async (year) => {
                const yearColumnHeader = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputColumnHeader(year)

                await expect(yearColumnHeader).toBeVisible()
            }))

            await expect(excludedYearColumnHeader).toBeHidden()
        })

        await test.step("Change demand output to display quarters", async () => {
            await objPageFactory.cdfPageFactory().dssPage().toggleDemandOutputView('quarter')
        })

        await test.step("Check that Quarter filters are applied", async () => {
            const excludedQuarterColumnHeader = await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .getDemandOutputColumnHeader(excludedCategories.quarters[0], 'quarters')

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyFilters(filterCategories.quarters, 'quarters')

            await Promise.all(filterCategories.quarters.map(async (quarter) => {
                const quarterColumnHeaders = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputColumnHeader(quarter, 'quarters')

                await expect(quarterColumnHeaders).toHaveCount(filterCategories.years.length)
                for (const monthColumnHeader of await quarterColumnHeaders.all()) {
                    await expect(monthColumnHeader).toBeVisible()
                }
            }))

            await expect(excludedQuarterColumnHeader).toBeHidden()
        })


        await test.step("Change demand output to display months", async () => {
            await objPageFactory.cdfPageFactory().dssPage().toggleDemandOutputView('month')
        })

        await test.step("Check that Month filters are applied", async () => {
            const excludedMonthColumnHeader = await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .getDemandOutputColumnHeader(excludedCategories.months[0])

            await objPageFactory
                .cdfPageFactory()
                .dssPage()
                .applyFilters(filterCategories.months, 'months')

            await Promise.all(filterCategories.months.map(async (month) => {
                const monthColumnHeaders = await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .getDemandOutputColumnHeader(month, 'months')

                await expect(monthColumnHeaders).toHaveCount(filterCategories.years.length)
                for (const monthColumnHeader of await monthColumnHeaders.all()) {
                    await expect(monthColumnHeader).toBeVisible()
                }
            }))

            await expect(excludedMonthColumnHeader).toBeHidden()
        })
        // -- TIME-SPANS (end) -- //
    })

    test("Verify filter retention in future visits", { tag: "@DemandOutputFilterRetention" }, async () => {
        await test.step("Check all filters except Quarter and Metric filters are still selected", async () => {
            for (const [ filterKey, filteredCategory ] of Object.entries(filterCategories)) {
                if (filterKey === 'quarters') return // Expected behavior that it's not retained, since months were filtered last
                else await objPageFactory
                    .cdfPageFactory()
                    .dssPage()
                    .assertFilterIsSelected(filteredCategory, filterKey as filterKey)
            }
        })

        await test.step("Check that Metric filter is retained", async () => {
            const retainedMetric = metrics[metrics.length - 1]
            await objPageFactory.cdfPageFactory().dssPage().assertDemandOutputHasUnit(retainedMetric.unit)
        })
    })
})