import { Page } from "@playwright/test";
import { CDFPageFactory } from "../../cdf-fe/pages/cdf-page-factory";
import { Home } from "./home.page";
import { LoginPage } from "./login.page";
import { UFMPageFactory } from "../../ufm-fe/pages/ufm-page-factory";
import { Utility } from "../fixtures/utils";
import { SSDMPageFactory } from "../../ssdm-fe/pages/ssdm-page-factory";
import { ForecastComparisonPageFactory } from "../../ufm-fe/pages/forecast-compare.page";
import { ExcelPage } from "../../excel-fe/pages/excel.page";
import { LoginExcelPage } from "./login-excel.page";

export class PageFactory {
    private readonly page: Page;
    constructor(page: Page) {
        this.page = page;
    }
    login() {
        return new LoginPage(this.page);
    }
    home() {
        return new Home(this.page);
    }
    cdfPageFactory() {
        return new CDFPageFactory(this.page);
    }

    ufmPageFactory() {
        return new UFMPageFactory(this.page)
    }

    utilities() {
        return new Utility(this.page)
    }

    ssdmPageFactory() {
        return new SSDMPageFactory(this.page)
    }

    forecastComparisonPageFactory() {
        return new ForecastComparisonPageFactory(this.page);
    }

    loginExcel() {
        return new LoginExcelPage(this.page);
    }

    excel() {
        return new ExcelPage(this.page);
    }

    quit() {
        this.page.close()
    }

    
}