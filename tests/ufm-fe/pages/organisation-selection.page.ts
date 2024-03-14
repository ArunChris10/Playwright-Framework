import { Locator, Page } from "@playwright/test";
import debug from "debug";
import fs from "fs";
import { Utility } from "../../common/fixtures/utils";
import { CurrentForecast } from "./current-forecast.page";


export class OrganisationSelection {
  readonly page: Page;


  constructor(page: Page) {
    this.page = page;

  }

  async selectOrganisation(organisationName:string) {
    await this.page.getByText(organisationName).click();
    return new CurrentForecast(this.page);
  }

  async isOrganisationSelectionNavigated(){
    return await this.page.getByText('Choose an organization to view UFM forecasts').isVisible();
  }




}
