import { Locator, Page, expect } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../testdata/create-adjustment-layer.json";

export class AdjustmentLayer {
  private readonly page: Page;
  readonly intelLayer: string;
  private readonly noRows: Locator;
  private readonly createLayer: Locator;
  private readonly emtMenu: Locator;
  private readonly emtNameInput: Locator;
  private readonly emtDescInput: Locator;
  private readonly emtSaveButton: Locator;
  private readonly emtExpandSBU: Locator;
  private readonly emtFoodSBUNode: Locator;
  private readonly emtSpinButton: Locator;
  private readonly emtConfirmButton: Locator;
  private readonly emtGenrtPrevButton: Locator;
  private readonly emtResetButton: Locator;
  private readonly emtBackAdjstButton: Locator;
  private readonly adjustmentTab: Locator;
  private readonly openLayer: Locator;
  private readonly proceedDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.intelLayer =
      '//div[contains(@col-id,"intelName") and @role="gridcell"]';
    this.noRows = this.page.getByText("No Rows To Show");
    this.createLayer = this.page.getByRole("button", {
      name: "Create",
      exact: true,
    });
    this.emtMenu = this.page.getByRole("menuitem", {
      name: "Effective Mover Tool",
    });
    this.emtNameInput = this.page
      .getByLabel("Add Layer Metadata")
      .getByPlaceholder("Name");
    this.emtDescInput = this.page.getByPlaceholder("Reason for change");
    this.emtSaveButton = this.page.getByRole("button", { name: "Save" });
    this.emtExpandSBU = this.page
      .getByTestId("fromEmtTree")
      .getByTitle("SBU")
      .getByLabel("expandMenu");
    this.emtFoodSBUNode = this.page.getByLabel("Food");
    this.emtSpinButton = this.page.getByRole("spinbutton");
    this.emtConfirmButton = this.page.getByRole("button", { name: "Confirm" });
    this.emtGenrtPrevButton = this.page.getByRole("button", {
      name: "Generate preview",
    });
    this.emtResetButton = this.page.getByRole("button", {
      name: "Reset",
      exact: true,
    });
    this.emtBackAdjstButton = this.page.getByRole("button", {
      name: "Back to adjustment",
    });
    this.adjustmentTab = this.page.locator(
      "div:nth-child(3) > .LaunchpadNavigation_marginLeft__ZVyJx > .Card-module_card__1r4qX > .Card-module_cardItem__2D4Q_"
    );
    this.openLayer = this.page
      .getByLabel("Press SPACE to deselect this")
      .locator("svg")
      .nth(1);
    this.proceedDialog = this.page.getByRole("button", {
      name: "Proceed without saving",
    });
  }

  async addNameAndDesc({ name, desc }) {
    await this.adjustmentTab.click();
    await this.createLayer.click();
    await this.emtMenu.click();
    await this.emtNameInput.click();
    await this.emtNameInput.fill(name);
    await this.emtDescInput.click();
    await this.emtDescInput.fill(desc);
    await this.emtSaveButton.click();
    await this.emtExpandSBU.click();
    await this.emtFoodSBUNode.check();
    await this.emtSpinButton.click();
    await this.emtSpinButton.fill(testdata.foodValue);
  }
  async previewNotSaved() {
    await this.addNameAndDesc({
      name: testdata.tempName,
      desc: testdata.tempDesc,
    });
    await this.emtGenrtPrevButton.click();
    await this.emtResetButton.click();
    await this.emtBackAdjstButton.click();
    await this.proceedDialog.click();
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
    if ((await this.noRows.count()) !== 0) {
      await Utility.validateDataInGridAvailable(this.page, this.intelLayer);
      const layers = this.page.locator(this.intelLayer);
      await expect(layers).not.toContainText(testdata.tempName);
    }
  }

  async createAndSave() {
    await this.addNameAndDesc({ name: testdata.name, desc: testdata.desc });
    await this.emtConfirmButton.click();
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page);
    // await Utility.waitForSpinnerToBeInvisible(this.page);
    await Utility.validateDataInGridAvailable(this.page, this.intelLayer);
    const allLayers = this.page.locator(this.intelLayer);
    expect(allLayers).toContainText(testdata.name);
  }
  async loadSelectedLayer() {
    await this.openLayer.click();
    await this.emtExpandSBU.click();
    await expect(this.emtFoodSBUNode).toBeChecked();
  }
}
