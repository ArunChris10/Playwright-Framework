import { testData } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { HistoricalRatesTestData } from '../testdata/inputNodeValues.json';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import commonData from "../../ufm-be/constants/common.json";

let data = HistoricalRatesTestData[0];
data.driver.allocationMethod.forEach((method: string) => {

  test.describe('Verify historical rate projection', { tag: "@Smoke @CalculateAndSaveHistoricalRateProjection @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {

    let objpageFactory: PageFactory;
    let inputCellLocator;
    let calculatedForecastValue;
    let adjustmentName: string;
    let scenarioId
    let scenario_details

    test.beforeAll(async ({ pageFactory, request }) => {
      objpageFactory = pageFactory;
      scenarioId = await ForecastUtility.createForecast(data.LOB, request);

      let currentForecast = await UfmUtility.getCurrentForecastList(
        data.LOB,
        request
      );

      scenario_details = await UfmUtility.getScenarioDetails(
        currentForecast,
        scenarioId
      );

    })

    test.afterAll(async ({ request }) => {
      await ForecastUtility.deleteForecast(
        scenario_details["scenarioId"],
        scenario_details["scenarioVersion"],
        commonData.ba_dim_id,
        await UfmUtility.getMapping(data.LOB, "dim_val_id"),
        request
      );
    })


    test(`Verify historical rate projection is working correctly on calculate when Constant value is applied with allocation method: ${method}`, { tag: "@calculateInputNode" }, async () => {
      test.setTimeout(300000);

      await test.step('Go To UFM Page', async () => {
        adjustmentName = "TestAdjustment_" + new Date().getTime();
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
      });

      await test.step(`Click on ${data.sbaName} Organization`, async () => {
        await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(data.sbaName);
      });

      await test.step(`Click on Open ${data.LOB} Forecast`, async () => {
        await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(data.LOB);
      });

      await test.step('Click on choose different drivers', async () => {
        await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDriver();
      });

      await test.step(`Search for input driver: ${data.driver.inputDriver}`, async () => {
        await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(data.driver.inputDriver);
      });

      await test.step("Wait for KPI table to load", async () => {
        await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad();
      });

      await test.step(`Select allocation method: ${method}`, async () => {
        await objpageFactory.ufmPageFactory().openCurrentForecast().selectAllocationMethod(method);
      });


      await test.step(`Get forecast input cell for driver: ${data.driver.inputDriver}`, async () => {
        inputCellLocator = await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnProjectionMethodforGivenInputCell(data.driver.inputDriver);
      });

      await test.step("Select Historical Rate Projection", async () => {
        await objpageFactory.ufmPageFactory().openCurrentForecast().selectHistoricalRateProjection();
        const inputCellText = await inputCellLocator.textContent();
        expect(inputCellText?.trim()).toBe("=GROWTHRATE(HISTORICAL)");
      });

      await test.step('Click on Calculate', async () => {
        await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCalculateButton();
        expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy();
        await objpageFactory.ufmPageFactory().openCurrentForecast().waitForCalculationSuccessMessage();
        calculatedForecastValue = await inputCellLocator.textContent();
      });

      await test.step('Click on Save as change', async () => {
        await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveAsChange();
      });

      await test.step('Provide name and description in save as change form', async () => {
        await objpageFactory.ufmPageFactory().openCurrentForecast().fillChangeForm(adjustmentName, "Test description created through automation");
      });

      await test.step('Click on Save Changes', async () => {
        await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveChanges();
        expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy();
        expect(await objpageFactory.ufmPageFactory().openCurrentForecast().waitForSaveChanges());
      });

      await test.step("Wait for KPI table to load", async () => {
        await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad();
      });

      await test.step('Validate save is changed', async () => {
        let changesList = await objpageFactory.ufmPageFactory().openCurrentForecast().getAllChanges();
        expect(changesList).toContain(adjustmentName);
        expect(await inputCellLocator.textContent()).toEqual(calculatedForecastValue);
      });
    });
  });
});