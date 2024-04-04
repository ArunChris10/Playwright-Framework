import { Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

export class DemandWorkspace {

  private readonly page: Page;
  private readonly btnFirstTileMenu: Locator;
  private readonly btnScenarioMenu;
  private readonly btnConfirm : Locator;
  private readonly urlEndpoint = process.env.cdfAppBaseURL+"";


  constructor(page: Page) {
    this.page = page;
    this.btnFirstTileMenu = page.locator("#basic-button");
    this.btnScenarioMenu = function (scenarioName) {
      return this.page.locator(
        'button#basic-button:right-of(:text("' + scenarioName + '"))'
      );
    };
    this.btnConfirm = page.getByRole("button", { name: "Confirm" });
  }

  async getScenarioLockStatus(scenarioName: string) {
    let txtTitle = await this.page
      .locator('svg:right-of(:text("' + scenarioName + '"))')
      .first()
      .locator("..")
      .getAttribute("title");
    return txtTitle;
  }

  async openMenuOptionFromExistingScenario(option:string) {
    await Utility.waitForLoaderToBeInvisible(this.page);
    await this.btnFirstTileMenu.first().click();
    await this.selectScenarioMenu(option);
  }

  async selectScenarioMenu(option: string) {
    await this.page.getByRole("menuitem", { name: option }).click();
    await Utility.waitForLoaderToBeInvisible(this.page);
  }

  async openScenarioMenuFor(scenarioName: string) {
    await this.btnScenarioMenu(scenarioName).first().click();
  }

  async waitForScenarioToBeVisible(scenarioName: string) {
    await this.page
      .getByText(scenarioName)
      .first()
      .waitFor({ state: "visible", timeout: 420000 });
  }

  async waitForScenarioCreation(scenarioName:string, maxPoll: number) {
    let waitCount = maxPoll;

    while (waitCount > 0 && !(await this.btnScenarioMenu(scenarioName).first().isEnabled())) {
      await this.page.reload();
      await Utility.waitForLoaderToBeInvisible(this.page);
      waitCount--;
    }
  }

  async deleteScenario(dssName: string) {
    await this.openScenarioMenuFor(dssName);
    await this.selectScenarioMenu('Delete')
    await this.btnConfirm.click();
    await Utility.waitForLoaderToBeInvisible(this.page);
  }

  async navigate(){    
    await this.page.goto(this.urlEndpoint, {
      timeout: 500000,
    });
  }
}
