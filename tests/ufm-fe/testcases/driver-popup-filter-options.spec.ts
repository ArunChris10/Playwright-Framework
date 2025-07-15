import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { organization } from "../testdata/driversPopUp.json";

test.describe(
  "Verify if clicking on the filter button displays all the filter options similar to MyKPI Filter",
  { tag: "@Smoke @driverPopUpFilterOption" },
  () => {
    let objpageFactory: PageFactory;
    let scenario_details;
    let currentForecast;

    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
    });
    test(
      "Check if clicking on the filter button displays all the filter options similar to MyKPI Filter",
      { tag: "@driverPopUpFilterOption" },
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
        let filtersBeforeDrivers: string[];
        await test.step(`Click on filter chip and capture available filters`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickFilterChip();

          filtersBeforeDrivers = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getAvailableFilterOptions();

          console.log("Filters before applying drivers:", filtersBeforeDrivers);

          // Close the filter panel
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .applyDefaultFilters();
        });

        await test.step(`Search and apply driver`, async () => {
          const driverNames = ["Buying Allowances"];
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(driverNames);
        });
        let filtersAfterDrivers: string[];
        await test.step(`Click on Filters button and verify filter options`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickFiltersButton();

          filtersAfterDrivers = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getAvailableFilterOptions();

          console.log("Filters after applying drivers:", filtersAfterDrivers);
        });

        await test.step(`Verify filter options are identical before and after applying drivers`, async () => {
          const areFiltersIdentical = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .compareFilterOptions(filtersBeforeDrivers, filtersAfterDrivers);

          expect(areFiltersIdentical).toBe(true);

          // Additionally verify that all expected filters are present
          const expectedFilters = [
            "Filter sets",
            "Department",
            "Location",
            "Reporting",
            "Business Area",
          ];
          const allFiltersVisible = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .verifyFilterOptionsVisible(expectedFilters);

          expect(allFiltersVisible).toBe(true);
        });
      }
    );
  }
);
