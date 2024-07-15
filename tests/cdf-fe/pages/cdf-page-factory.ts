import { Page } from "@playwright/test";
import { CopyScenario } from "./copy-scenario.page";
import { DemandWorkspace } from "./demand-workspace.page";
import { Visualizer } from "./visualizer.page";
import { CurrentDemand } from "./currentdemand.page";
import { dssPage } from "./dssPage.page";
import { DemandOutput } from "./demand-output.page";
import { AdjustmentLayer } from "./adjustment-layer.page";

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

  visualizer() {
    return new Visualizer(this.page);
  }

  currentDemand() {
    return new CurrentDemand(this.page);
  }

  dssPage() {
    return new dssPage(this.page);
  }

  demandOutput() {
    return new DemandOutput(this.page);
  }
  adjustmentLayer() {
    return new AdjustmentLayer(this.page);
  }
}
