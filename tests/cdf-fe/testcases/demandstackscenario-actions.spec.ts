import { test, expect } from "../../common/fixtures/test-hook";
import testdata from "../testdata/create-demandstackscenario.json";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "Demand Stack Scenario Features",
  { tag: "@Smoke @DSSActions" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });

    test(
      "Verify User can create a Demand Stack Scenario",
      { tag: "@createDSS" },
      async () => {
        test.setTimeout(500000);

        await test.step("Open the copy dialog", async () => {
          //Opening the copy dialog
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openMenuOptionFromExistingScenario("copy");
        });

        await test.step("Create a new scenario in the copy dialog", async () => {
          //Creating a new scenario in the copy dialog
          await objpageFactory
            .cdfPageFactory()
            .copyScenario()
            .createNewDemandScenario(testdata.dssName, testdata.description);
          await objpageFactory
            .cdfPageFactory()
            .copyScenario()
            .verifyCopyConfirmation(testdata.msgCopyStarted);
        });

        await test.step("Check if the scenario creation Job Started", async () => {
          //Check for the sceanario creation start
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .waitForScenarioToBeVisible(testdata.dssName);
          await objpageFactory.home().checkAlertMessageFor(testdata.dssName);
        });

        await test.step("Check if the scenario creation Job Completed", async () => {
          //Waiting for the async process to complete
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .waitForScenarioCreation(testdata.dssName, 4);
        });
      }
    );

    test(
      "Verify User can lock a Demand Stack Scenario",
      { tag: "@lockDSS" },
      async () => {
        await test.step("Open Scenario Menu", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openScenarioMenuFor(testdata.dssName);
        });
        await test.step("Click on Lock", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .selectScenarioMenu("Lock");
        });
        await test.step("Check the alert message displayed", async () => {
          await objpageFactory
            .home()
            .checkAlertMessageFor(testdata.msgLockSuccess);
        });
        await test.step("Check the lock icon is locked", async () => {
          expect(
            await objpageFactory
              .cdfPageFactory()
              .demandWorkspace()
              .getScenarioLockStatus(testdata.dssName)
          ).toBe("Locked");
        });
      }
    );

    test(
      "Verify User can Unlock a Demand Stack Scenario",
      { tag: "@unlockDSS" },
      async () => {
        await test.step("Open Scenario Menu", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openScenarioMenuFor(testdata.dssName);
        });
        await test.step("Click on UnLock", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .selectScenarioMenu("Unlock");
        });
        await test.step("Check the alert message displayed", async () => {
          await objpageFactory
            .home()
            .checkAlertMessageFor(testdata.msgUnlockSuccess);
        });
        await test.step("Check the lock icon is Unlocked", async () => {
          expect(
            await objpageFactory
              .cdfPageFactory()
              .demandWorkspace()
              .getScenarioLockStatus(testdata.dssName)
          ).toBe("Unlocked");
        });
      }
    );

    test(
      "Verify User can Archive a Demand Stack Scenario",
      { tag: "@archiveDSS" },
      async () => {
        await test.step("Open Scenario Menu", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openScenarioMenuFor(testdata.dssName);
        });
        await test.step("Click on Archive and check alert message", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .selectScenarioMenu("Archive");
          await objpageFactory
            .home()
            .checkAlertMessageFor(testdata.msgArchiveSuccessfully);
        });
        await test.step("Toggle archived view", async () => {
            await objpageFactory
                .cdfPageFactory()
                .demandWorkspace()
                .toggleArchivedView();
        })
        await test.step("Check if the scenario is archived", async () => {
            expect(
                await objpageFactory
                .cdfPageFactory()
                .demandWorkspace()
                .checkScenarioArchives(testdata.dssName)
            ).toBeVisible();
        })
        await test.step("Click on Unrchive and check alert message", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .openScenarioMenuFor(testdata.dssName);
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .selectScenarioMenu("Unarchive");
          await objpageFactory
            .home()
            .checkAlertMessageFor(testdata.msgUnarchiveSuccessfully);
        });
        await test.step("Toggle unarchived view", async () => {
            await objpageFactory
                .cdfPageFactory()
                .demandWorkspace()
                .toggleUnarchivedView();
        })
      }
    );

    test(
      "Verify User can Delete a Demand Stack Scenario",
      { tag: "@deleteDSS" },
      async () => {
        await test.step("Delete a scenario", async () => {
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .deleteScenario(testdata.dssName);
        });
        await test.step("Check the alert message displayed", async () => {
          await objpageFactory
            .home()
            .checkAlertMessageFor(testdata.msgDeleteSuccess);
        });
      }
    );
  }
);
