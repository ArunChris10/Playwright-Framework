import { expect, test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";
import { Utility } from "../../common/fixtures/utils";
import { debug } from "debug";

import type { GetDemandScenarioDetailsResponse } from "../types/get-demand-scenario-details-response";
import type { GetDemandScenarioSplitResponse, BaseChannel } from "../types/get-demand-scenario-splits-response";
import { GetDemandScenarioForecastResponse, Channel, SBU } from "../types/get-demand-scenario-forecast-response";

import allocationTestData from '../testdata/allocation-layer-data.json'

test.describe.configure({ mode: 'parallel'})
test.describe(
    "Allocation Layer - Net Merch Sales tests", { tag: "@Regression @ibg-service-scenario-financials @Allocation Layer @AllocationLayerNetMerchSales" }, () => {
    let demandId: string,
        demandScenarioDetails: GetDemandScenarioDetailsResponse,
        demandScenarioSplit: GetDemandScenarioSplitResponse,
        sellerFulfilled: BaseChannel,
        marketplaceFulfilled: BaseChannel,
        forecastLayerId: string;

    test.beforeAll(async ({ request }) => {
        demandId = await CdfUtility.createScenario(request);
        demandScenarioDetails = await DemandBaseClass.getDemandStackDetails(request, demandId)
        demandScenarioSplit = await AllocationUtils.getDemandScenarioSplits(request, demandId, demandScenarioDetails);

        sellerFulfilled = demandScenarioSplit.overrideForecast[0].baseChannelForecast[0];
        marketplaceFulfilled = demandScenarioSplit.overrideForecast[0].baseChannelForecast[1];

        await DemandBaseClass.lockUnlockDemandScenario(request, "lock", demandId);
    })

    test.afterAll(async ({ request }) => {
        await CdfUtility.deleteScenario(request, demandId);
    })

    test("Verify that the API supports allocations made with CONVERTED_SALES units", async ({ request }) => {
        const allocationType = 'CONVERTED_SALE'
        const putScenarioSplit = await AllocationUtils.updateDemandScenarioSplit(
            request,
            sellerFulfilled,
            marketplaceFulfilled,
            false,
            null,
            demandId,
            demandScenarioDetails,
            allocationType,
        )

        // checks that some month's entry was modified
        expect(Object.keys(putScenarioSplit[0].monthlySplitsRequest).length).toBeGreaterThan(0);
    })

    test("Verify that the API supports allocations made with GMV units", async ({ request }) => {
        const allocationType = 'DOLLAR'
        const metric =  allocationTestData.allocationType[allocationType];

        const forecastsToModify = [
            sellerFulfilled.forecast[0],
            marketplaceFulfilled.forecast[0]
        ]

        const firstForecastToModify = forecastsToModify[0]

        const modificationAmount: [ number, number ] = [
            forecastsToModify[0][metric] + allocationTestData.differenceAmount,
            forecastsToModify[1][metric] - allocationTestData.differenceAmount,
        ]

        const initialDemandForecast = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
            request,
            demandId,
            { baseChannelIds: [ sellerFulfilled.baseChannelId ] }
        ) as GetDemandScenarioForecastResponse<SBU>

        await test.step("Verify that an update occurs for allocations made with GMV units", async () => {
            const putScenarioSplit = await AllocationUtils.updateDemandScenarioSplit(
                request,
                sellerFulfilled,
                marketplaceFulfilled,
                false,
                null,
                demandId,
                demandScenarioDetails,
                allocationType,
                modificationAmount
            )

          // checks that some month's entry was modified
            expect(Object.keys(putScenarioSplit[0].monthlySplitsRequest).length).toBeGreaterThan(0);
            forecastLayerId = putScenarioSplit[0].layerId
        })

        await test.step("Verify the data has been modified per user input", async () => {
            const payloadExtension = {
                organizationalLevel: 'BASE_CHANNEL',
                baseChannelIds: [ sellerFulfilled.baseChannelId ],
                layerIds: [ forecastLayerId ]
            }

            const demandForecast = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                request,
                demandId,
                payloadExtension
            ) as GetDemandScenarioForecastResponse<Channel>

            expect(demandForecast.forecast).toBeDefined()
            expect(demandForecast.forecast.length).toBeGreaterThan(0)

            const monthlyDemandForecast =
                CdfUtility.getForecastByMonth(demandForecast.forecast[0].forecast, firstForecastToModify)

            expect(monthlyDemandForecast).not.toBeNull()
            expect(modificationAmount[0]).toEqual(monthlyDemandForecast[metric]);
        })

        await test.step("Verify that the SBUs have been re-calculated with correct proportions per user input", async () => {
            const demandForecast = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
                request,
                demandId,
                { baseChannelIds: [ sellerFulfilled.baseChannelId ], layerIds: [ forecastLayerId ] }
            ) as GetDemandScenarioForecastResponse<SBU>

            const expectedReallocationResults = initialDemandForecast.forecast.map((sbu) => {
                const initialSbuForecastForMonth = CdfUtility.getForecastByMonth(sbu.forecast, firstForecastToModify)

                const reallocationAmount =
                    (initialSbuForecastForMonth[metric] / firstForecastToModify[metric]) * allocationTestData.differenceAmount

                return initialSbuForecastForMonth[metric] + reallocationAmount
            })

            demandForecast.forecast.forEach((sbu, index) => {
                const expectedReallocationResult = expectedReallocationResults[index]
                const sbuForecastForMonth = CdfUtility.getForecastByMonth(sbu.forecast, firstForecastToModify)

                expect(sbuForecastForMonth).not.toBeNull()

                debug.log(
                    '-'.repeat(15),
                    `\n\nCalculated allocation for ${sbu.sbuDisplayName}: ${expectedReallocationResult}\n`,
                    `Actual result: ${sbuForecastForMonth[metric]}\n`
                )

                expect(Utility.roundToDecimals(sbuForecastForMonth[metric], 0))
                    .toEqual(Utility.roundToDecimals(expectedReallocationResult, 0))
            })
        })
    })
})
