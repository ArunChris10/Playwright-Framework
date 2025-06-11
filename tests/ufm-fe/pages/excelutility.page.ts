import { Page, expect, Locator } from '@playwright/test';
import * as XLSX from 'xlsx';
import * as path from 'path';
const { execSync } = require('child_process');
const fs = require('fs');

export class ExcelUtility {
    readonly page: Page;
    readonly downloadButtonSelector: Locator;
    readonly uploadButtonSelector: Locator;
    readonly fileInputSelector: Locator;

    constructor(page: Page) {
        this.page = page;
        this.downloadButtonSelector = page.locator('//div[@class="forecastTableHeader"]//div[@class="action"]//button[@test-data="icon-button"])[1]');
        this.uploadButtonSelector = page.locator('//div[@class="forecastTableHeader"]//div[@class="action"]//button[@test-data="icon-button"])[2]');
        // Update the selector below to match the actual file input element in your UI
        this.fileInputSelector = page.locator('input[type="file"]');
    }
    private editedValues: Record<string, any> = {};

    // Downloads the Excel file via UI action and returns the file path
    async downloadExcel(): Promise<string> {
        console.log(`[ExcelUtility] Waiting for download to start...`);
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            await this.downloadButtonSelector.click(),
        ]);
        // Create the download path and file name
        const downloadDir = path.join(process.cwd(), 'tests', 'ufm-fe', 'downloadExcelForTest');
        if (!require('fs').existsSync(downloadDir)) {
            require('fs').mkdirSync(downloadDir, { recursive: true });
        }
        const timestamp = Date.now();
        const downloadedFileName = `driverDataTest${timestamp}.xlsx`;
        const downloadPath = path.join(downloadDir, downloadedFileName);
        await download.saveAs(downloadPath);
        console.log(`[ExcelUtility] Downloaded file saved to: ${downloadPath}`);
        return downloadPath;
    }

    // Edits the Excel file and updates the 6th column of the specified rows
    editExcel(
        filePath: string,
        rowFirstCellNames: string[],
    ): Record<string, any> {
        console.log(`[ExcelUtility] Reading Excel file: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });

        // 6th column is index 5 (0-based)
        const targetColIndex = 5;

        rowFirstCellNames.forEach(rowFirstCellName => {
            const rowIndex = jsonData.findIndex(row => row[0] === rowFirstCellName);
            if (rowIndex === -1) throw new Error(`Row "${rowFirstCellName}" not found`);
            const randomValue = Math.floor(Math.random() * 10000);
            jsonData[rowIndex][targetColIndex] = randomValue;
            this.editedValues[`${rowFirstCellName}_col${targetColIndex + 1}`] = randomValue;
            console.log(`[ExcelUtility] Set value at row "${rowFirstCellName}", column 6 to ${randomValue}`);
        });

        // Write back to Excel
        if (process.platform === 'win32') {
            try {
                execSync('taskkill /IM excel.exe /F', { stdio: 'ignore' });
                console.log('[ExcelUtility] Closed any running Excel processes.');
            } catch (err) {
                console.warn('[ExcelUtility] Could not close Excel process (it may not be running).');
            }
        }
        const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData as any[][]);
        workbook.Sheets[sheetName] = newWorksheet;
        XLSX.writeFile(workbook, filePath);
        console.log(`[ExcelUtility] Excel file updated and saved: ${filePath}`);
        // If only one row is edited, return just the value; otherwise, return an array of values
        if (rowFirstCellNames.length === 1) {
            return jsonData[jsonData.findIndex(row => row[0] === rowFirstCellNames[0])][targetColIndex];
        } else {
            return rowFirstCellNames.map(rowFirstCellName => 
            jsonData[jsonData.findIndex(row => row[0] === rowFirstCellName)][targetColIndex]
            );
        }
    }

    // Uploads the edited Excel file via UI
    async uploadExcel(filePath: string): Promise<void> {
        await this.uploadButtonSelector.click();
        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            await this.fileInputSelector.click(), 
        ]);
        console.log(`[ExcelUtility] Uploading file: ${filePath}`);
        await fileChooser.setFiles(filePath);
        console.log(`[ExcelUtility] File uploaded: ${filePath}`);
    }

   /*  // Validates the values on the UI
    async validateValuesOnUI(
        page: Page,
        valueSelectors: Record<string, string>, // key: `${rowFirstCellName}_${header}`, value: selector
    ): Promise<void> {
        for (const key in this.editedValues) {
            const selector = valueSelectors[key];
            const expectedValue = this.editedValues[key];
            const actualValue = await page.textContent(selector);
            console.log(`[ExcelUtility] Validating selector "${selector}": expected "${expectedValue}", actual "${actualValue?.trim()}"`);
            expect(actualValue?.trim()).toBe(expectedValue.toString());
        }
    }

    // Getter for edited values (for further use)
    getEditedValues() {
        console.log(`[ExcelUtility] Returning edited values:`, this.editedValues);
        return this.editedValues;
    } */

    async deleteDownloadedFile(filePath: string): Promise<void> {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[ExcelUtility] Deleted file: ${filePath}`);
        } else {
            console.warn(`[ExcelUtility] File not found for deletion: ${filePath}`);
        }
    }
}