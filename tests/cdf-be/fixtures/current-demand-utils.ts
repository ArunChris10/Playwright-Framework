import { APIRequestContext, expect } from "@playwright/test";
import { CdfUtility } from "./cdf-utils";
import { DemandBaseClass } from "./demand-common-utils";
import type {
    organizationalLevel,
    GetDemandScenarioForecastResponse
} from "../types/get-demand-scenario-forecast-response";
import debug from "debug";

import currentDemandData from "../testdata/current-demand-download.json"

export class CurrentDemandUtility {
    static async getCurrentDemandData(request: APIRequestContext, slot: number, organizationalLevel: organizationalLevel):
        Promise<GetDemandScenarioForecastResponse>
    static async getCurrentDemandData(request: APIRequestContext, slot: number, organizationalLevel: organizationalLevel, format: 'csv'):
        Promise<string[][]>
    static async getCurrentDemandData(request: APIRequestContext, slot: number, organizationalLevel: organizationalLevel, format?: 'csv') {
        const suffix = currentDemandData[`${format}EndpointSuffix`] || ''
        const endpointURL = `
            ${process.env.apiBaseURLCDF}${currentDemandData.currentDemandEndpoint}${slot}${suffix}
        `

        const response = await request.post(
            endpointURL, {
                data: { ...currentDemandData.currentDemandPayload, organizationalLevel },
                headers: CdfUtility.headers
            }
        )

        await expect(response).toBeOK()

        if (format === 'csv') {
           return DemandBaseClass.getCSVDataAsArray(response)
        }

        return await response.json()
    }

    static async assertCSVHasDataForAllMonths(csv: string[][]) {
        const expectedCsvMetrics: string[] = currentDemandData.expectedCsvMetrics

        const csvHeaders = DemandBaseClass.getCSVHeadersRecord(csv)
        const csvWithoutHeaderRow = csv.slice(1)

        // Each metric will collect months for which it has data, i.e. GMV Shipped => Set(1, 2, ..., 12)
        const metricMonthsMap: Map<string, Set<number>> = new Map()

        for (const metric of expectedCsvMetrics) {
            for (const csvRow of csvWithoutHeaderRow) {
                const rowMonth = parseInt(csvRow[csvHeaders[currentDemandData.monthHeader]])
                const rowMetricValue = parseFloat(csvRow[csvHeaders[metric]])

                expect(rowMetricValue).toBeDefined()

                if (metricMonthsMap.has(metric)) {
                    const monthsSet = metricMonthsMap.get(metric)
                    monthsSet.add(rowMonth)
                } else {
                    metricMonthsMap.set(metric, new Set([rowMonth]))
                }
            }

            const metricMonthSet = metricMonthsMap.get(metric)

            expect(metricMonthSet).toBeDefined()
            expect(metricMonthSet.size).toBe(currentDemandData.expectedMonthsCount)
        }
    }

    static assertCSVDataMatchesAPI(
        csv: string[][],
        apiResponse: GetDemandScenarioForecastResponse,
        kind: 'sbu' | 'baseChannel'
    ) {
        const csvHeaders = DemandBaseClass.getCSVHeadersRecord(csv)
        const testDataProperty = `${kind}ToTest`

        // Calculates the to-be-tested metric value from the CSV's related data cells for the month and channel/SBU
        // specified in the test-data
        const csvMonthTotal = csv
            .filter(row =>
                row[csvHeaders[currentDemandData.testCSVBy[kind]]] === currentDemandData[testDataProperty]
                    && parseInt(row[csvHeaders[currentDemandData.monthHeader]]) === currentDemandData.monthToTest
            )
            .reduce((total: number, row) =>
                total + parseFloat(row[csvHeaders[currentDemandData.metricToTest.csv]])
            , 0)

        // Gets the to-be-tested metric value from the API response for the month and channel/SBU
        // specified in the test-data
        const apiMonthTotal = apiResponse.forecast
            .filter(forecast =>
                forecast[kind] === currentDemandData[testDataProperty]
            )
            .map(forecast =>
                forecast.forecast.filter(forecast => forecast.month === currentDemandData.monthToTest)[0]
            )[0][currentDemandData.metricToTest.api]

        debug.log(
            `${currentDemandData.monthHeader} ${currentDemandData.monthToTest} totals for ${currentDemandData.metricToTest.csv} (${kind}): \n`,
            `CSV Total: ${csvMonthTotal}\n`,
            `API Total: ${apiMonthTotal}\n`,
        )

        expect(csvMonthTotal).not.toBe(0)
        expect(apiMonthTotal).not.toBe(0)

        expect(Math.round(csvMonthTotal)).toBe(Math.round(apiMonthTotal))
    }
}