import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
    "Verify demand scenario is showing correct filters for Channel after changing Channel Group",
    {
        tag: "@Regression @verifyChannelGroupFilters @@ibg-service-scenario-financials @DemandOutput",
    },
    () => {
        let demandId;

        test.beforeAll(async ({ request }) => {
        demandId = await CdfUtility.createScenario(request);
        });

        test.afterAll(async ({ request }) => {
        await CdfUtility.deleteScenario(request, demandId);
        });

        test("Verify demand scenario has all Chennels based on all Channel Group", async ({
        request,
        }) => {
            let channelGroups: {
                channelGroupName: string;
                channelGroupIds: number;
                channelLists: string[];
            }[] = [];

            await test.step("Getting all channels and channelGroups possible", async () => {
                let demandScenarioResponse =
                await CdfUtility.fetchFilterDataFromEndpoint(request);

                let scenarioForecast =
                demandScenarioResponse.channelGroupToBaseChannelMap;
                let scenarioForecastDetails = scenarioForecast.all;

                scenarioForecastDetails.forEach((channelGroup) => {
                channelGroups.push({
                    channelGroupName: channelGroup.name,
                    channelGroupIds: channelGroup.id,
                    channelLists: channelGroup.baseChannelList,
                });
                });
            });
        
            await test.step("Should get correct channel filters for each channel group", async () => {
                for (const channelGroup of channelGroups) {
                    if (channelGroup.channelGroupName === "DELIVERY") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        expect(channelGroupLength).toBe(10);
                    };
                    if (channelGroup.channelGroupName === "INSTORE_INCLUB") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        expect(channelGroupLength).toBe(3);
                    };
                    if (channelGroup.channelGroupName === "OTHER") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        expect(channelGroupLength).toBe(4);
                    };
                    if (channelGroup.channelGroupName === "PICKUP") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        expect(channelGroupLength).toBe(8);
                    };
                }
            });

            await test.step("Should get all possible channel filters for all selected channel group", async () => {
                let lengthForChannel = 0;
                for (const channelGroup of channelGroups) {
                    if (channelGroup.channelGroupName === "DELIVERY") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        lengthForChannel += channelGroupLength;
                    };
                    if (channelGroup.channelGroupName === "INSTORE_INCLUB") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        lengthForChannel += channelGroupLength;
                    };
                    if (channelGroup.channelGroupName === "OTHER") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        lengthForChannel += channelGroupLength;
                    };
                    if (channelGroup.channelGroupName === "PICKUP") {
                        let channelGroupLength = channelGroup.channelLists.length;
                        lengthForChannel += channelGroupLength;
                    };
                }
                expect(lengthForChannel).toBe(25);
            });
        });
    }
);
