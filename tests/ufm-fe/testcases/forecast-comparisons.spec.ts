import { testData } from "../testdata/inputNodeValues.json";
import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import forecastComparisonData from '../testdata/comparisonForecast.json';

const LY = forecastComparisonData.views.ly;
const PRIOR = forecastComparisonData.views.prior;
const COUNT = forecastComparisonData.count;



let lobList = {
  [testData[0].sbaName]: [testData[0].LOB],
};
const driverName = testData[0].driver.inputDriver;

Object.entries(lobList).forEach(([org, lob]) => {
  for (let i = 0; i < lob.length; i++) {
    test.describe(
      "Verify forecast comparison functionality",
      { tag: "@Smoke @forecastcomparison" },
      async () => {
        test.describe.configure({ timeout: 800_000, mode: "serial" });
        let objpageFactory: PageFactory;

        test.beforeAll(async ({ pageFactory, request }) => {
          objpageFactory = pageFactory;
        });

        test("Verify if Compare button is visible and clickable on KPI screen", async () => {
          test.setTimeout(300000);

          await test.step("Go To UFM Page", async () => {
            await objpageFactory
              .ufmPageFactory()
              .organisationSelection()
              .navigate();
          });
          await test.step(`Click on ${org} Organization`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .organisationSelection()
              .selectOrganisation(org);
          });

          await test.step(`Click on Open ${org} Frecast`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .currentForecast()
              .clickOnOpenParticularForecast(lob[i]);
          });

          await test.step("Click on choose different drivers", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .clickOnChooseDifferentDriver();
          });

          await test.step(`Search for input driver ${driverName}`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad();
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .inputDriverName(driverName);
          });

          await test.step(`Select input driver ${driverName}`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .selectDriver(driverName);
          });

          await test.step("Click on Apply Drivers", async () => {
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .clickOnApplyDrivers();
          });

          await test.step("Wait for KPI table to load", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForKPITableToLoad();
          });

          //   Verify Comparison benchmarks is removed from under the Group-by filter
          await test.step("User is able to see group By button", async () => {
            await objpageFactory
              .ssdmPageFactory().applyFilter().clickOnGroupBy();
          });

          await test.step("Check if label is not present", async () => {
            await objpageFactory
              .ssdmPageFactory().applyFilter().clickOnGroupBy();
            const labelLocator = objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .getLabelLocator('text=Comparison columns'); // Ensure this method returns a valid Playwright Locator

            const isLabelVisible = await labelLocator.isVisible(); // Check if the label is visible
            expect(isLabelVisible).toBe(false);
          });

          await test.step("User is able to see compare button", async () => {
            await objpageFactory
              .forecastComparisonPageFactory()
              .visibilityOfCompareButton();
          });

          await test.step("Click on Compare Button and check if the pop up is getting opened", async () => {
            await objpageFactory
              .forecastComparisonPageFactory()
              .clickOnCompare();
          });

          await test.step("user is able to see Compare button is clickable and dropdown is visible", async () => {
            await objpageFactory
              .forecastComparisonPageFactory()
              .visibilityOfCompareDropdown();
          });

          await test.step("user is able to click on comparison checkbox", async () => {
            await objpageFactory
              .forecastComparisonPageFactory()
              .selectComparisonCheckBox(LY);
          });

          // Verify user can switch between options inder selected benchmarks without page reload

          await test.step("user is able to toggle the comparison checkbox without page reload", async () => {
            const forecastComparisonPage = objpageFactory.forecastComparisonPageFactory();
            const isPageLoaded = forecastComparisonPage.isPageLoaded();
            await forecastComparisonPage.selectComparisonCheckBoxOnCheck(LY);
            // Assert that the checkbox is selected
            const isCheckedAfterSelect = await forecastComparisonPage.isComparisonCheckBoxChecked(LY);
            expect(isCheckedAfterSelect).toBe(true);
            // Assert that the page was not reloaded
            expect(isPageLoaded).toBe(false);
            // Deselect the checkbox
            await forecastComparisonPage.selectComparisonCheckBoxOnUnCheck(LY);
            // Assert that the checkbox is deselected
            const isCheckedAfterDeselect = await forecastComparisonPage.isComparisonCheckBoxChecked(LY);
            expect(isCheckedAfterDeselect).toBe(false);
            // Assert that the page was not reloaded
            expect(isPageLoaded).toBe(false);
          });

          await test.step("user is able to click on comparison checkbox and check the count of selection made", async () => {
            const forecastComparisonPage = objpageFactory.forecastComparisonPageFactory();
            // Perform actions that affect the count (e.g., selecting checkboxes)
            await forecastComparisonPage.selectComparisonCheckBoxOnCheck(LY);
            await forecastComparisonPage.selectComparisonCheckBoxOnCheck(PRIOR);
            // Get the count beside the Compare button
            const countBesideCompareButton = await forecastComparisonPage.getCountBesideCompareButton();
            // Assert the count (adjust the expected value as needed)
            expect(countBesideCompareButton).toBe(COUNT);
          });

          await test.step("Click on Cancel Button", async () => {
            const forecastComparisonPage = objpageFactory.forecastComparisonPageFactory();
            // Perform actions that affect the count (e.g., selecting checkboxes)
            await forecastComparisonPage.selectComparisonCheckBoxOnCheck(LY);
            const countBesideCompareButtonBefore = await forecastComparisonPage.getCountBesideCompareButton();
            expect(countBesideCompareButtonBefore).toBe(1);
            await forecastComparisonPage.clickOnCancel();
            // Get the count beside the Compare button
            const countBesideCompareButtonAfter = await forecastComparisonPage.getCountBesideCompareButton();
            // Assert the count (adjust the expected value as needed)
            expect(countBesideCompareButtonAfter).toBe(0);
          });

          await test.step("User clicks on apply changes for comparison ", async () => {
            await objpageFactory
              .ssdmPageFactory()
              .applyFilter()
              .clickOnApplyChanges();
          });

          await test.step("Wait for KPI table to load after clicking on apply changes for comparison forecast", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForKPITableToLoad();
          });
        });
      }
    );
  }
});
