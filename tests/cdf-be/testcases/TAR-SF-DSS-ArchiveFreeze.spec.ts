import { test, expect } from "../../common/fixtures/test-hook"
import { CdfUtility } from "../fixtures/cdf-utils";

import type { PostArchiveDemandScenarioResponse } from "../types/post-archive-demand-scenario-response";

test.describe.configure({ mode: 'parallel' })
test.describe(
    "Archive Freeze Testcases (API)",
    { tag: '@Regression @ibg-service-scenario-financials @DSS @ArchiveFreeze'},
    () => {
        let demandId: string,
            archiveScenarioResponse: PostArchiveDemandScenarioResponse

        test.beforeEach(async ({ request }) => {
            demandId = await CdfUtility.createScenarioByOtherUser(request, process.env.cdfNormalUser)
        })

        test.afterEach(async ({ request }) => {
            await CdfUtility.deleteScenario(request, demandId)
        })

        test("Verify the DSS is NOT locked if the DSS is archived by a non super-user", async ({ request }) => {
            await test.step("Archive the DSS with normal user", async () => {
                archiveScenarioResponse =
                    await CdfUtility.archiveScenarioNormalUser(request, demandId, process.env.cdfNormalUser)
            })

            await test.step("Assert that the DSS archived by the normal user is not frozen", () => {
                expect(archiveScenarioResponse.isFrozen).toEqual(false)
            })
        })

        test("Verify the DSS is locked if a super-user archives", async ({ request }) => {
            await test.step("Archive the DSS with super-user", async () => {
                archiveScenarioResponse = await CdfUtility.archiveScenario(request, demandId)
            })

            await test.step("Assert the super-user archived DSS is frozen", () => {
                expect(archiveScenarioResponse.isFrozen).toEqual(true)
            })
        })
    }
)