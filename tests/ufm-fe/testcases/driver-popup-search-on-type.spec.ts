import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { organization } from "../testdata/driversPopUp.json";

test.describe(
  "Verify if the search starts immediately after user enters any character",
  { tag: "@Smoke @driverPopUpSearchOnType" },
  () => {
    let objpageFactory: PageFactory;
    let scenario_details;
    let currentForecast;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
    });
    test(
      "Check if the search starts immediately after user enters any character",
      { tag: "@driverPopUpSearchOnType @DriverSearch @Regression" },
      async ({ request }) => {
        test.setTimeout(300000);

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });
        await test.step(`Click on ${organization.name} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(organization.name);
        });

        let firstForecast;
        await test.step("Wait until currentForecast has firstForecast value", async () => {
          currentForecast = await UfmUtility.getCurrentForecastList(
            organization.lob,
            request
          );
          console.log("Current Forecast Response:", currentForecast);
          firstForecast = currentForecast[0];
        });

        if (!firstForecast) {
          throw new Error("No forecast data found in currentForecast.");
        }

        scenario_details = {
          name: firstForecast.name,
          scenarioId: firstForecast.scenarioId,
        };

        await test.step(`Click on Open ${organization.name} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenFirstForecastByName(scenario_details.name);
        });
        await test.step(`Click on Drivers button`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnChooseDriver();
        });
        await test.step(`Search for drivers`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchDrivers("a");
        });
        await test.step(`Verify if the search starts immediately after user enters any character`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .verifySearchStartsImmediately();
        });
      }
    );
  }
);