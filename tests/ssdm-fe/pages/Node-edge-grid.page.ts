import { expect, Locator, Page } from "@playwright/test";
import * as fs from 'fs';
import { Utility } from "../../common/fixtures/utils";

export class nodeEdgeGridFunctionality {

    readonly page: Page;
    readonly nodeEdgeVersionsGrid: Locator;
    readonly nodeEdgeDetails: Locator;
    readonly publishDateAndTime: Locator;
    readonly ownerName: Locator;
    readonly newInputNodes: Locator;
    readonly status: Locator;
    readonly actions: Locator;
    readonly btnDownload: Locator;

    constructor(page: Page) {
        this.page = page;
        this.nodeEdgeVersionsGrid = this.page.locator('//div[@class = "publishContainer"]');
        this.nodeEdgeDetails = this.page.locator('//div[contains(@class,"row-position-absolute")]');
        this.publishDateAndTime = this.page.locator('//span[text()="Publish Date & time"]');
        this.ownerName = this.page.locator('//span[text()="Owner"]');
        this.newInputNodes = this.page.locator('//span[text()="Net new input nodes"]');
        this.status = this.page.locator('//span[text()="Status"]');
        this.actions = this.page.locator('//span[text()="Actions"]');
        this.btnDownload = this.page.locator('(//button[contains(@class,"tertiary")])[1]');
    }
    async visibiltyOfNodeEdgeGrid() {
        await expect(this.nodeEdgeVersionsGrid).toBeVisible();

    }
    async noOfPublishVersions() {
        await expect(this.nodeEdgeDetails).toHaveCount(10);
    }

    async visibiltyOfPublishedNodeEdgeDetails() {
        await expect(this.publishDateAndTime).toBeVisible();
        await expect(this.ownerName).toBeVisible();
        await expect(this.newInputNodes).toBeVisible();
        await expect(this.status).toBeVisible();
        await expect(this.actions).toBeVisible();
    }

    async verifyFileDownloaded() {
        const [downloads] = await Promise.all([
            this.page.waitForEvent('download'),
            this.btnDownload.click(),
        ]);

        const downloadPath = await Utility.downloadAndSaveCSVNodeEdgeFile(downloads);
        const doesFileExist = await Utility.checkCSVFileExistence(downloadPath);
        if (doesFileExist) {
            console.log("File downloaded successfully");
            expect(doesFileExist).toBeTruthy();
            fs.unlinkSync(downloadPath);
        } else {
            console.log("File download failed");
        }
    }
}