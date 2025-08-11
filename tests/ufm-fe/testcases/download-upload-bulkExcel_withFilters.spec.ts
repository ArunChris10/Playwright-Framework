import { testData, groupByOptions, filterOptions } from '../testdata/inputNodeValues.json';
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { signinUtility } from "../../ssdm-fe/fixtures/signinUtility";
import { HistoricalRatesTestData } from '../testdata/inputNodeValues.json';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import commonData from "../../ufm-be/constants/common.json";


test.describe.configure({ mode: 'parallel', timeout: 450_000 });

test.describe('Verify user is able to do calculate and save post uploading file from UI_filters applied', { tag: "@Smoke @GroupByExcelUpdate @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, async () => {

  let objpageFactory: PageFactory;
  let inputCellLocator;
  let calculatedForecastValue;
  let inputCellLocatorOnCalcualte;
  let calculatedForecastValueOnCalculate;
  let inputCellLocatorOnSave;
  let calculatedForecastValueOnSave;
  let adjustmentName: string;
  let scenarioId;
  let scenario_details;
  let downloadPath;
  let drivers = testData[0].driver.combinationDrivers;
  let editedValues;

  /* test.beforeEach(async ({ page }) => {
    await signinUtility.SignIn(page); // Centralized sign-in before each test
    objpageFactory = new PageFactory(page);
  });
 */
  test.beforeAll(async ({ pageFactory, request }) => {
    objpageFactory = pageFactory;
    scenarioId = await ForecastUtility.createForecast(testData[0].LOB, request);

    let currentForecast = await UfmUtility.getCurrentForecastList(
      testData[0].LOB,
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
      await UfmUtility.getMapping(testData[0].LOB, "dim_val_id"),
      request
    );
  })


  test(`Verify excel edits reflect on KPI table on UI on upload`, async () => {

    await test.step('Go To UFM Page', async () => {
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

    await test.step(`Search for input driver: ${drivers}`, async () => {
      await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(drivers);
    });

    await test.step("Wait for KPI table to load", async () => {
      await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad();
    });

    await test.step("Select group by to select grains of nodes selected to see its lowest dimension", async () => {
      for (const groupByOption of groupByOptions) {
        for (const [, groupBySelection] of Object.entries(groupByOption.data)) {
          await test.step(`Select ${groupBySelection["option"]} group By Options`, async () => {
            await objpageFactory.ssdmPageFactory().applyFilter().clickOnGroupBy();
            await objpageFactory.ssdmPageFactory().applyFilter().selectGroupByOption(groupBySelection["option"]);
          });
        }
      }
    });

    for (const filterSet of filterOptions) {
      const filters = filterSet.data;
      for (const [, filterSelection] of Object.entries(filters)) {
        const typedFilterSelection = filterSelection as {
          childDropDown: string;
          dropDown: string;
        };

        await test.step(
          `Select ${typedFilterSelection.childDropDown} ${typedFilterSelection.dropDown}} filter options`,
          async () => {
            await objpageFactory.ssdmPageFactory().applyFilter().clickOnFiltersButton();
            await objpageFactory.ufmPageFactory().currentForecast().clickOnFilterDropdown(typedFilterSelection.dropDown);
            await objpageFactory.ssdmPageFactory().applyFilter().clickOnFilterOption(typedFilterSelection.childDropDown);
          }
        );
      }
    }

    await test.step("Apply filters and wait for KPI table to load", async () => {
      await objpageFactory.ssdmPageFactory().applyFilter().clickOnApplyChanges();
      await objpageFactory.ufmPageFactory().myKpiTablePage().waitForKPITableToLoad();
    });

    await test.step(`Download KPI table Excel`, async () => {
      downloadPath = await objpageFactory.ufmPageFactory().excelUtility().downloadExcel();
      console.log("DownloadPath- " + downloadPath)
    });

    await test.step('Update the excel for some forecast values', async () => {
      editedValues = await objpageFactory.ufmPageFactory().excelUtility().editExcel(downloadPath, drivers, 6);
      console.log("Edited value - ", editedValues);
    });

    await test.step('Upload excel back to UI', async () => {
      await objpageFactory.ufmPageFactory().excelUtility().uploadExcel(downloadPath);
    });

    await test.step('Verify the KPI table is updated with the new values', async () => {
      inputCellLocator = [];
      calculatedForecastValue = [];
      for (const driver of drivers) {
        const cell = await objpageFactory.ufmPageFactory().openCurrentForecast().getCellForGivenInputCell(driver);
        inputCellLocator.push(cell);
        let value = await cell.textContent();
        let cleanedValue = '';
        if (value !== null) {
          // Remove commas, dollar signs, percent signs, spaces, and .00 at the end
          cleanedValue = value.replace(/[\s,$,%]/g, '').replace(/\.00$/, '');
          // If value ends with %, treat as percent and divide by 10 (to get 8103 from 810,300.00%)
          if (value.includes('%')) {
            cleanedValue = (parseFloat(cleanedValue) / 100).toString();
          }
          // Otherwise, just parse as number (e.g., $6,916.00 -> 6916)
          else {
            cleanedValue = parseFloat(cleanedValue).toString();
          }
          value = cleanedValue;
        }
        calculatedForecastValue.push(value);
        console.log(`Calculated forecast value for driver "${driver}": ${value}`);
      }
      console.log("All ForecastValueOnUploadExcel:", calculatedForecastValue);
      for (let i = 0; i < drivers.length; i++) {
        expect(calculatedForecastValue[i]).toBe(editedValues[i].toString());
      }
      await objpageFactory.ufmPageFactory().excelUtility().deleteDownloadedFile(downloadPath)
    });

    await test.step('Click on Calculate', async () => {
      await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCalculateButton();
      expect(await objpageFactory.ufmPageFactory().openCurrentForecast().isSomethingWentWrongError()).toBeFalsy();
      await objpageFactory.ufmPageFactory().openCurrentForecast().waitForCalculationSuccessMessage();
      inputCellLocatorOnCalcualte = [];
      calculatedForecastValueOnCalculate = [];
      for (const driver of drivers) {
        const cell = await objpageFactory.ufmPageFactory().openCurrentForecast().getCellForGivenInputCell(driver);
        inputCellLocatorOnCalcualte.push(cell);
        let value = await cell.textContent();
        let cleanedValue = '';
        if (value !== null) {
          cleanedValue = value.replace(/[\s,$,%]/g, '').replace(/\.00$/, '');
          if (value.includes('%')) {
            cleanedValue = (parseFloat(cleanedValue) / 100).toString();
          }
          else {
            cleanedValue = parseFloat(cleanedValue).toString();
          }
          value = cleanedValue;
        }
        calculatedForecastValueOnCalculate.push(value);
        console.log(`Calculated forecast value for driver "${driver}": ${value}`);
      }
      console.log("All calculatedForecastValueOnCalculate:", calculatedForecastValueOnCalculate);
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
      inputCellLocatorOnSave = [];
      calculatedForecastValueOnSave = [];
      for (const driver of drivers) {
        const cell = await objpageFactory.ufmPageFactory().openCurrentForecast().getCellForGivenInputCell(driver);
        inputCellLocatorOnSave.push(cell);
        let value = await cell.textContent();
        let cleanedValue = '';
        if (value !== null) {
          cleanedValue = value.replace(/[\s,$,%]/g, '').replace(/\.00$/, '');
          if (value.includes('%')) {
            cleanedValue = (parseFloat(cleanedValue) / 100).toString();
          }
          else {
            cleanedValue = parseFloat(cleanedValue).toString();
          }
          value = cleanedValue;
        }
        calculatedForecastValueOnSave.push(value);
        console.log(`Calculated forecast value for driver "${driver}": ${value}`);
      }
      console.log("All calculatedForecastValueOnSave:", calculatedForecastValueOnSave);
      for (let i = 0; i < drivers.length; i++) {
        expect(calculatedForecastValueOnSave[i]).toBe(calculatedForecastValueOnCalculate[i]);
      }
    });
  });
});