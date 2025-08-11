import { expect, test } from '../../common/fixtures/test-hook';
import forecastdata from "../testdata/forecast.json";
import { PageFactory } from '../../common/pages/page-factory';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';

let objpageFactory: PageFactory;

test.describe(
  "Create Forecast Feature Test",
  { tag: "@Smoke @createForecast" },
  () => {
    const forecast = "Optical";


    const lob = forecastdata[forecast];

    test.beforeAll(async ({ pageFactory, request }) => {
      await ForecastUtility.deleteAllforecastofUser(
        request,
        lob.LobName,
        process.env.ufmUser
      );
      objpageFactory = pageFactory;
    });

    let forecastName;

    test(
      "Check if the user is able to createForecast",
      { tag: "@createForecast @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" },
      async () => {
        test.setTimeout(480000);

        await test.step(
          "Click on the particular BA" + lob,
          async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate()
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(
              lob.sbaName
            );
          }
        );

        await test.step("Click on Create forecast", async () => {
          await objpageFactory.ufmPageFactory().currentForecast().clickOnCreateForecast();
        });

        await test.step("Click on Prepare the forecast for Particular drivers", async () => {
          await objpageFactory.ufmPageFactory().createForecastPopup().selectForecastInModal(lob.LobName);
        });

        await test.step("Click on Continue", async () => {
          await objpageFactory.ufmPageFactory().createForecastPopup().clickOnContinueButton();
        });

        await test.step(
          "Fill input field with forecast name" +
          lob.nameOfTheForecastInCreateForecastWindow,
          async () => {
            forecastName = await objpageFactory.ufmPageFactory().createForecastPopup().fillTheInputField(
              lob.forecastName
            );
          }
        );

        await test.step("Select base forecast", async () => {
          await objpageFactory.ufmPageFactory().createForecastPopup().selectBaseForecastPrimaryOption();
        });

        await test.step("Click on Create Forecast", async () => {
          await objpageFactory.ufmPageFactory().createForecastPopup().clickOnCreateForecastFinalButton();
        });


        await test.step("Wait until scenario status changes to sending for review %", async () => {
          await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToStart("createForecast")
        })

        await test.step('Waiting until the send to review process is over and modal is closed', async () => {
          await objpageFactory.ufmPageFactory().currentForecast().waitForWorkflowToComplete("createForecast")
        })
        await test.step(`Validate the alert banner message reflects correct workflow status`, async () => {
          let workflowStatus = await objpageFactory.ufmPageFactory().currentForecast().validateWorflowAlertMessage("created", forecastName, true)

          expect(workflowStatus).toBeTruthy()

        })

        await test.step(`Click on Open ${lob.LobName} Forecast`, async () => {
          await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(lob.LobName);
        });

        await test.step(`Edit forecast with duplicate name`, async () => {
          await objpageFactory.ufmPageFactory().openCurrentForecast().editForecastWithDuplicateName();
        });

        await test.step(`Edit forecast name`, async () => {
          await objpageFactory.ufmPageFactory().openCurrentForecast().editForecast(lob.LobName);
        });

        await test.step(`Validate delete forecast`, async () => {
          await objpageFactory.ufmPageFactory().currentForecast().deleteForecastByName(forecastName);
          let workflowStatus = await objpageFactory.ufmPageFactory().currentForecast().validateWorflowAlertMessage("deleted", forecastName, true)

          expect(workflowStatus).toBeTruthy()

        })
      });
  });
