import { test } from '../../common/fixtures/test-hook'
import { CurrentDemandUtility } from "../fixtures/current-demand-utils";
import type { GetDemandScenarioForecastResponse } from "../types/get-demand-scenario-forecast-response";

import currentDemandData from "../testdata/current-demand-download.json"

const slots: number[] = currentDemandData.slotIds

test.describe.configure({ mode: 'parallel' });
test.describe("Verify current demand CSV export/download works and has the correct data", { tag: "@Smoke @CurrentDemandCSV"}, () => {
    test("Verify SBU CSV data for all slots", async ({ request }) => {
        let currentDemandResponses: GetDemandScenarioForecastResponse[]
        let csvResponsesData: string[][][]

        await test.step("Download the current demand API data and CSVs for each slot", async () => {
            const csvRequests = Promise.all(slots.map(async (slot) =>
                CurrentDemandUtility.getCurrentDemandData(request, slot, 'SBU', 'csv')
            ))
            const demandRequests = Promise.all(slots.map(async (slot ) =>
                CurrentDemandUtility.getCurrentDemandData(request, slot, 'SBU')
            ))
            csvResponsesData = await csvRequests
            currentDemandResponses = await demandRequests
        })

        await test.step("Verify all metrics have data for all months in each slot", async () => {
            await Promise.all(csvResponsesData.map(async (csv) => {
                await CurrentDemandUtility.assertCSVHasDataForAllMonths(csv)
            }))
        })

        await test.step("Compare the CSV data to the API data", async () => {
            currentDemandResponses
            .forEach((currentDemandResponse, index) => {
                const slotCSV = csvResponsesData[index]
                CurrentDemandUtility.assertCSVDataMatchesAPI(slotCSV, currentDemandResponse, 'sbu')
            })
        })
    })

    test("Verify Base Channel CSV data for all slots", async ({ request }) => {
        let currentDemandResponses: GetDemandScenarioForecastResponse[]
        let csvResponsesData: string[][][]

        await test.step("Download the current demand API data and CSVs for each slot", async () => {
            const csvRequests = Promise.all(slots.map(async (slot) =>
                CurrentDemandUtility.getCurrentDemandData(request, slot, 'BASE_CHANNEL', 'csv')
            ))
            const demandRequests = Promise.all(slots.map(async (slot) =>
                CurrentDemandUtility.getCurrentDemandData(request, slot, 'BASE_CHANNEL')
            ))
            csvResponsesData = await csvRequests
            currentDemandResponses = await demandRequests
        })

        await test.step("Verify all metrics have data for all months in each slot", async () => {
            await Promise.all(csvResponsesData.map(async (csv) => {
                await CurrentDemandUtility.assertCSVHasDataForAllMonths(csv)
            }))
        })

        await test.step("Compare the CSV data to the API data", async () => {
            currentDemandResponses.forEach((currentDemandResponse, index) => {
                const csvForSlot = csvResponsesData[index]
                CurrentDemandUtility.assertCSVDataMatchesAPI(csvForSlot, currentDemandResponse, 'baseChannel')
            })
        })
    })
})