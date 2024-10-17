import { expect, Locator, Page } from "@playwright/test";
import { PageFactory } from "../../common/pages/page-factory";
import { testData } from '../testdata/fileName.json';

export class DriversFunctionality {
    
    readonly page: Page;
    readonly btnAddDrivers: Locator;
    readonly kpi: Locator;
    readonly addDriverWindow: Locator;
    readonly cellsData: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.kpi = this.page.getByText("kpi");
        this.btnAddDrivers = page.locator('//button[text()="Add Drivers"]'); 
        this.addDriverWindow = page.locator('//div[contains(@class,"ModalPortal-module_modal")]');
        this.cellsData = page.locator('//div[@class = "ag-center-cols-viewport"]');
        
    }
 
    async isKpiPageVisible(){
        await this.kpi.isVisible(); 
           
    }

    async clickOnAddDriverButton(){
        await this.btnAddDrivers.click();
    }

    async isAddDriverWindowVisible(){
        let isAddDriverWindowVisible = await this.addDriverWindow.isVisible();
        expect(isAddDriverWindowVisible).toBeTruthy();
    }

    async isActualsAndForecastDataVisible(){
        for (const cellValues of await this.cellsData.elementHandles()) {
            const actualAndForecastData = await cellValues.innerText();
            expect(actualAndForecastData).not.toBeNull();
          }
    }

    async navigateToMyKpiPage(filepath: string){
        let objpageFactory = new PageFactory(this.page);
        await objpageFactory.ssdmPageFactory().validateFile().verifyValidation(filepath);
        await objpageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
        await objpageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();
        await objpageFactory.ssdmPageFactory().computeFile().verifyComputeIsSuccessful();
        await objpageFactory.ssdmPageFactory().review().isReviewButtonClickable();
        await objpageFactory.ssdmPageFactory().drivers().isKpiPageVisible();
    }

}