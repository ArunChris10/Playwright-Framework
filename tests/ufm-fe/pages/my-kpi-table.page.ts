import { Locator, Page } from "@playwright/test";

export class MyKPITablePage {
  readonly page: Page;
  readonly KPITable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.KPITable = page.getByTestId('forecast-table');
  }

  async waitForKPITableToLoad(state: "attached" | "detached" | "visible" | "hidden" | undefined = "visible") {
    await this.KPITable.waitFor({ state: state })
  }

  async switchKPILandingSelectedDriverOrder() {
    const selectedDriversContainer = this.page.locator('//div[@class="kpiForecastTable"]');
    const firstDriverDragHandle = selectedDriversContainer.locator(
        '//div[contains(@class, "ag-drag-handle ag-row-drag")]'
    ).first();
    
    const secondDriverDragHandle = selectedDriversContainer.locator(
        '//div[contains(@class, "ag-drag-handle ag-row-drag")]'
    ).last();
    await firstDriverDragHandle.isVisible();
    await secondDriverDragHandle.isVisible();
    await firstDriverDragHandle.dragTo(secondDriverDragHandle);
    console.log(`Switched order of drivers successfully.`);
  }

  async getKPILandingFirstDriverName() {
    const selectedDriversContainer = this.page.locator('//div[@class="kpiForecastTable"]');
    const firstDriverDragHandle = selectedDriversContainer.locator(
        '//div[contains(@class, "DimensionCellRenderer_cellContainer__RQDdD")]'
    ).first();
    await firstDriverDragHandle.isVisible();
    const firstDriverName = await firstDriverDragHandle.textContent();
    return firstDriverName?.trim() || '';
  }
}