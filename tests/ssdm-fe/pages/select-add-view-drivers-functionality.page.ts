import { expect, Locator, Page } from "@playwright/test";
import { PageFactory } from "../../common/pages/page-factory";

export class DriversFunctionality {
    
    readonly page: Page;
    readonly btnAddDrivers: Locator;
    readonly kpi: Locator;
    readonly addDriverWindow: Locator;
    readonly cellsData: Locator;
    readonly pageFactory: PageFactory; 
    
    constructor(page: Page) {
        this.page = page;
        this.kpi = this.page.getByText("kpi");
        this.btnAddDrivers = page.locator('//button[text()="Add drivers"]'); 
        this.addDriverWindow = page.locator('//div[contains(@class,"ModalPortal-module_modal")]');
        this.cellsData = page.locator('//div[@class = "ag-center-cols-viewport"]');
        this.pageFactory = new PageFactory(page);
        
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
            return actualAndForecastData;
          }
          
    }

    async navigateToMyKpiPage(filepath: string){
        await this.pageFactory.ssdmPageFactory().validateFile().verifyValidation(filepath);
        await this.pageFactory.ssdmPageFactory().computeFile().isComputeButtonEnabled();
        await this.pageFactory.ssdmPageFactory().computeFile().clickOnComputeButton();
        await this.pageFactory.ssdmPageFactory().computeFile().verifyComputeIsSuccessful();
        await this.pageFactory.ssdmPageFactory().review().isReviewButtonClickable();
        await this.pageFactory.ssdmPageFactory().drivers().isKpiPageVisible();
    }

    async selectAndViewDriver(inputDriverName: string, inputDriverNameTwo: string){
        await this.pageFactory.ssdmPageFactory().drivers().clickOnAddDriverButton();
        await this.pageFactory.ssdmPageFactory().drivers().isAddDriverWindowVisible();
        await this.pageFactory.ufmPageFactory().addDriverPage().waitForPageLoad();
        await this.pageFactory.ufmPageFactory().addDriverPage().inputDriverName(inputDriverName);
        await this.pageFactory.ufmPageFactory().addDriverPage().selectDriver(inputDriverName);
        await this.pageFactory.ufmPageFactory().addDriverPage().inputDriverName(inputDriverNameTwo);
        await this.pageFactory.ufmPageFactory().addDriverPage().selectDriver(inputDriverNameTwo);
        await this.pageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers();
        await this.pageFactory.ufmPageFactory().openCurrentForecast().validateDriverPresence(inputDriverName);
    }

}