import { test, expect } from '../../common/fixtures/test-hook';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify if Archive/Unarchive is working properly", { tag: "@Regression @archive/unarchive @ibg-service-scenario-financials @DSS" }, () => {

    let demandId;
    let demandIdNonSuperUser;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    test.beforeAll(async ({ request }) => {
        demandIdNonSuperUser = await CdfUtility.createScenarioByOtherUser(request, process.env.cdfNormalUser);
    });

    test.afterAll(async ({ request }) => {
        await CdfUtility.deleteScenarioByOtherUser(request, demandIdNonSuperUser, process.env.cdfNormalUser);
    });
    
    test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Verify DSS archived by Super user CANNOT be unarchived by other users", async ({ request }) => {
        let archiveScenario;
        await test.step("Archive the DSS by super user", async () => {
            archiveScenario = await CdfUtility.archiveScenario(request, demandId);
        });

        let unarchiveScenarioResponse;
        await test.step("Unarchive the DSS by a non super user", async () => {
            unarchiveScenarioResponse = await CdfUtility.unarchiveScenarioNormalUser(request, archiveScenario.demandStackScenarioId, process.env.cdfNormalUser);
        });
        
        let unarchiveScenarioResponseBody = await unarchiveScenarioResponse.json();
        
        // Assertion
        expect(unarchiveScenarioResponseBody.statusCode).toEqual('403');
        expect(unarchiveScenarioResponseBody.message).toEqual("Unable to update the archive status because user is not a SUPERUSER");
    });

    test("Verify a Super User can Unarchive DSS archived by anyone", async ({ request }) => {
        let archiveScenario;
        await test.step("Archive the DSS by non super user", async () => {
            archiveScenario = await CdfUtility.archiveScenarioNormalUser(request, demandId, process.env.cdfNormalUser);
        });

        let unarchiveScenarioResponseBody;
        await test.step("Unarchive the DSS by super user", async () => {
            unarchiveScenarioResponseBody = await CdfUtility.unarchiveScenario(request, archiveScenario.demandStackScenarioId);
        });

        debug.log("Unarchive Scenario Response: ", JSON.stringify(unarchiveScenarioResponseBody));
    });

    test("Verify If a DSS has been Archived by User A then the User A can only Unarchive the DSS", async ({ request }) => {
        let archiveScenario;
        await test.step("Archive the DSS by a normal user", async () => {
            archiveScenario = await CdfUtility.archiveScenarioNormalUser(request, demandIdNonSuperUser, process.env.cdfNormalUser);
        });

        let unarchiveScenarioResponse;
        await test.step("Unarchive the DSS by the same user", async () => {
            unarchiveScenarioResponse = await CdfUtility.unarchiveScenarioNormalUser(request, archiveScenario.demandStackScenarioId, process.env.cdfNormalUser);
        });

        debug.log("unarchiveScenarioResponse: ", JSON.stringify(await unarchiveScenarioResponse.json()));
    });

    test("Verify If a DSS has been Archived by User A then the Super user can Unarchive the DSS", async ({ request }) => {
        let archiveScenario;
        await test.step("Archive the DSS by a normal user", async () => {
            archiveScenario = await CdfUtility.archiveScenarioNormalUser(request, demandIdNonSuperUser, process.env.cdfNormalUser);
        });

        let unarchiveScenarioResponseBody;
        await test.step("Unarchive the DSS by a super user", async () => {
            unarchiveScenarioResponseBody = await CdfUtility.unarchiveScenario(request, archiveScenario.demandStackScenarioId);
        });

        debug.log("unarchiveScenarioResponse: ", JSON.stringify(unarchiveScenarioResponseBody));
    });

});