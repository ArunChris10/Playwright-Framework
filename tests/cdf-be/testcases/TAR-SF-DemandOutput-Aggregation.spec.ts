import { test, expect } from "../../common/fixtures/test-hook"
import { CdfUtility } from "../fixtures/cdf-utils";
import { debug } from "debug"

import type {
    GetDemandScenarioForecastResponse,
    Department,
    Channel,
    SBU,
} from "../types/get-demand-scenario-forecast-response";

import { metricToTest, payloads } from '../testdata/demand-output-aggregation.json'

test.describe.configure({ mode: 'parallel' })
test.describe(
    "Demand Output Aggregation API tests",
    { tag: '@Regression @ibg-service-scenario-financials @DSS @DemandOutputAggregation'},
    () => {
        let demandId: string
        let sbuForecast: GetDemandScenarioForecastResponse<SBU>

        type objectWithDate = { year: number, month: number }
        const getDateKey = ({year, month}: objectWithDate) => `${year}-${month}`

        test.beforeAll(async ({ request }) => {
            demandId = await CdfUtility.createScenario(request);
            sbuForecast = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                request, demandId
            ) as GetDemandScenarioForecastResponse<SBU>
        })

        test.afterAll(async ({ request }) => {
            await CdfUtility.deleteScenario(request, demandId)
        })

        test("Verify that the sum of department values equals the SBU total", async ({ request }) => {
            let departmentForecast: GetDemandScenarioForecastResponse<Department>
            const summedDepartments: Map<string, Map<string, number>> = new Map()

            await test.step("Fetch the demand output data", async () => {
                departmentForecast = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                    request,
                    demandId,
                    payloads.departmentPayloadExtension
                ) as GetDemandScenarioForecastResponse<Department>
            })

            await test.step("Compute the sum of department values for each month", () => {
                for (const department of departmentForecast.forecast) {
                    department.forecast.forEach((forecast) => {
                        const date = getDateKey(forecast)
                        if (summedDepartments.has(department.sbu)) {
                            const monthlySums = summedDepartments.get(department.sbu)
                            if (monthlySums.has(date)) {
                                const prevSum = monthlySums.get(date)
                                monthlySums.set(date, prevSum + forecast[metricToTest])
                            } else {
                                monthlySums.set(date, forecast[metricToTest])
                                summedDepartments.set(department.sbu, monthlySums)
                            }
                        } else {
                                summedDepartments.set(
                                    department.sbu,
                                    new Map([
                                        [ date, forecast[metricToTest] ]
                                    ])
                                )
                        }
                    })
                }
            })

            await test.step("Assert that department and SBU totals are equal for each month", () => {
                sbuForecast.forecast.forEach((sbu) => {
                    const monthlyDepartmentTotals = summedDepartments.get(sbu.sbu)
                    sbu.forecast.forEach(( monthTotal ) => {
                        const date = getDateKey(monthTotal)
                        const departmentSum = monthlyDepartmentTotals.get(date)
                        const sbuTotal = monthTotal[metricToTest]

                        debug.log(
                            `\nMonthly SBU (${sbu.sbuDisplayName}) totals for metric '${metricToTest} for ${monthTotal.month}-${monthTotal.year}:': \n`,
                            `SBU Total: ${sbuTotal}\n`,
                            `Department total: ${departmentSum}\n\n`,
                            '-'.repeat(15)
                        )

                        expect(Math.round(departmentSum * 100) / 100)
                            .toBe(Math.round(sbuTotal * 100) / 100)
                    })
                })
            })
        })

        test("Verify that the sum of SBU values equals the Channel Total", async ({ request }) => {
            let channelForecast: GetDemandScenarioForecastResponse<Channel>
            let sbuForecasts: {
                baseChannel: string,
                response: GetDemandScenarioForecastResponse<SBU>
            }[]
            const summedSbus: Map<string, Map<string, number>> = new Map()

            await test.step("Fetch the demand output data", async () => {
                channelForecast = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                    request,
                    demandId,
                    payloads.channelPayloadExtension
                ) as GetDemandScenarioForecastResponse<Channel>

                sbuForecasts = await Promise.all(channelForecast.forecast.map(async ({ baseChannel, baseChannelId }) => {
                    const baseChannelAndId = {
                        baseChannel: [ baseChannel ],
                        baseChannelIds: [ baseChannelId ],
                    }
                    const fromChannelSbuPayloadExtension = {
                        ...baseChannelAndId,
                        loadHeirarchyParams: {
                            ...baseChannelAndId,
                        }
                    }

                    return {
                        baseChannel: baseChannel,
                        response: await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                            request,
                            demandId,
                            fromChannelSbuPayloadExtension
                        ) as GetDemandScenarioForecastResponse<SBU>
                    }
                }))
            })

            await test.step("Compute the sum of SBU values for each month", () => {
                for (const { baseChannel, response } of sbuForecasts) {
                    const sbuSum: Map<string, number> = new Map()
                    const sbuForecast = response.forecast

                    for (const sbu of sbuForecast) {
                        sbu.forecast.forEach((monthTotal) => {
                            const date = getDateKey(monthTotal)
                            if (sbuSum.has(date)) {
                                const previousSum = sbuSum.get(date)
                                sbuSum.set(date, previousSum + monthTotal[metricToTest])
                            } else {
                                sbuSum.set(date, monthTotal[metricToTest])
                            }
                        })
                    }

                    summedSbus.set(baseChannel, sbuSum)
                }
            })

            await test.step("Assert that Channel and SBU totals are equal", () => {
                for (const channel of channelForecast.forecast ) {
                    const monthlySbuTotals = summedSbus.get(channel.baseChannel)
                    channel.forecast.forEach((channelForecast) => {
                        const sbuSum = monthlySbuTotals.get(getDateKey(channelForecast))
                        const channelTotal = channelForecast[metricToTest]

                        debug.log(
                            `\nMonthly channel (${channel.baseChannel}) totals for metric '${metricToTest}' for ${channelForecast.month}-${channelForecast.year}: \n`,
                            `Channel total: ${channelTotal}\n`,
                            `SBU total: ${sbuSum}\n\n`,
                            '-'.repeat(15)
                        )

                        expect(Math.round(sbuSum * 100) / 100)
                            .toBe(Math.round(channelTotal * 100) / 100)
                    })
                }
            })
        })
    }
)