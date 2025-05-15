import { Locator, Page, expect } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class OpenCurrentForecast {
  readonly page: Page;
  readonly btnOpenCurrentForecast: Locator;
  readonly adjustmentNamesTitle: Locator
  readonly txtCurrentForecast: Locator;
  readonly actionButton: Locator;
  readonly chooseDifferentDriverButton: Locator;
  readonly forecastInputCell: string;
  readonly allocationMethodDropDown: Locator;
  readonly maintainRatioOption: Locator;
  readonly saveChangesLoader: Locator
  readonly calculateButton: Locator;
  readonly calculationSuccessfulMessage: Locator;
  readonly calculationSpinner: Locator;
  readonly saveButton: Locator;
  readonly saveAsChangeButton: Locator;
  readonly saveChangesButton: Locator;
  readonly inputName: Locator
  readonly inputDescription: Locator
  readonly calculateErrorMessage: string;
  readonly saveErrorMessage: string;
  readonly allocateErrorMessage: string;
  readonly customCheckbox: string
  readonly forecastTable: Locator;
  readonly somethingWentWrong: Locator;
  readonly undoButton: Locator
  readonly redoButton: Locator
  readonly DriversButton: Locator
  readonly addDriversButton: Locator
  readonly driverCheckBoxes: Locator
  readonly KPITable: Locator;
  readonly createNewViewButton: Locator;
  readonly driversModalHeader: Locator
  readonly savedViewsDropDownHeader: Locator
  readonly saveViewButton: Locator
  readonly saveViewModal: Locator
  readonly saveButtonLocatorString: string
  readonly cancelButtonLocatorString: string
  readonly cancelButton: Locator
  readonly saveViewSnackBar: Locator;
  readonly deleteViewSnackBar: Locator;
  readonly savedViewsDropDownMenu: Locator;
  readonly deleteButton: Locator


  constructor(page: Page) {
    this.page = page;
    this.inputDescription = page.getByTestId('description-input')
    this.adjustmentNamesTitle = page.locator('//div[contains(@class,"AdjustmentPanel_boxTitle")]')
    this.inputName = page.getByTestId('name-input')
    this.btnOpenCurrentForecast = page.locator("//button[text()='Open']");
    this.txtCurrentForecast = page.getByText("Current Forecast");
    this.KPITable = page.getByTestId('forecast-table')
    this.saveChangesLoader = page.locator('//div[contains(@class,"Adjustment")]//span[@role="status"]')
    this.customCheckbox = '//div[contains(@class,"editable-cell-border")]//span'
    this.actionButton = this.page.locator(
      '//div[@class="table-container"]//button[contains(text(),"Actions")]'
    );
    this.chooseDifferentDriverButton = page.getByText(
      "Create new view"
    );
    this.addDriversButton = page.getByText("Add Drivers")
    this.DriversButton = page.locator("//button[text()='Drivers']")
    this.forecastInputCell =
      '//div[contains(@col-id,"forecast") and @role="gridcell"]';
    this.allocationMethodDropDown = this.page.locator(
      '//button[@aria-label="More options"]'
    );
    this.maintainRatioOption = this.page.getByText("Maintain ratio");
    this.calculateButton = this.page.getByText("Calculate");
    this.calculationSuccessfulMessage = this.page.getByText(
      "Calculation was successful, and allocation methods were applied to all dimensions"
    );
    this.calculationSpinner = this.page.getByText("Calculating your inputs");
    this.saveButton = this.page.getByText("Save")
    this.saveAsChangeButton = this.page.getByText("Save as change");
    this.saveChangesButton = this.page.getByText("Save Changes")
    this.calculateErrorMessage = "Please edit atleast one cell";
    this.saveErrorMessage =
      "Before saving the forecast, calculate your changes in the table.";
    this.allocateErrorMessage = "Select a method";
    this.forecastTable = this.page.locator(
      '//div[@data-testid="forecast-table"]'
    );
    this.somethingWentWrong = this.page.getByText("Something Went Wrong");
    this.undoButton = this.page.locator("//button[@type='undo']")
    this.redoButton = this.page.locator("//button[@type='redo']")
    this.driverCheckBoxes = this.page.locator('/div[@class="layoutContentDriverComponent sharedPages"]')
    this.createNewViewButton = this.page.getByText('Create new view')
    this.savedViewsDropDownHeader = this.page.locator('//div[contains(@class,"SavedViewMenu_btn")]')
    this.savedViewsDropDownMenu = this.page.locator('//div[contains(@class,"SavedViewMenu_menu")]')
    this.saveViewButton = this.page.getByText('Save View')
    this.saveViewModal = this.page.locator('//h2[text()="Save view"]//ancestor::div[@role="dialog"]')
    this.saveButtonLocatorString = "//button[text()='Save']"
    this.cancelButtonLocatorString = "//button[text()='Cancel']"

    this.saveButton = this.page.locator(this.saveButtonLocatorString)
    this.cancelButton = this.page.locator(this.cancelButtonLocatorString)
    this.saveViewSnackBar = this.page.getByText("View saved successfully.")
    this.deleteViewSnackBar = this.page.getByText("View deleted successfully.")
    this.deleteButton = this.page.locator('//button[text()="Delete"]')
  }

  async clickOnOpenButton() {
    await this.btnOpenCurrentForecast.first().click();
  }

  async clickOnBreadcrum(sbaName: string) {
    await this.page.getByText(`UFM ${sbaName}`).click();
  }

  async verifyCreateForecastScreenIsVisible() {
    await this.txtCurrentForecast.isVisible();
  }

  async clickOnActionButton() {
    this.actionButton.click();
  }

  async clickOnChooseDifferentDriver() {
    await this.DriversButton.isVisible() ? await this.DriversButton.click() : await this.chooseDifferentDriverButton.click()

  }

  getLabelLocator(selector: string) {
    return this.page.locator(selector);
  }

  async clickOnChooseDriver() {
    await this.DriversButton.waitFor({ state: "visible" });
    await this.DriversButton.click();
  }

  async waitForKPITableToLoad(state: "attached" | "detached" | "visible" | "hidden" | undefined = "visible") {
    await this.KPITable.waitFor({ state: state })
  }

  async getAllChanges() {
    const elements = await this.adjustmentNamesTitle.all();

    const texts = await Promise.all(
      elements.map(async (el) => {
        return (await el.textContent())?.trim() || '';
      })
    );

    return texts
  }

  async inputValueInAllValidInputCell(value) {
    const spans = this.page.locator(this.customCheckbox);
    const count = await spans.count();
    let addCount = 0

    let map = new Map()

    for (let i = 0; i < count && addCount < 50; i++) {
      let span = spans.nth(i);
      // Try focusing the span manually
      await this.page.mouse.click(0, 0);
      await this.page.waitForTimeout(100);
      await span.scrollIntoViewIfNeeded();
      let text = await span.textContent();
      try {
        if (text && text.trim() !== '') {
          const cleaned = text.replace(/\u200B/g, '').trim();
          if (cleaned !== '') {

            const info = await span.evaluate(el => {
              const rowDiv = el?.closest('div[role="row"]');
              const cellDiv = el?.closest('div[role="gridcell"]');
              return {
                rowIndex: rowDiv?.getAttribute('row-index') || null,
                colId: cellDiv?.getAttribute('col-id') || null,
              };
            });

            let nodeName = await this.page.locator(`(//div[@role="row" and @row-index="${info.rowIndex}"])[1]//div[contains(@class,"DimensionCellRenderer_cellContainer")]`).textContent()
            let cellValue = await this.page.locator(`//div[@row-id=${info.rowIndex}]//div[@col-id="${info.colId}"]//div[contains(@class,"EditableCellRenderer_tableCell")]//span`).textContent()
            if (!map.has(nodeName)) {
              // Parent key doesn't exist, create it with a new Map
              map.set(nodeName, [info.colId]);
            } else {
              const cell = map.get(nodeName)
              cell.push(info.colId)
              map.set(nodeName, cell)
            }
            console.log(`➡️ Editing cell in column: ${info.rowIndex} ${info.colId} ${nodeName} `);
            await this.page.mouse.click(0, 0);
            await this.page.waitForTimeout(50);

            // Try focusing the span manually
            await span.scrollIntoViewIfNeeded();
            await this.page.waitForTimeout(100);

            try {
              await span.click({ force: true, timeout: 3000 });
              await this.page.waitForTimeout(50);
              // Send keyboard input
              await this.page.keyboard.type(value);
              addCount += 1
            }
            catch (error) {
              console.warn(`❌ Failed to click span[${i}]:`, error);
              continue
            }
          }
        }
      } catch (error) { console.log("In Catch Block", error); continue }

    }

    return map
  }

  async validateDriverPresence(driverName: string) {
    await this.page
      .locator(
        `//div[@col-id="nodeName"]//span[contains(text(),"${driverName}")]`
      )
      .waitFor({ state: "visible" });
    return true;
  }

  async fillForecastInputCell(noOfCells, inputValue) {
    let count = 0;

    let forecastInputElement = await this.page.locator(
      "(" + this.forecastInputCell + ")" + "[1]"
    );

    let col_id = (await forecastInputElement.getAttribute("col-id"))?.split(
      "."
    )?.[0];

    let updated_col_ids = new Map();
    let old_col_ids = new Map();

    while (count < noOfCells) {
      if (typeof col_id === "string") {
        let actualColId = `${parseInt(col_id) + count}.forecast`;

        let currentValue: string | number = await this.page
          .locator(
            `//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count
            }.forecast")]//div[contains(@class,"tableCell")]/span`
          )
          .innerText();

        currentValue = parseFloat(currentValue.replace(/[$,]/g, ""));
        old_col_ids.set(actualColId, currentValue);
        let incrementedValue = currentValue + inputValue;
        updated_col_ids.set(actualColId, incrementedValue);

        await this.page
          .locator(
            `//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count
            }.forecast")]//div[contains(@class,"tableCell")]/span`
          )
          .dblclick()
          .then(async () => {
            await this.page.keyboard.type(incrementedValue.toString());
            // await this.page.keyboard.press("Shift+Tab+Tab");
            await this.page.getByText('Allocation Method', { exact: true }).click()
          });
      } else {
        Utility.logIt("Unable to convert the col-id");
      }
      count++;
    }

    return { updated_col_ids: updated_col_ids, old_col_ids: old_col_ids };
  }

  async fillForecastQuarterInputCell(noOfCells, inputValue) {
    let count = 0;

    let forecastInputElement = await this.page.locator(
      "(" + this.forecastInputCell + ")" + "[1]"
    );

    let col_id = (await forecastInputElement.getAttribute("col-id"))?.split(
      "."
    )?.[0];

    let updated_col_ids = new Map();
    let old_col_ids = new Map();

    while (count < noOfCells) {
      if (typeof col_id === "string") {
        let actualColId = `${parseInt(col_id) + count}Q4.forecast`;

        let currentValue: string | number = await this.page
          .locator(
            `//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count
            }Q4.forecast")]//div[contains(@class,"tableCell")]/span`
          )
          .innerText();

        currentValue = parseFloat(currentValue.replace(/[$,]/g, ""));
        old_col_ids.set(actualColId, currentValue);
        let incrementedValue = currentValue + inputValue;
        updated_col_ids.set(actualColId, incrementedValue);

        await this.page
          .locator(
            `//div[contains(@col-id,"${parseInt(col_id || "SelectorError") + count
            }Q4.forecast")]//div[contains(@class,"tableCell")]/span`
          )
          .dblclick()
          .then(async () => {
            await this.page.keyboard.type(incrementedValue.toString());
            await this.page.keyboard.press("Shift+Tab");
          });
      } else {
        Utility.logIt("Unable to convert the col-id");
      }
      count++;
    }

    return { updated_col_ids: updated_col_ids, old_col_ids: old_col_ids };
  }

  async fillForecastInputCellForGivenDriver(noOfCells, inputValue, DriverName, FilteredLowestGrain) {

    let DriverRow = await this.page.locator(`//*[text()='${DriverName}']//following::div[@col-id='department'][1]//*[text()='${FilteredLowestGrain}']/ancestor::*[@role='row']`);
    let row_id = (await DriverRow.getAttribute("row-id"))?.split(".")?.[0];

    console.log(`Edit the value for given driver ${DriverName}`);
    let FirstforecastInputElement = await this.page.locator(`(//div[contains(@class,'editable-cell-border')])[1]`);

    let col_id = (await FirstforecastInputElement.getAttribute("col-id"))?.split(".")?.[0];

    if (!col_id) {
      throw new Error("col_id is undefined");
    }
    const colIds = [`${col_id}`, `${parseInt(col_id, 10) + 1}`, `${parseInt(col_id, 10) + 2}`];

    let map = new Map();
    for (let i = 0; i < noOfCells; i++) {
      const xpath = `//*[@row-id="${row_id}"]/*[contains(@col-id,"${colIds[i]}")]//span`;
      const cell = this.page.locator(xpath);
      map.set(colIds[i], cell.textContent);
      await cell.waitFor({ state: 'visible' });

      await cell.click();

      const input = this.page.locator('input');
      await input.waitFor({ state: 'visible' });

      await input.fill('');
      await input.type(inputValue);

      await input.press('Enter');
    }
    return map;
  }

  async selectAllocationMethod(allocationMethod: string) {
    await this.allocationMethodDropDown.click();
    await this.page.getByText(allocationMethod).click();
  }

  async allocationErrorMessageExistence() {
    const allocationErrorMessageExistence = await this.page
      .waitForSelector(
        `//span[contains(text(),"${this.allocateErrorMessage}")]`,
        { state: "attached" }
      )
      .then(() => true)
      .catch(() => false);

    return allocationErrorMessageExistence;
  }

  async calculateErrorMessageExistence() {
    const calculateErrorMessageExistence = await this.page
      .waitForSelector(
        `//span[contains(text(),"${this.calculateErrorMessage}")]`,
        { state: "attached" }
      )
      .then(() => true)
      .catch(() => false);

    return calculateErrorMessageExistence;
  }

  async clickOnCalculateButton() {
    await this.calculateButton.click();
  }

  async waitForCalculationSuccessMessage() {
    await this.calculationSuccessfulMessage.waitFor({ state: "visible" });
  }

  async clickOnSaveChanges() {
    await this.saveChangesButton.click();
    await this.calculationSpinner.waitFor({ state: "hidden" });
    await this.forecastTable.waitFor({ state: "visible" });
  }

  async fillChangeForm(inputName, inputDescription) {
    await this.inputName.click()
    await this.page.keyboard.type(inputName);
    await this.inputDescription.click()
    await this.page.keyboard.type(inputDescription);
  }
  async waitForSaveChanges() {
    return await this.saveChangesLoader.waitFor({ state: "detached" })
  }

  async clickOnSaveAsChange() {
    await this.saveAsChangeButton.click();
  }
  async saveErrorMessageExistence() {
    const saveErrorMessageExistence = await this.page
      .waitForSelector(`//span[contains(text(),"${this.saveErrorMessage}")]`, {
        state: "attached",
        timeout: 3000,
      })
      .then(() => true)
      .catch(() => false);

    return saveErrorMessageExistence;
  }

  async clickOnSave() {
    if (!await this.saveButton.isDisabled()) {
      return await this.saveButton.click();
    }

    return await this.saveButton.isDisabled();

  }

  async getDriverMonthForecastValue(colIdMap) {
    for (let key of colIdMap.keys()) {
      // Get the element with the corresponding col-id
      var forecastValueFromTable = await this.page.locator(
        `//div[contains(@col-id,"${key}")]//div[contains(@class,"tableCell")]/span`
      );

      if (forecastValueFromTable) {
        // Get the current inner text of the element
        var currentInnerText: string | number =
          await forecastValueFromTable.innerText();
        currentInnerText = parseFloat(currentInnerText.replace(/[$,]/g, ""));
        // Convert the inner text to a number and update the map value
        colIdMap.set(key, currentInnerText);
      }
    }

    // Return the updated map
    return colIdMap;
  }

  async isSomethingWentWrongError() {
    return this.somethingWentWrong.isVisible();
  }

  async clickOnUndo() {
    await this.undoButton.click()
  }

  async clickOnRedo() {
    await this.page.waitForTimeout(1000)
    await this.redoButton.click()
  }

  async getSavedViewsDropdownHeader() {
    return this.savedViewsDropDownHeader.locator('//span').textContent()
  }

  async clickOnSavedViewsDropdown() {
    await this.savedViewsDropDownHeader.locator("//button").click()
  }

  async clickOnSaveView() {
    await this.saveViewButton.click()
  }

  async deleteView(viewName) {
    await this.savedViewsDropDownMenu.locator(`//span[text()="${viewName}"]`).hover()
    await this.savedViewsDropDownMenu.locator(`//button[@aria-label="Delete view"]`).click()
  }

  async validateSaveViewModal() {

    let saveViewModalContainer = this.saveViewModal
    let inputText = await this.saveViewModal.locator('//input').getAttribute("value")

    expect(saveViewModalContainer).toContainText('Save view');
    expect(saveViewModalContainer).toContainText('View Name');
    expect(saveViewModalContainer).toContainText('This view will be saved to your profile.');
    expect(inputText).toEqual('Untitled View')
    expect(await this.saveViewModal.locator(this.cancelButtonLocatorString).isVisible()).toBeTruthy()
    expect(await this.saveViewModal.locator(this.saveButtonLocatorString).isVisible()).toBeTruthy()
  }

  async inputSaveViews(name: string) {
    await this.saveViewModal.locator('//input').fill(name)
  }

  async waitForSaveViewSuccessMessage() {
    await this.saveViewSnackBar.waitFor({ state: "visible" })
    await this.page.waitForTimeout(1000)
  }

  async waitForDeleteViewSuccessMessage() {
    await this.deleteViewSnackBar.waitFor({ state: "visible" })
    await this.page.waitForTimeout(1000)
  }

  async clickOnCreateNewView() {
    if (await this.createNewViewButton.isVisible()) {
      await this.createNewViewButton.click()
    }
    else {
      await this.clickOnChooseDifferentDriver()
    }

  }

  async clickOnDeleteButton() {
    await this.deleteButton.click()
  }

  async getViewTilePresence(viewName) {
    await Promise.race([
      this.createNewViewButton.waitFor({ state: 'visible' }),
      this.DriversButton.waitFor({ state: 'visible' }),
    ]);
    return await this.page.locator(`//span[@aria-label="Private view"]//following-sibling::span[text()="${viewName}"]`).isVisible()
  }
}
