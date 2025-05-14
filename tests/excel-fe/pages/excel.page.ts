import { expect, FrameLocator, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class ExcelPage {
  readonly page: Page;
  readonly parentIframe: FrameLocator;
  readonly mainIframe: FrameLocator;
  readonly getStartedBtn: Locator;
  readonly businessArea: Locator;
  readonly dateRangePicker: Locator;
  readonly btnHasText: Function;
  readonly savedView: Locator;
  readonly scenario: Locator;
  readonly loadDataButton: Locator;
  readonly spinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.parentIframe = page.frameLocator("#WacFrame_Excel_0");
    this.mainIframe = this.parentIframe
      .frameLocator('iframe[title*="Office Add-in IBG Excel Addin"]')
      .first();
    this.getStartedBtn = this.mainIframe.getByRole("button", {
      name: "Get Started",
    });
    this.businessArea = this.mainIframe.getByRole("combobox");
    this.dateRangePicker = this.mainIframe.getByTestId("date-range-component");
    this.btnHasText = (text: string) =>
      this.mainIframe.locator("button").filter({ hasText: text });
    this.savedView = this.mainIframe.getByText("Saved Views");
    this.scenario = this.mainIframe.getByText("Scenarios");
    this.loadDataButton = this.mainIframe.getByTestId("LoadDataButton");
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
      if (!(await this.mainIframe.getByRole("checkbox").first().isChecked())) {
        await this.mainIframe.getByRole("checkbox").first().click();
      }
    }
    await this.scenario.click();
  }

  async loadData() {
    await this.loadDataButton.click();
    await this.loadDataButton.isHidden();
    await this.loadDataButton.isVisible();
    await this.page.waitForTimeout(5000);
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
