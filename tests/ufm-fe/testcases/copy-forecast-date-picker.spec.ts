import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import { organization } from "../testdata/copyForecast.json";
test.describe(
  "Verify if user is able to select the date range in the copy popup",
  { tag: "@Smoke @CopyForecastDatePicker" },
  () => {
    let objpageFactory: PageFactory;
    test.beforeAll(async ({ pageFactory }) => {
      objpageFactory = pageFactory;
    });
    test("Verify user is able to select the date range in the copy popup", async () => {
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
          objpageFactory.ufmPageFactory().openCurrentForecast().copyForecast
        ).toBeVisible();
      });
      await test.step(`Click on Copy Forecast data button`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnOpenCopyForecastDataButton();
      });
      await test.step(`Verify date range component is visible`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .verifyDateRangeComponentIsVisible();
      });
      await test.step(`Click on date range component`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnDateRangeComponent();
      });

      await test.step(`Click on date range dropdown`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnDateRangeDropdown();
      });

      await test.step(`Select May month`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .selectMonth("May");
      });

      await test.step(`Click modal backdrop to close`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickModalBackdrop();
      });

      await test.step(`Verify date selection was successful`, async () => {
        await expect(
          objpageFactory.ufmPageFactory().openCurrentForecast()
            .dateRangeComponent
        ).toBeVisible();
      });
    });
  }
);
