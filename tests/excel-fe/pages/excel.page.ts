import { expect, FrameLocator, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class ExcelPage {
  readonly page: Page;
  readonly parentIframe: FrameLocator;
  readonly mainIframe: FrameLocator;
  readonly tableContainer: Locator;
  readonly nameBox: Locator;
  readonly formulaBar: Locator;
  readonly getStartedBtn: Locator;
  readonly uploadBtn: Locator;
  readonly uploadTypeCombobox: Locator;
  readonly businessArea: Locator;
  readonly drivers: Locator;
  readonly filters: Locator;
  readonly channel: Locator;
  readonly storeCoreMP: Locator;
  readonly stores: Locator;
  readonly digital: Locator;
  readonly dateRangePicker: Locator;
  readonly dimensions: Locator;
  readonly btnHasText: Function;
  readonly savedView: Locator;
  readonly scenario: Locator;
  readonly loadDataButton: Locator;
  readonly addComparedScenario: Locator;
  readonly addDriver: Locator;
  readonly baselineCombobox: Locator;
  readonly comparedWithCombobox: Locator;
  readonly clearBtn: Locator;
  readonly resetDateRange: Locator;
  readonly backToFiltersNavigation: Locator;
  readonly uploadTextField: Locator;
  readonly uploadTextArea: Locator;
  readonly bannerDismiss: Locator;

  constructor(page: Page) {
    this.page = page;
    this.parentIframe = page.frameLocator("#WacFrame_Excel_0");
    this.mainIframe = this.parentIframe
      .frameLocator('iframe[title*="Office Add-in IBG Excel Addin"]')
      .first();
    this.tableContainer = this.parentIframe.locator("div#EditorContainer");
    this.nameBox = this.parentIframe.locator("#FormulaBar-NameBox-input");
    this.formulaBar = this.parentIframe.locator(
      "#formulaBarTextDivId_textElement"
    );
    this.getStartedBtn = this.mainIframe.getByRole("button", {
      name: "Get Started",
    });
    this.uploadBtn = this.mainIframe.getByRole("button", {
      name: "Upload",
    });
    this.uploadTypeCombobox = this.mainIframe.getByRole("combobox");
    this.backToFiltersNavigation = this.mainIframe.getByTestId("BackToFilters");
    this.businessArea = this.mainIframe.getByRole("combobox");
    this.dateRangePicker = this.mainIframe.getByTestId("date-range-component");
    this.dimensions = this.mainIframe.getByText("Dimensions");
    this.btnHasText = (text: string) =>
      this.mainIframe.locator("button").filter({ hasText: text });
    this.savedView = this.mainIframe.getByText("Saved Views");
    this.drivers = this.mainIframe.getByText("Drivers");
    this.drivers = this.mainIframe.getByText("Filters");
    this.drivers = this.mainIframe.getByText("Channel");
    this.storeCoreMP = this.mainIframe.getByTestId("ChevronDown-Store_Core_MP");
    this.stores = this.mainIframe.getByTestId("ChevronDown-Stores");
    this.digital = this.mainIframe.getByTestId("ChevronDown-Digital");
    this.scenario = this.mainIframe.getByText("Scenarios");
    this.loadDataButton = this.mainIframe.getByTestId("LoadDataButton");
    this.addComparedScenario = this.mainIframe.getByText("Add", {
      exact: true,
    });
    this.addDriver = this.mainIframe.getByText("Add driver", { exact: true });
    this.baselineCombobox = this.mainIframe.locator(
      '#baselineCombobox, [aria-labelledby="baselineCombobox"]'
    );
    this.comparedWithCombobox = this.mainIframe.locator(
      '#comparedWithCombobox, [aria-labelledby="comparedWithCombobox"]'
    );

    this.baselineCombobox = this.mainIframe.locator(
      '#baselineCombobox, [aria-labelledby="baselineCombobox"]'
    );
    this.comparedWithCombobox = this.mainIframe.locator(
      '#comparedWithCombobox, [aria-labelledby="comparedWithCombobox"]'
    );
    this.clearBtn = this.mainIframe.getByTestId("ClearButton");
    this.resetDateRange = this.mainIframe.getByText("Reset date range");
    this.bannerDismiss = this.mainIframe.getByText("Dismiss");
    this.uploadTextField = this.mainIframe.locator('input[type="text"]');
    this.uploadTextArea = this.mainIframe.locator("textarea");
  }

  async getTableData() {
    await this.tableContainer.click();
    await this.page.keyboard.press("Control+A");
    await this.page.waitForTimeout(1000);
    await this.page.keyboard.press("Control+C");
    await this.page.waitForTimeout(1000);
    const clipboardData = await this.page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
    return clipboardData
      .split("\n")
      .map((row) => row.split("\t").map((cell) => cell.trim()));
  }

  async getCellData(cell: string): Promise<string | null> {
    await this.nameBox.click();
    await this.nameBox.fill(cell);
    await this.page.keyboard.press("Enter");
    return this.formulaBar.textContent();
  }

  async setCellData(cell: string, value: string): Promise<void> {
    await this.nameBox.click();
    await this.nameBox.fill(cell);
    await this.page.keyboard.press("Enter");
    await this.page.keyboard.type(value);
    await this.page.keyboard.press("Enter");
  }

  async getCellColor(cell: string): Promise<string | null> {
    await this.nameBox.click();
    await this.nameBox.fill(cell);
    await this.page.keyboard.press("Enter");

    const cellElement = this.mainIframe.locator(`[data-cell="${cell}"]`);
    await expect(cellElement).toBeVisible();

    return cellElement.evaluate((el) => {
      function rgbToHex(rgb: string) {
        const result = rgb.match(/\d+/g);
        if (!result) return null;
        return (
          "#" +
          result
            .slice(0, 3)
            .map((x) => {
              const hex = parseInt(x).toString(16).toUpperCase();
              return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
        );
      }
      const bg = window.getComputedStyle(el).backgroundColor;
      return rgbToHex(bg);
    });
  }

  async getStarted() {
    await this.getStartedBtn.click();
  }

  async openUploadPanel() {
    await this.uploadBtn.click();
  }

  async uploadData() {
    await this.loadDataButton.click();
  }

  async selectUploadType(uploadType?: string) {
    await this.uploadTypeCombobox.click();
    if (!uploadType) {
      await this.mainIframe.getByRole("menuitem").first().click();
    } else {
      await this.mainIframe.getByRole("menuitem", { name: uploadType }).click();
    }
    await this.page.waitForTimeout(1000);
  }

  async selectBusinessArea(businessArea?: string) {
    await this.businessArea.click();
    if (!businessArea) {
      await this.mainIframe.getByRole("menuitem").first().click();
    } else {
      await this.mainIframe
        .getByRole("menuitem", { name: businessArea })
        .click();
    }
    await this.page.waitForTimeout(1000);
  }

  async selectDrivers() {
    await this.drivers.click();
    await this.page.waitForTimeout(1000);
  }

  async selectFilters() {
    await this.filters.click();
    await this.channel.click();
    await this.storeCoreMP.click();
    await this.stores.click();
    await this.digital.click();
    await this.mainIframe.getByRole("checkbox", { name: "Digital" }).click();
    await this.page.waitForTimeout(1000);
  }

  async selectSavedView(savedView?: string) {
    await this.savedView.click();
    if (savedView) {
      await this.mainIframe.getByRole("radio", { name: savedView }).click();
    } else {
      await this.mainIframe.getByRole("radio").first().click();
    }
    await this.savedView.click();
  }

  async selectScenario(scenario?: string) {
    await this.scenario.click();
    if (scenario) {
      await this.mainIframe.getByRole("checkbox", { name: scenario }).click();
    } else {
      await this.mainIframe.getByRole("checkbox").first().click();
    }
    await this.scenario.click();
  }

  async isDimensonDisabled(dimension: string) {
    if (dimension) {
      const checkbox = this.mainIframe.getByRole("checkbox", {
        name: dimension,
      });
      if (await checkbox.isVisible()) {
        return await checkbox.isDisabled();
      }
      throw new Error(`Dimension "${dimension}" not found or not visible`);
    }
  }

  async selectDimension(toOpen?: boolean, dimensions?: string) {
    if (!toOpen) {
      if (dimensions) {
        if (
          await this.mainIframe
            .getByRole("checkbox", { name: dimensions })
            .isVisible()
        ) {
          await this.mainIframe
            .getByRole("checkbox", { name: dimensions })
            .click();
          return true;
        }
        throw new Error(`Dimension "${dimensions}" not found or not visible`);
      } else {
        if (
          !(await this.mainIframe.getByRole("checkbox").first().isChecked())
        ) {
          await this.mainIframe.getByRole("checkbox").first().click();
        }
      }
    } else {
      await this.dimensions.click();
    }
  }

  async loadData() {
    await this.loadDataButton.click();
    await this.loadDataButton.isHidden();
    await this.loadDataButton.isVisible();
    await this.page.waitForTimeout(5000);
    await this.loadDataButton.isEnabled();
  }

  async clearSelections() {
    await this.clearBtn.click();
  }

  async clickElementByRole(role: string) {
    if (role === "baselineCombobox") {
      await this.baselineCombobox.click();
    } else if (role === "comparedWithCombobox") {
      await this.comparedWithCombobox.click();
    }
    await this.mainIframe.getByRole("option").first().click();
  }

  async verifySavedConfigurations() {
    await this.loadDataButton.isEnabled();
    await this.scenario.click();
    await this.mainIframe.getByRole("checkbox").first().isChecked();
    await this.savedView.click();
    await this.mainIframe.getByRole("radio").first().isChecked();
  }

  async openDateRangePicker() {
    await this.dateRangePicker.click();
  }

  async openElementByType(type: any, name: string) {
    const addComparisonBtn = this.mainIframe.getByRole(type, { name });
    if ((await addComparisonBtn.count()) > 0) {
      await addComparisonBtn.click();
    } else {
      throw new Error(`${name} button not found`);
    }
  }

  async closeDateRangePicker() {
    await this.page.keyboard.press("Escape");
  }

  async verifyDateRangePickerShowsDefaultFiscalYear() {
    const fiscalYear = Utility.getCurrentFiscalYear();
    const selectedColor = "rgb(0, 113, 220)";
    await expect(this.mainIframe.getByText(fiscalYear)).toBeVisible();
    await expect(this.btnHasText("Feb")).toHaveCSS(
      "background-color",
      selectedColor
    );
    await expect(this.btnHasText("Jan")).toHaveCSS(
      "background-color",
      selectedColor
    );
    await this.btnHasText("Quarter").click();
    await expect(this.mainIframe.getByText(fiscalYear)).toBeVisible();
    await expect(this.btnHasText("Q1")).toHaveCSS(
      "background-color",
      selectedColor
    );
    await expect(this.btnHasText("Q4")).toHaveCSS(
      "background-color",
      selectedColor
    );
    await this.btnHasText("Year").click();
    await expect(this.btnHasText(fiscalYear)).toHaveCSS(
      "background-color",
      selectedColor
    );
  }

  async verifyInvalidDate() {
    await this.openDateRangePicker();
    await expect(this.mainIframe.getByText("Feb")).toBeTruthy();
    await this.resetDateRange.click();
    await this.closeDateRangePicker();
    await expect(this.loadDataButton).toBeDisabled();
    await expect(this.mainIframe.getByText("Feb")).toHaveCount(0);
  }

  async selectMultiGrains() {
    await this.mainIframe.getByText("Year").first().click();
    await this.mainIframe.getByText("Show Months").click();
    await this.mainIframe.getByText("Show Quarters").click();
    await this.mainIframe.getByText("Show Halves").click();
  }
}
