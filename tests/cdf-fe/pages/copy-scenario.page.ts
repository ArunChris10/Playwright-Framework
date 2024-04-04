import { Page, expect, Locator } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class CopyScenario {
  private readonly page: Page;
  private readonly rdoNewScenario: Locator;
  private readonly txtScenarioName: Locator;
  private readonly txtScenarioDescription: Locator;
  private readonly btnCreate: Locator;
  private readonly txtConfirmationMessage: Locator;
  private readonly btnConfirm: Locator;

  constructor(page) {
    this.page = page;
    this.rdoNewScenario = this.page.getByLabel("Yes, I want to create a new");
    this.txtScenarioName = this.page.getByPlaceholder(
      "Demand stack scenario name"
    );
    this.txtScenarioDescription = this.page.getByPlaceholder("Description");
    this.btnCreate = this.page.getByRole("button", { name: "Create" });
    this.txtConfirmationMessage = this.page.getByLabel(
      "Copy request submitted"
    );
    this.btnConfirm = this.page.getByRole("button", { name: "Okay" });
  }

  async createNewDemandScenario(dssName: string, description: string) {
    await this.rdoNewScenario.check();
    await this.txtScenarioName.fill(dssName);
    await this.txtScenarioDescription.fill(description);
    await this.btnCreate.click();

    await Utility.waitForLoaderToBeInvisible(this.page);
  }
  async verifyCopyConfirmation(confimationMessage: string) {
    await expect(this.txtConfirmationMessage).toContainText(
      confimationMessage,
      { timeout: 30000 }
    );
    await this.btnConfirm.click();
    await Utility.waitForLoaderToBeInvisible(this.page);
  }
}
