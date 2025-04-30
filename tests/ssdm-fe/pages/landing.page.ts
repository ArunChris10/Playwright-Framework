import { expect, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import { PageFactory } from "../../common/pages/page-factory";
import { testData } from '../testdata/fileName.json';

export class LandingPageValidation {
    readonly page: Page;
    readonly search: Locator;
    readonly btnInput: Locator;
    readonly btnCalculations: Locator;
    readonly drpSortGroupBy: Locator;
    readonly btnSettings: Locator;
    readonly btnFilter: Locator;

    constructor(page: Page) {
        this.page = page;
        this.search = page.locator('[placeholder="Search"]');
        this.btnInput = page.locator('//button[text()="Inputs"]');
        this.btnCalculations = page.locator('//button[text()="Calculations"]');
        this.drpSortGroupBy = page.locator('//button[text()="Sort / Group by"]');
        ' //div[contains(@class,"MuiBox-root css-1xswck6")]'
        this.btnSettings = page.locator('//button[aria-label="Gear"]')
        this.btnFilter = page.locator('//button[aria-label="Filter"]')
    }

    async Search({ search }){
      await expect(search).toBeVisible();
      await expect(search).toBeEnabled();
      await expect(search).toHaveTitle('Search')
    }

    async Count({ btnInput, btnCalculation }){
      await expect(btnInput).toBeVisible();
      await expect(btnInput).toBeEnabled();
      await expect(btnCalculation).toBeVisible();
      await expect(btnCalculation).toBeEnabled();
    }
    
    async SortGroup({ drpSortGroupBy }){
      await expect(drpSortGroupBy).toBeVisible();
      await expect(drpSortGroupBy).toBeEnabled();
    }

    async Settings({ btnSettings }){
      await expect (btnSettings).toBeVisible();
      await expect (btnSettings).toBeEnabled();
    }
    async Filter ({btnFilter}){
      await expect (btnFilter).toBeVisible();
      await expect (btnFilter).toBeEnabled();
    }

}