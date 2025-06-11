import { testData, groupByOptions, filterOptions } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { HistoricalRatesTestData } from '../testdata/inputNodeValues.json';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import commonData from "../../ufm-be/constants/common.json";


test.describe.configure({ mode: 'parallel', timeout: 300_000 });

test.describe('Verify excel tests', { tag: "@Smoke @excelTestsUI" }, async () => {

  let objpageFactory: PageFactory;
  let inputCellLocator;
  let calculatedForecastValue;
  let adjustmentName: string;
  let scenarioId;
  let scenario_details;
  let downloadPath;
  let method = testData[0].driver.allocationMethod;
  let drivers = testData[0].driver.inputAdditiveDrivers;
  let editedValues;

  test.beforeEach(async ({ page }) => {
    objpageFactory = new PageFactory(page);
  });

  /* test.beforeAll(async ({ pageFactory, request }) => {
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
  })  */


  test(`Verify excel is getting updated`, { tag: "@testExcelFunction" }, async () => {

    /* await test.step('Go To UFM Page', async () => {
      adjustmentName = "TestAdjustment_" + new Date().getTime();
      await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    });

    await test.step(`Click on ${testData[0].sbaName} Organization`, async () => {
      await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(testData[0].sbaName);
    });

    await test.step(`Click on Open ${testData[0].LOB} Forecast`, async () => {
      await objpageFactory.ufmPageFactory().currentForecast().clickOnOpenParticularForecast(testData[0].LOB);
    });

    await test.step('Click on choose different drivers', async () => {
      await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDriver();
    });

    await test.step(`Search for input driver: ${testData[0].driver.inputDriver}`, async () => {
      await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(drivers);
    });

    await test.step("Wait for KPI table to load", async () => {
      await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad();
    });

    await test.step(`Select allocation method: ${method}`, async () => {
      await objpageFactory.ufmPageFactory().openCurrentForecast().selectAllocationMethod(method);
    });

    await test.step(`Download KPI table Excel`, async () => {
      downloadPath = await objpageFactory.ufmPageFactory().excelUtility().downloadExcel();
    }); */

    await test.step('Update the excel for some forecast values', async () => {
      //editedValues = await objpageFactory.ufmPageFactory().excelUtility().editExcel("C://Users//vn58riq//Downloads//driverData (1).xlsx", ["Gross GMV"]);
      //console.log("Edited value - ", editedValues);
      editedValues = await objpageFactory.ufmPageFactory().excelUtility().editExcel(downloadPath, drivers);
    });

    /* wait test.step('Upload excel back to UI', async () => {
      await objpageFactory.ufmPageFactory().excelUtility().uploadExcel(downloadPath);
    });

    await test.step('Verify the KPI table is updated with the new values', async () => {
      inputCellLocator = await objpageFactory.ufmPageFactory().openCurrentForecast().getCellForGivenInputCell(drivers);
      calculatedForecastValue = await inputCellLocator.textContent();
      expect(calculatedForecastValue).toBe(editedValues[0].value.toString());
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
      await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad();
    });

    await test.step('Validate save is changed', async () => {
      let changesList = await objpageFactory.ufmPageFactory().openCurrentForecast().getAllChanges();
      expect(changesList).toContain(adjustmentName);
      expect(await inputCellLocator.textContent()).toEqual(calculatedForecastValue);
    }); */
  });
});