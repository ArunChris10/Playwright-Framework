import { test, expect } from "../../common/fixtures/test-hook";
import filterTestData from "../testdata/cdfFilter.json";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
  "Verify User can filter data by Channel",
  {
    tag: "@Regression @ibg-service-scenario-financials @DemandOutput",
  },
  () => {
    let demandId, channels;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify possible Channel filters and DemandOutput data returned is filtered", async ({ request }) => {
        
        await test.step("Fetch Channel filters", async () => {
            channels = (await CdfUtility.fetchFilterDataFromEndpoint(request)).baseChannelList.map((channel) => {
                return {
                    displayName: channel.displayName,
                    displayOrder: channel.displayOrder,
                    id: channel.id,
                    name: channel.name,
                }
            });
            expect(channels).toEqual(filterTestData.baseChannels);
        })

        await test.step("Fetch DemandOutput and assert if data is filtered", async () => {
            const payloadExtension = {
              baseChannel: [channels[0].name],
              baseChannelIds: [channels[0].id],
              metricUnit: "gmv",
              organizationalLevel: "BASE_CHANNEL",
            };
            const response = await CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(request, demandId, payloadExtension);
            expect(response.forecast.length).toBe(1);
            expect(response.forecast[0].baseChannelId).toBe(channels[0].id);
            expect(response.forecast[0].forecast[0].amount).toBe(response.forecastTotals.grandTotal.forecast[0].amount);
        })
    })
  }
);
