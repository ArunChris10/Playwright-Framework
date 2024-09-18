import { test, expect } from "../../common/fixtures/test-hook"
import { CdfUtility } from "../fixtures/cdf-utils";
import { Utility } from "../../common/fixtures/utils";

import type {
    GetDemandScenarioForecastResponse,
    Department,
    Channel,
    Forecast
} from "../types/get-demand-scenario-forecast-response";

import testData from "../testdata/demand-output-ex-photo.json"

test.describe.configure({ mode: 'parallel' })
test.describe(
    "Demand Output Ex Photo tests",
    { tag: '@Regression @ibg-service-scenario-financials @DemandOutput @DemandOutputExPhoto'},
    () => {
        let demandId: string
        let forecastWithExPhoto: GetDemandScenarioForecastResponse<Channel>

        let etsForecasts: { photoForecasts: Department[], etsTotals: Forecast[] }[]
        let photoTotals: Map<string, number> = new Map()

        test.beforeAll(async ({request}) => {
            await test.step("Create a DSS and get its forecast", async () => {
                demandId = await CdfUtility.createScenario(request);
                forecastWithExPhoto = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                    request,
                    demandId,
                    testData.payloads.channelExtension
                )
            })

            await test.step("Fetch all instances of the ETS SBU and Photo department within the demand output response", async () => {
                etsForecasts = await Promise.all(forecastWithExPhoto.forecast.map(async (channel) => {
                    const photoPayloadExtension = {
                        ...testData.payloads.departmentExtension,
                        baseChannelIds: [ channel.baseChannelId ]
                    }
                    const departments: GetDemandScenarioForecastResponse<Department> = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                        request,
                        demandId,
                        photoPayloadExtension
                    )
                    return {
                        photoForecasts: departments.forecast.filter((department) => department.departmentId === testData.photoDepartment.id),
                        etsTotals: departments?.forecastTotals?.grandTotal?.forecast,
                    }
                }))
            })

            await test.step("Calculate the monthly Photo totals for all channels", () => {
                for (const { photoForecasts} of etsForecasts) {
                    for (const department of photoForecasts) {
                        expect(department.sbuDisplayName).toBe(testData.photoDepartment.sbuDisplayName)
                        expect(department.departmentDisplayName).toBe(testData.photoDepartment.departmentDisplayName)

                        for (const forecast of department.forecast) {
                            const date = Utility.getDateKey(forecast)
                            const prevSum = photoTotals.get(date) || 0
                            photoTotals.set(date, prevSum + forecast[testData.metricToTest])
                        }
                    }
                }
            })
        })

        test.afterAll(async ({request}) => {
            await CdfUtility.deleteScenario(request, demandId)
        })

        test("Verify that ETS Total - Photo value matches ETS Ex Photo values for all channels (and months)", async () => {
            let etsTotals: Map<string, number> = new Map()

            await test.step("Index ETS Totals", async () => {
                for (const etsForecast of etsForecasts) {
                    for (const etsTotal of etsForecast.etsTotals) {
                        const date = Utility.getDateKey(etsTotal)
                        const prevSum = etsTotals.get(date) || 0
                        etsTotals.set(date, prevSum + etsTotal[testData.metricToTest])
                    }
                }
            })

            await test.step('Compare calculated ETS Ex Photo values to actuals in the Demand Output response', () => {
                // const forecastTotals = forecastWithExPhoto.forecast.filter(())
                const etsExPhoto = forecastWithExPhoto.forecastTotals.totalOfExcludingDepartments.filter((excludedDepartments) =>
                    excludedDepartments.sbu === testData.etsExPhotoSbu
                )[0]

                expect(etsExPhoto).toBeDefined()

                for (const exPhotoForecast of etsExPhoto.forecast ) {
                    const date = Utility.getDateKey(exPhotoForecast)
                    const photoTotal = photoTotals.get(date)
                    const etsTotal = etsTotals.get(date)

                    expect(Utility.roundToDecimals(exPhotoForecast[testData.metricToTest]))
                        .toBe(Utility.roundToDecimals(etsTotal - photoTotal))
                }
            })
        })

        test("Verify that Total Ex Photo matches Total value - Total Photo value for all channels (and months)", async () => {
            let grandTotals: Map<string, number> = new Map()

            await test.step("Index Forecast Grand Totals", async () => {
                for (const grandTotal of forecastWithExPhoto.forecastTotals.grandTotal.forecast) {
                    grandTotals.set(Utility.getDateKey(grandTotal), grandTotal[testData.metricToTest])
                }
            })

            await test.step("Compare calculated Total Ex Photo values to actuals in the Demand Output response", () => {
                const totalsExPhoto = forecastWithExPhoto.forecastTotals?.totalAfterExcludingDepartments

                expect(totalsExPhoto).toBeDefined()

                for (const totalExPhoto of totalsExPhoto.forecast) {
                    const date = Utility.getDateKey(totalExPhoto)
                    const photoTotal = photoTotals.get(date)
                    const grandTotal = grandTotals.get(date)

                    expect(Utility.roundToDecimals(totalExPhoto[testData.metricToTest]))
                        .toBe(Utility.roundToDecimals(grandTotal - photoTotal))
                }
            })
        })

        test("Verify that rows ETS Ex Photo and Total Ex Photo are not in Demand Output response when ETS is not in filters", async ({ request }) => {
            let forecastWithoutETS: GetDemandScenarioForecastResponse<Channel>

            await test.step("Get DSS Forecast without ETS within SBU filters", async () => {
                const channelPayloadExtensionWithSbuFilters = {
                    ...testData.payloads.channelExtension,
                    ...testData.payloads.sbuFiltersExtension
                }
                forecastWithoutETS = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                    request,
                    demandId,
                    channelPayloadExtensionWithSbuFilters,
                )
            })

            await test.step("Assert that ETS Ex Photo and Total Ex Photo are not included in the forecast", () => {
                expect(forecastWithoutETS.forecastTotals.totalAfterExcludingDepartments).not.toBeDefined()
                expect(forecastWithoutETS.forecastTotals.totalOfExcludingDepartments).not.toBeDefined()
            })
        })
    }
)
