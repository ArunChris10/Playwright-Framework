import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import commonData from "../../ufm-be/constants/common.json";
import { ForecastUtility } from "../../ufm-be/fixtures/forecast-utils";
import { demandOrganization } from "../testdata/organizations.json";

test.describe(
  "Verify if user is able to see the search list drop down with a single select checkbox for each item in the search result list upon clicking the search textbox",
  { tag: "@Smoke @driverPopUpSearchCheckBox" },
  () => {
    let objpageFactory: PageFactory, scenario_details, currentForecast, scenarioId, firstForecast;

    test.beforeAll(async ({ pageFactory, request }) => {
        objpageFactory = pageFactory;
        scenarioId = await ForecastUtility.createForecast(
            demandOrganization.lob,
            request,
        );
    });
    test.afterAll(async ({ request }) => {
        await ForecastUtility.deleteForecast(
            scenarioId,
            scenario_details.scenarioVersion,
            commonData.lob_dim_id,
            scenario_details.lineOfBusiness,
            request
        );
    });
    test('Check if the user is able to drag selected driver and the updated order is reflecting in the MyKPI table upon clicking apply', { tag: "@driverPopUpSelectedDriver" }, async ({ request, page }) => {
        test.setTimeout(300000);

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        });
        await test.step(`Click on ${demandOrganization.name} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(demandOrganization.name);
        });

        await test.step("Wait until currentForecast has firstForecast value", async () => {
            currentForecast = await UfmUtility.getCurrentForecastList(
                demandOrganization.lob,
                request
            );
            await page.waitForTimeout(3000);
            console.log("Current Forecast Response:", currentForecast);
            firstForecast = currentForecast[0];
        });

        if (!firstForecast) {
            throw new Error("No forecast data found in currentForecast.");
        }

        scenario_details = {
            name: firstForecast.name,
            scenarioId: firstForecast.scenarioId,
            scenarioVersion: firstForecast.scenarioVersion,
            lineOfBusiness: firstForecast.lineOfBusiness,
        };

        await test.step(`Click on Open ${demandOrganization.name} Forecast`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenFirstForecastByName(scenario_details.name);
        });
        await test.step(`Click on Drivers button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDriver();
        });
        await test.step(`Search for drivers`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchDrivers("a");
        });
        await test.step(`Verify max each item in the search list has a single checkbox`, async () => {
          const hasCheckBoxResults = await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .verifyCheckboxResults();

          expect(hasCheckBoxResults).toBe(true);
        });
      }
    );
  }
);
