import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { organization } from "../testdata/driversPopUp.json";

test.describe(
  "Verify if user is able to see the driver in the driver tree using view in driver tree",
  { tag: "@Smoke @driverPopUpViewInTree" },
  () => {
    let objpageFactory: PageFactory;
    let scenario_details;
    let currentForecast;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
    });
    test(
      "Check if user is able to see the driver in the driver tree using view in driver tree",
      { tag: "@driverPopUpViewInTree @DriverSearch @Regression" },
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
        await test.step(`Search for driver and click on View in Driver Tree option`, async () => {
          const searchTerm = "a";
          const driverName = await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndViewFirstDriverInTree(searchTerm);

          // Store the driver name for verification
          scenario_details.searchedDriverName = driverName;
        });

        await test.step(`Click on the driver in the tree`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnDriverInTree(scenario_details.searchedDriverName);
        });

        await test.step(`Verify if user is able to see the driver in the driver tree using view in driver tree`, async () => {
          // Click on search box again to check for recent searches
          const hasRecentSearches = await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .verifyRecentSearchesOnSearchBoxClick();

          expect(hasRecentSearches).toBe(true);

          // Verify the recently searched driver appears in the dropdown
          const recentSearchVisible = await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .verifyRecentSearchDriver([scenario_details.searchedDriverName]);

          expect(recentSearchVisible).toBe(true);
        });
      }
    );
  }
);
