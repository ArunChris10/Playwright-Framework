import { expect, test } from "../../common/fixtures/test-hook";
import { PageFactory } from "../../common/pages/page-factory";
import commonData from "../../ufm-be/constants/common.json";
import { ForecastUtility } from "../../ufm-be/fixtures/forecast-utils";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { organization } from "../testdata/driversPopUp.json";

test.describe(
  "Verify if the search result are consistent regardless of jumbled letters",
  { tag: "@Smoke @driverPopUpJumbledLetters @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" },
  () => {
    let objpageFactory: PageFactory, scenarioId, scenarioDetails;

    test.beforeAll(async ({ pageFactory, request }) => {
      objpageFactory = pageFactory;
      scenarioId = await ForecastUtility.createForecast(
        organization.lob,
        request
      );

      let currentForecast = await UfmUtility.getCurrentForecastList(
        organization.lob,
        request
      );

      scenarioDetails = await UfmUtility.getScenarioDetails(
        currentForecast,
        scenarioId
      );
    });

    test.afterAll(async ({ request }) => {
      await ForecastUtility.deleteForecast(
        scenarioDetails["scenarioId"],
        scenarioDetails["scenarioVersion"],
        commonData.ba_dim_id,
        await UfmUtility.getMapping(organization.lob, "dim_val_id"),
        request
      );
    });

    test(
      "Check if the search result are consistent even with jumbled letters",
      { tag: "@driverPopUpJumbledLetters" },
      async () => {
        await test.step("Navigate To UFM Page", async () => {
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

        await test.step(`Click on Open ${scenarioDetails["name"]} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenarioDetails["name"]);
        });

        await test.step("Click on Add driver", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnChooseDifferentDriver();
        });

        await test.step(`Click on Search and enter a jumbled letters`, async () => {
          const inputDriverName = "svicere iemcon (MO)";
          const expectedDriverName = "Service Income (MO)";
          const firstDriverName = await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndViewFirstDriverInTree(inputDriverName);

          expect(firstDriverName).toBe(expectedDriverName);
        });
      }
    );
  }
);
