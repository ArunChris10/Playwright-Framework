import { Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../testdata/create-manualadjustment-flattened.json";

export class ManualAdjustmentFlattened {
  private readonly page: Page;
  readonly intelLayer: string;
  private readonly createLayer: Locator;
  private readonly flattenedMenu: Locator;
  private readonly flattenedNameInput: Locator;
  private readonly flattenedDescInput: Locator;
  private readonly flattenedCreateButton: Locator;
  private readonly adjustmentTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.intelLayer =
      '//div[contains(@col-id,"intelName") and @role="gridcell"]';
    this.createLayer = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    this.flattenedMenu = this.page.getByRole("menuitem", {
      name: "Manual Adjustment - flattened",
    });
    this.flattenedNameInput = this.page.locator("#react-aria-2-21");
      
    this.flattenedDescInput = this.page.locator("#react-aria-2-22");
    this.flattenedCreateButton = this.page.getByRole("button", {
      name: "Create",
    });
    this.adjustmentTab = this.page.getByText("Adjustment", { exact: true });
  }

  async addNameAndDesc({ name, desc }) {
    await this.adjustmentTab.click();
    await this.createLayer.click();
    await this.flattenedMenu.click();
    await this.flattenedNameInput.click();
    await this.flattenedNameInput.fill(name);
    await this.flattenedDescInput.click();
    await this.flattenedDescInput.fill(desc);
    await this.flattenedCreateButton.click();
  }

  async createAndSave() {
    await this.addNameAndDesc({ name: testdata.name, desc: testdata.desc });
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
  }
}
