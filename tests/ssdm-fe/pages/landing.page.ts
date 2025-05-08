import { expect, Locator, Page } from "@playwright/test";
import { testData } from '../testdata/fileName.json';

export class LandingPageValidation {
    readonly page: Page;
    readonly searchBox: Locator;
    readonly btnInput: Locator;
    readonly btnCalculations: Locator;
    readonly drpSortGroupBy: Locator;
    readonly btnSettings: Locator;
    readonly btnFilter: Locator;
    readonly searchFilter: Locator;
    readonly searchResult: Locator;
    readonly btnClearFilter: Locator;
    readonly checkbox: Locator;
    readonly sort_AZ: Locator;
    readonly sort_ZA: Locator;
    readonly recentUpdate: Locator; 
    readonly btnClose: Locator;
    readonly sameNode: Locator;
    readonly owner: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchBox = page.locator('input[type="search"]');
        this.btnInput = page.locator('//button[text()="Inputs"]');
        this.btnCalculations = page.locator('//button[text()="Calculations"]');
        this.drpSortGroupBy = page.locator('//button[text()="Sort / Group by"]');
        // '//div[text()="Sort / Group by"]'
        // ' //div[contains(@class,"MuiBox-root css-1xswck6")]'
        this.btnSettings = page.locator('//button[aria-label="Gear"]')
        this.btnFilter = page.locator('//button[aria-label="Filter"]')
        this.searchFilter = page.locator('//input[contains(@class,"textfield")]');
        this.searchResult = page.locator('//i[contains(@class,"ld")]');
        this.btnClearFilter = page.locator('//button[text()="Clear Filter"]');
        this.checkbox = page.locator('input[type="checkbox"]');
        this.sort_AZ = page.locator('div[text()="Metric Name - A-Z"]');
        this.sort_ZA = page.locator('div[text()="Metric Name - Z-A"]');
        this.recentUpdate = page.locator('div[text()="Recently Updated"]');
        this.btnClose = page.locator('//button[text()="Close"]');
        this.sameNode = page.locator('div[text()="Same node variations"]');
        this.owner = page.locator('div[text()="Owner"]');
    }

    async Search(){
       await this.searchBox.isVisible();
    }

    async Count(){
      await this.btnInput.isVisible();
      await this.btnCalculations.isVisible();
    }
    
    async SortGroup(){
      await this.drpSortGroupBy.isVisible();
    }

    async Settings(){
      await this.btnSettings.isVisible();
    }
    async Filter(){
      await this.btnFilter.isVisible();
    }
    async completeSearch(){
      await this.searchBox.click();
      await this.searchBox.fill('Cost per Delivery');
    }
    async partialSearch(){
      await this.searchBox.click();
      await this.searchBox.fill('Cost per');
    }
    async incorrectSearch(){
      await this.searchBox.click();
      await this.searchBox.fill('Growth');
    }
    async monthFilter(){
      await this.btnFilter.isVisible();
      await this.btnFilter.click();
    }
    async channelFilter(){
      await this.btnFilter.isVisible();
      await this.btnFilter.click();
    }
    async ownerFilter(){
      await this.btnFilter.isVisible();
      await this.btnFilter.click();
     }
    async departmentFilter(){
      await this.btnFilter.isVisible();
      await this.btnFilter.click();
    }
    async entityFilter(){
      await this.btnFilter.isVisible();
      await this.btnFilter.click();
    }
    async clearAllFilter(){
     await this.btnClearFilter.isVisible();
      await this.btnClearFilter.click();
    }
    async tableSettings(){
      await this.checkbox.isVisible();
      await this.checkbox.click();
      await this.btnClose.click();
    }

    async sortAZ(){
       await this.drpSortGroupBy.click();
       await this.sort_AZ.click();
    }
    async sortZA(){
      await this.drpSortGroupBy.click();
      await this.sort_ZA.click();
    }
    async recentupdate(){
      await this.drpSortGroupBy.click();
      await this.recentUpdate.click();
    }
    async groupNode(){
      await this.drpSortGroupBy.click();
      await this.sameNode.click();
    }
    async groupOwner(){
      await this.drpSortGroupBy.click();
      await this.owner.click();
  }
}