import { Page } from "@playwright/test";
import { CopyScenario } from "./copy-scenario.page";
import { DemandWorkspace } from "./demand-workspace.page";

export class CDFPageFactory {

  private readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  demandWorkspace() {
    return new DemandWorkspace(this.page);
  }
  copyScenario() {
    return new CopyScenario(this.page);
  }
}
