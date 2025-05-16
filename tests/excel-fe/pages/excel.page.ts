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
  readonly businessArea: Locator;
  readonly dateRangePicker: Locator;
  readonly btnHasText: Function;

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
    this.businessArea = this.mainIframe.getByRole("combobox");
    this.dateRangePicker = this.mainIframe.getByTestId("date-range-component");
    this.btnHasText = (text: string) =>
      this.mainIframe.locator("button").filter({ hasText: text });
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

  async getStarted() {
    await this.getStartedBtn.click();
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
  }

  async openDateRangePicker() {
    await this.dateRangePicker.click();
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
}
