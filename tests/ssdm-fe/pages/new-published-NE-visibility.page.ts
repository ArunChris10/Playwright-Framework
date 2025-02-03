import { expect, Locator, Page } from "@playwright/test";

export class NewPublishedNodeEdgeFunctionality {

    readonly page: Page;
    readonly btnSSDM: Locator;
    readonly documentName: Locator;
    readonly statusOfNewlyPublishedNE: Locator;
    readonly newlyPublishedDocDateAndTime: Locator;
    readonly refreshNETable: Locator;


    constructor(page: Page) {
        this.page = page;
        this.btnSSDM = this.page.locator('//span[text()="ssdm"]');
        this.documentName = this.page.locator('//div[contains(@class,"ag-row-first")]//child::div[@col-id="document_name"]');
        this.statusOfNewlyPublishedNE = this.page.locator('//div[contains(@class,"ag-row-first")]//child::div[@col-id="ststus"]');
        this.newlyPublishedDocDateAndTime = this.page.locator('//div[contains(@class,"ag-row-first")]//child::div[@col-id="published_at"]');
        this.refreshNETable = this.page.locator('//div[@class="publishContainer"]/div/button/span[contains(@class,"MuiTouchRipple")]');

    }
    async navigateBackToSSDMHomePage() {
        await this.btnSSDM.isVisible();
        await this.btnSSDM.click();
    }

    async refresheNEGrid() {
        await this.refreshNETable.click();
    }

    async visibilityOfNewlyPublishedDocName() {
        const publishedDocumentName = await this.documentName.innerText();
        return publishedDocumentName;

    }

    async visibilityOfNewlyPublishedNEStatus() {
        const newlyPublishedDocumentStatus = await this.statusOfNewlyPublishedNE.innerText();
        return newlyPublishedDocumentStatus;

    }

    async visibilityOfNewlyPublishedDocDateAndTime(dateAndTimePattern:string) {
            const newlyPublishedDocumentDateAndTime = await this.newlyPublishedDocDateAndTime;
            const dateTimeText = await newlyPublishedDocumentDateAndTime.innerText();
            expect(dateTimeText).toMatch(new RegExp(dateAndTimePattern));
            expect(await newlyPublishedDocumentDateAndTime.isVisible()).toBe(true);
        }
}