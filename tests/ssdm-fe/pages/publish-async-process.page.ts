import { expect, Locator, Page } from "@playwright/test";
import { testData } from "../testdata/fileName.json"

export class AsyncPublishFunctionality {

    readonly page: Page;
    readonly btnToolTipPublish: Locator;
    readonly tooltipContent: Locator;
    readonly btnPublish: Locator;
    readonly btnConfirm: Locator;
    readonly publishInProgressStatus: Locator;
    readonly progressbar: Locator;
    readonly btnSsdm: Locator;
    readonly progressPctOnNEGrid: Locator;
    readonly publishStatus: Locator;


    constructor(page: Page) {
        this.page = page;
        this.btnToolTipPublish = this.page.locator('(//button[contains(@class,"allocation-icon-btn")])[1]');
        this.tooltipContent = this.page.locator('//div[@class="popover-main-text"]');
        this.btnPublish = this.page.locator('//button[text()="Publish"]');
        this.btnConfirm = this.page.locator('//button[text()="Confirm"]');
        this.publishInProgressStatus = this.page.locator('//p[@class="publishStatusLbl"]');
        this.progressbar = this.page.locator('//span[contains(@role, "progressbar")]');
        this.btnSsdm = this.page.locator('//span[text()="ssdm"]');
        this.progressPctOnNEGrid = this.page.locator('//span[contains(@class,"ProgressIndicator-module_label_")]');
        this.publishStatus = this.page.locator('(//span[contains(@class,"status-info-text")])[1]');

    }
    async clickOnToolTip() {
        await this.btnToolTipPublish.isVisible();
        await this.btnToolTipPublish.click();

    }

    async visibilityOftoolTipDetails() {
        await this.tooltipContent.isVisible();
        const toolTipText = await this.tooltipContent.innerText();
        const toolTipRegex = /^Last published: \w+ \d+, \d+ at \d+:\d+ (AM|PM) by \S+$/;
        await expect(toolTipText).toMatch(toolTipRegex);
    }

    async isPublishButtonHidden() {
        await expect(this.btnPublish).toBeHidden();
    }

    async clickOnConfirmButtonOnPublishModal() {
        await this.btnConfirm.click();
    }

    async visibilityOfPublishProgressTracker() {
        await this.progressbar.isVisible();
    }

    async visibilityOfPublishInProgressMessage() {
        await this.publishInProgressStatus.isVisible();
        const publishInProgressMessage = await this.publishInProgressStatus.innerText();
        const publishInProgressMessagePattern = new RegExp(testData.publishInProgressMessagePattern);
        await expect(publishInProgressMessage).toMatch(publishInProgressMessagePattern);
    }

    async visibilityOfContinuousPublishStatusOnClickingToolTip() {
        await this.tooltipContent.isVisible();
        const toolTipText = await this.tooltipContent.innerText();
        const pattern = new RegExp(testData.publishInProgressToolTipText);
        await expect(toolTipText).toMatch(pattern);
    }

    async enterESCKey() {
        await this.page.keyboard.press('Escape');
    }

    async navigatesBackToHomePage() {
        await this.btnSsdm.click();

    }

    async verifyProgressPctOnMyKpi() {
        const percentageMatch = await this.publishInProgressStatus.innerText();
        const kpiPercentage = percentageMatch?.match(/(\d+)%/)?.[1] ?? 'Percentage not found';
        console.log(`Percentage: ${kpiPercentage}`);
        return kpiPercentage;

    }

    async verifyProgressPctOnNEGrid() {
        const percentageNoMatch = await this.progressPctOnNEGrid.innerText();
        const homePagePercentage = percentageNoMatch?.match(/(\d+)%/)?.[1] ?? 'Percentage not found';
        console.log(`Percentage: ${homePagePercentage}`);
        return homePagePercentage;

    }

    async isPublishButtonVisible() {
        await expect(this.btnPublish).toBeVisible();
    }

    async isToolTipHidden() {
        await expect(this.btnToolTipPublish).toBeHidden();
    }
    async isPublishProgressTrackerHidden() {
        await this.progressbar.isHidden();
    }


    async isToolTipAndProgressBarHiddenInNEGrid() {
        const statusText = await this.publishStatus.innerText();
        console.log("Status is:", statusText);
        if (statusText.includes('success') || statusText.includes('failure')) {
            console.log(`${statusText} status found`);
            await expect(this.btnToolTipPublish).toBeHidden();
            await expect(this.progressbar).toBeHidden();
        }
    }
}