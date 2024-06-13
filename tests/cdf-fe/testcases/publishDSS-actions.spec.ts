import { test } from "../../common/fixtures/test-hook";
import testdata from "../testdata/create-publishDSS.json";
import testdataNewDSS from "../testdata/create-demandstackscenario.json";
import { PageFactory } from "../../common/pages/page-factory";

test.describe(
  "Publish Demand Stack Scenario Tests (Make sure DSS can be published and viewed on currentdemand page)",
  { tag: "@Smoke @PublishDSS" },
  async () => {
    test.describe.configure({ timeout: 300_000, mode: "serial" });

    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
      await objpageFactory.cdfPageFactory().demandWorkspace().navigate();
    });

    test(
      "Publish DSS works (User can select which slot to publish too and corresponding slot will be published on currentdemand page)",
      { tag: "@publishDSS" },
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
            .createNewDemandScenario(testdataNewDSS.dssName, testdataNewDSS.description);
          await objpageFactory
            .cdfPageFactory()
            .copyScenario()
            .verifyCopyConfirmation(testdataNewDSS.msgCopyStarted);
        });

        await test.step("Check if the scenario creation Job Started", async () => {
          //Check for the sceanario creation start
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .waitForScenarioToBeVisible(testdataNewDSS.dssName);
          await objpageFactory.home().checkAlertMessageFor(testdataNewDSS.dssName);
        });

        await test.step("Check if the scenario creation Job Completed", async () => {
          //Waiting for the async process to complete
          await objpageFactory
            .cdfPageFactory()
            .demandWorkspace()
            .waitForScenarioCreation(testdataNewDSS.dssName, 4);
        });

        await test.step("Go to the first DSS", async () => {
            await objpageFactory.cdfPageFactory().demandWorkspace().openFirstDSS();
        });

        await test.step("Open publish DSS modal", async () => {
            await objpageFactory.cdfPageFactory().dssPage().openPublishDSSModal();
        });

        await test.step("Populate DSS modal with test data", async () => {
            await objpageFactory.cdfPageFactory().dssPage().populatePublishDSSModal(testdata.options, testdata.slot);
        });

        await test.step("Wait for publish", async () => {
            await objpageFactory.cdfPageFactory().dssPage().waitForPublishDSS();
        });

        await test.step("Navigate to current demand page", async () => {
            await objpageFactory.cdfPageFactory().currentDemand().navigate();
        });

        await test.step("Verify DSS has been published", async () => {
            await objpageFactory.cdfPageFactory().currentDemand().verifyDSSPublished(testdata.dssName);
        })

      }
    );
    
  }
);
