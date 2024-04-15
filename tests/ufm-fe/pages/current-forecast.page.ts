import { expect, Locator, Page } from "@playwright/test";
import { CreateForecastPopup } from "./create-forecast.-popup.page";
import { OpenCurrentForecast } from '../pages/open-forecast.page';
import forecast from '../testdata/forecast.json';
import { DateTime } from "luxon";
import { Utility } from '../../common/fixtures/utils';
import testdata from '../../ufm-be/testdata/deadlinedate-api.json';

export class CurrentForecast {

  readonly page: Page;
  readonly lnkOrganisationSelection: Locator;
  readonly createForecastButton: Locator;
  readonly sbaName: Locator;
  readonly date: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lnkOrganisationSelection = page.getByText("Organization Selection");
    this.createForecastButton = page.getByText('Create forecast');
    this.date = page.locator('//h3[text()="Current Forecast"]//following::div[@class="vis-container"]//child::div[@class = "msg"]');
  }

  async gotoOrganisationSelection() {
    await this.lnkOrganisationSelection.click();
  }

  async clickOnCreateForecast() {
    await this.createForecastButton.click();
    return new CreateForecastPopup(this.page)
  }

  async verifySBAName(breadCrumName: string) {
    const sbaNameText = await this.page.getByText(`${breadCrumName}`).innerText();
    console.log(sbaNameText)
    expect(sbaNameText).toBe(forecast.Merch.sbaBreadCrumName);
    return new OpenCurrentForecast(this.page);
  }

  async verifyVisibilityOfDeadlineDate(){

    const deadlineDate = await this.date.innerText(); //Segment will submit the forecast on Apr,29 2024
    const stringToTrim = deadlineDate;
    const actualDate = stringToTrim.substring(stringToTrim.indexOf('on') + 3).trim();
    let strExpdate = await Utility.getUpcomingForecastSubmissionDate(testdata.expected_reponse);
    expect(actualDate).toEqual(strExpdate);
  
  }
}