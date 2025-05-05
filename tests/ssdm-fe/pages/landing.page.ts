import { expect, Locator, Page } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";
import { PageFactory } from "../../common/pages/page-factory";
import { testData } from '../testdata/fileName.json';

export class LandingPageValidation {
    readonly page: Page;
    readonly searchBox: Locator;
    readonly btnInput: Locator;
    readonly btnCalculations: Locator;
    readonly drpSortGroupBy: Locator;
    readonly btnSettings: Locator;
    readonly btnFilter: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchBox = page.locator('[placeholder="Search"]');
        this.btnInput = page.locator('//button[text()="Inputs"]');
        this.btnCalculations = page.locator('//button[text()="Calculations"]');
        this.drpSortGroupBy = page.locator('//button[text()="Sort / Group by"]');
        // ' //div[contains(@class,"MuiBox-root css-1xswck6")]'
        this.btnSettings = page.locator('//button[aria-label="Gear"]')
        this.btnFilter = page.locator('//button[aria-label="Filter"]')
    }

    async Search(){
       await this.searchBox.isVisible();
      // await expect(searchBox).toBeEnabled();
      await expect(this.searchBox).toHaveAttribute('placeholder','Search',{timeout: 60000})
    }

    async Count(){
      await expect(this.btnInput).toBeVisible();
      await expect(this.btnInput).toBeEnabled();
      await expect(this.btnCalculations).toBeVisible();
      await expect(this.btnCalculations).toBeEnabled();
    }
    
    async SortGroup(){
      await expect(this.drpSortGroupBy).toBeVisible();
      await expect(this.drpSortGroupBy).toBeEnabled();
    }

    async Settings(){
      await expect (this.btnSettings).toBeVisible();
      await expect (this.btnSettings).toBeEnabled();
    }
    async Filter(){
      await expect (this.btnFilter).toBeVisible();
      await expect (this.btnFilter).toBeEnabled();
    }

}