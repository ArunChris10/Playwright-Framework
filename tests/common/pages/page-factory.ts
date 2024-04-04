import { Page } from "@playwright/test";
import { CDFPageFactory } from "../../cdf-fe/pages/cdf-page-factory";
import { Home } from "./home.page";
import { LoginPage } from "./login.page";

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
}