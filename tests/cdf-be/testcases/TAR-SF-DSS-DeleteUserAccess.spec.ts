import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";

test.describe(
  "Verify user ability to Delete Demand Workspace as Creator of Demand Stack or Super user of application.",
  { tag: "@Regression @ibg-service-scenario-financials @DSS" },
  () => {

    let demandId, response;

    test("Create Scenario with normal user and delete with normal user", async ({
      request,
    }) => {
        demandId = await CdfUtility.createScenarioByOtherUser(
          request,
          process.env.cdfNormalUser
        );
        response = await CdfUtility.deleteScenarioByOtherUser(
          request,
          demandId,
          process.env.cdfNormalUser as string
        );
        expect(response).toBeOK();
    });

    test("Create Scenario with normal user and delete with Super user", async ({
      request,
    }) => {
        demandId = await CdfUtility.createScenarioByOtherUser(
          request,
          process.env.cdfNormalUser
        );
        response = await CdfUtility.deleteScenarioByOtherUser(
          request,
          demandId,
          process.env.cdfUser as string
        );
        expect(response).toBeOK();
    });
  }
);

test.describe(
  "Verify Delete Icon is disabled/ invisible for other users (ex: no delete access for non- creator of DS or Non-Superuser).",
  { tag: "@Regression @ibg-service-scenario-financials @DSS" },
  () => {

    let demandId, response;

    test.afterEach(async ({ request }) => {
        await CdfUtility.deleteScenario(request, demandId);
    });

    test("Create Scenario with Super user and delete should fail for normal user", async ({
      request,
    }) => {
        demandId = await CdfUtility.createScenarioByOtherUser(
          request,
          process.env.cdfUser
        );
        response = await CdfUtility.deleteScenarioByOtherUser(
          request,
          demandId,
          process.env.cdfNormalUser as string
        );
        expect(response.status()).toBe(403);
    });

    test("Create Scenario with one normal user and delete should fail for a different normal user", async ({
      request,
    }) => {
        demandId = await CdfUtility.createScenarioByOtherUser(
          request,
          process.env.ibgUser
        );
        response = await CdfUtility.deleteScenarioByOtherUser(
          request,
          demandId,
          process.env.cdfNormalUser as string
        );
        expect(response.status()).toBe(403);
    });
  }
);