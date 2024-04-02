import { expect, Locator, Page } from "@playwright/test";
import debug from "debug";
import fs from "fs";
import { Utility } from "../../common/fixtures/utils";
import { OrganisationSelection } from "./organisation-selection.page";
import { CreateForecastPopup } from "./create-forecast.-popup.page";
import { OpenCurrentForecast} from '../pages/open-forecast.page';
import forecast from '../testdata/forecast.json'

export class CurrentForecast {
  readonly page: Page;
  readonly lnkOrganisationSelection: Locator;
  readonly createForecastButton: Locator;
  readonly sbaName: Locator;
  
  constructor(page: Page) {

    this.page = page;
    this.lnkOrganisationSelection = page.getByText("Organization Selection");
    this.createForecastButton = page.getByText('Create forecast');
}

  async gotoOrganisationSelection() {

    await this.lnkOrganisationSelection.click();
    let organisationSelection = new OrganisationSelection(this.page);
  }

  async clickOnCreateForecast(){

    await this.createForecastButton.click(); 
    return new CreateForecastPopup(this.page)
  }

  async verifySBAName(breadCrumName:string) {

    const sbaNameText = await this.page.getByText(`${breadCrumName}`).innerText();
    console.log(sbaNameText)
    expect(sbaNameText).toBe(forecast.Merch.sbaBreadCrumName);
    return new OpenCurrentForecast(this.page);
  }
}