import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import { organization } from "../testdata/copyForecast.json";
test.describe(
  "Verify if user is able to select the required dimensions in channel",
  { tag: "@Smoke @CopyForecastFilter @CopyScenario @Regression @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" },
  () => {
    let objpageFactory: PageFactory;
    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
    });
    test("Verify if user is able to select the required dimensions in channel", async () => {
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
      await test.step(`Click on action button in the forecast`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnActionButton();
      });
      await test.step(`Verify copy forecast button is available`, async () => {
        await expect(
          objpageFactory.ufmPageFactory().copyForecastPage().copyForecast
        ).toBeVisible();
      });
      await test.step(`Click on Copy Forecast data button`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .copyForecastPage()
          .clickOnOpenCopyForecastDataButton();
      });

      await test.step(`Click on Channel filter button`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickChannelButton();
      });

      await test.step(`Click on Department filter button`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickDepartmentButton();
      });

      await test.step(`Expand IBG_TOTAL option`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .expandIbgTotalOption();
      });

      await test.step(`Select IBG_TOTAL checkbox`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .selectIbgTotalCheckbox();
      });

      await test.step(`Select CONSUMABLES checkbox`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .selectConsumablesCheckbox();
      });

      await test.step(`Verify IBG_TOTAL chip is visible`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .verifyIbgTotalChip();
      });

      await test.step(`Verify CONSUMABLES chip is visible`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .verifyConsumablesChip();
      });

      await test.step(`Click on IBG_TOTAL chip to verify interaction`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickIbgTotalChip();
      });

      await test.step(`Click on CONSUMABLES chip to verify interaction`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickConsumablesChip();
      });
    });
  }
);
