import { test, expect } from "../../common/fixtures/test-hook"
import { CdfUtility } from "../fixtures/cdf-utils";

import type { PostArchiveDemandScenarioResponse } from "../types/post-archive-demand-scenario-response";
import {APIResponse} from "@playwright/test";

test.describe.configure({ mode: 'serial' })
test.describe(
    "ArchiveDelete testcases (API)",
    { tag: '@Regression @ibg-service-scenario-financials @DSS @ArchiveDelete'},
    () => {
        let demandId: string,
            archiveScenarioResponse: PostArchiveDemandScenarioResponse

        test.beforeAll(async ({ request }) => {
            demandId = await CdfUtility.createScenarioByOtherUser(request, process.env.cdfNormalUser)
            archiveScenarioResponse =
                await CdfUtility.archiveScenario(request, demandId)

            expect(archiveScenarioResponse.isFrozen).toEqual(true)
        })

        test.afterAll(async ({ request }) => {
            await CdfUtility.deleteScenario(request, demandId)
        })

        test("Verify attempted deletion of a DSS throws an Invalid Operation exception if performed by a non super-user", async ({ request }) => {
            let deleteScenarioResponse: APIResponse

            await test.step("Attempt DSS deletion with a normal user", async () => {
                deleteScenarioResponse = await CdfUtility.deleteScenarioByOtherUser(request, demandId, process.env.cdfNormalUser)
            })

            await test.step("Assert the DSS deletion attempt responded with 403", async () => {
                const deleteScenarioResponseStatus = deleteScenarioResponse.status()
                expect(deleteScenarioResponseStatus).toEqual(403)
            })
        })

        test("Verify DSS deletion is possible for a super-user", async ({ request }) => {
            let deleteScenarioResponse: APIResponse

            await test.step("Attempt DSS deletion with a super-user", async () => {
                deleteScenarioResponse = await CdfUtility.deleteScenario(request, demandId)
            })

            await test.step("Assert the DSS deletion attempt was successful", async () => {
                const deleteScenarioStatus = deleteScenarioResponse.status()
                expect(deleteScenarioStatus).toEqual(200)
            })
        })
    }
)