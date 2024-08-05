import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import usersNexusFormat from "../../common/testdata/users-nexus-format.json";
import commonDemandEndpoints from '../testdata/common-demand-endpoints.json';

test.describe("Verify activity of archive/unarchive DSS", { tag: "@Regression @archiveScenarioActivity @ibg-service-scenario-financials @DSS" }, () => {

    let demandId;

    const demandStackArchived = 'Demand Stack Archived';
    const demandStackUnarchived = 'Demand Stack Un Archived';
    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenarioByOtherUser(request, process.env.ibgUser); });

    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenarioByOtherUser(request, demandId, process.env.ibgUser); });

    test("Verify Activity log for Update to reflect who Archived or Unarchived the DSS", async ({ request }) => {
        let archiveScenario;
        await test.step("Archive the scenario", async () => {
            archiveScenario = await CdfUtility.archiveScenarioNormalUser(request, demandId, process.env.ibgUser);
        });

        let activityLogs;
        await test.step("Check and verify in the activity logs", async () => {
            activityLogs = await CdfUtility.getActivityLogsStatus(request, demandId, demandStackArchived);

            let actionOfActivityLogs = activityLogs[0].action;
            let createdBy = activityLogs[0].createdByUserName;

            // Assertion
            expect(actionOfActivityLogs).toEqual(demandStackArchived);
            expect(createdBy).toEqual(usersNexusFormat.filter((user) => user.userId === process.env.ibgUser)[0].displayName);
        });

        let unarchiveScenario;
        await test.step("Unarchive the scenario", async () => {
            unarchiveScenario = await CdfUtility.unarchiveScenarioNormalUser(request, demandId, process.env.ibgUser);
        });

        await test.step("Check and verify in the activity logs", async () => {
            activityLogs = await CdfUtility.getActivityLogsStatus(request, demandId, demandStackUnarchived);
            
            let actionOfActivityLogs = activityLogs[0].action;
            let createdBy = activityLogs[0].createdByUserName;

            // Assertion
            expect(actionOfActivityLogs).toEqual(demandStackUnarchived);
            expect(createdBy).toEqual(usersNexusFormat.filter((user) => user.userId === process.env.ibgUser)[0].displayName);

        });
    });

    test("Moving DSS from archive to unarchive", async ({ request }) => {
        let archiveScenario;
        await test.step("Archive the scenario", async () => {
            archiveScenario = await CdfUtility.archiveScenarioNormalUser(request, demandId, process.env.ibgUser); 
        });

        await test.step("Fetch the list and verify if archive scenario is in the list", async () => {
            let demandScenarioList = await CdfUtility.getDemandScenarioListForArchiveAndUnarchive(request, commonDemandEndpoints.demandScenarioListArchived);
            
            // Assertion
            expect(archiveScenario.demandStackScenarioId).toEqual(demandScenarioList[0].demandStackScenarioId)
            expect(demandScenarioList[0].isArchive).toEqual(true);
        });

        let unarchiveScenario;
        await test.step("Unarchive the scenario", async () => {
            unarchiveScenario = await CdfUtility.unarchiveScenarioNormalUser(request, demandId, process.env.ibgUser);
        });

        await test.step("Fetch the list and verify if unarchive scenario is in the list", async() => {
            let demandScenarioList = await CdfUtility.getDemandScenarioListForArchiveAndUnarchive(request, commonDemandEndpoints.demandScenarioListUnarchived);
        
            // Assertion
            expect(archiveScenario.demandStackScenarioId).toEqual(demandScenarioList[0].demandStackScenarioId)
            expect(demandScenarioList[0].isArchive).toEqual(false);
        });
    });

}); 