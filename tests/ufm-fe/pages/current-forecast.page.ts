import { ElementHandle, expect, Locator, Page } from "@playwright/test";
import { CreateForecastPopup } from "./create-forecast.-popup.page";
import { OpenCurrentForecast } from '../pages/open-forecast.page';
import forecast from '../testdata/forecast.json'
import debug from "debug";
import forecast from '../testdata/forecast.json';
import { DateTime } from "luxon";
import { Utility } from '../../common/fixtures/utils';
import testdata from '../../ufm-be/testdata/deadlinedate-api.json';

export class CurrentForecast {

  readonly page: Page;
  readonly lnkOrganisationSelection: Locator;
  readonly createForecastButton: Locator;
  readonly sbaName: Locator;

  readonly filterSetsDropdown: Locator;
  readonly filterSetsList: Locator;
  readonly totalValueForecastHeader: Locator;
  readonly applyFilterSet: Locator;
  readonly applyFilter: Locator;
  readonly viewInAbsoluteNumbers: Locator;
  readonly totalForecastValueFirstRow: Locator;
  readonly netSalesForecastValueFirstRow: Locator;
  private readonly urlEndpoint = process.env.ufmAppBaseURL + "";
  readonly date: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lnkOrganisationSelection = page.getByText("Organization Selection");
    this.createForecastButton = page.getByText('Create forecast');
    this.filterSetsDropdown = page.getByText('Filter sets')
    this.filterSetsList = page.locator('//*[contains(@class,"FilterSet_filtersetModalContainer")]/descendant::span')
    this.totalValueForecastHeader = page.locator('//div[@col-id="totalvalue.forecast"]')
    this.applyFilterSet = page.locator('//div[contains(@class,"FilterSet")]//button[contains(text(),"Apply")]')
    this.applyFilter = page.locator('//div[contains(@class,"UFMFilters_filter_button")]//button[contains(text(),"Apply")]')
    this.viewInAbsoluteNumbers = page.getByText("Absolute")
    this.totalForecastValueFirstRow = page.locator('(//div[@col-id="totalvalue.forecast" and @role="gridcell"])[1]')
    this.netSalesForecastValueFirstRow = page.locator('(//div[@col-id="netsales.forecast" and @role="gridcell"])[1]')
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

  async clickOnFilterSetsDropdown() {

    await this.filterSetsDropdown.click()
    await this.waitForFiltersetListToBeVisible()
  }

  async waitForFiltersetListToBeVisible() {
    await this.filterSetsList
      .first()
      .waitFor({ state: "visible", timeout: 420000 });
  }

  async getAvailableFilterSetsList() {

    const filterSetInnerTexts = await this.filterSetsList.allInnerTexts()
    return filterSetInnerTexts

  }
  async waitForForecastToLoad() {
    await this.totalValueForecastHeader.first().waitFor({ state: "visible" })
  }

  async clickOnFilterSet(filterSetName: string) {
    await this.page
      .getByText(`${filterSetName}`)
      .click()

    const selectedRadioButton = await this.page.$(`//span[contains(text(),"${filterSetName}")]/parent::label`);
    const classOfSelectedFilter = await selectedRadioButton.getAttribute('class');

    expect(classOfSelectedFilter.includes("checked"))
  }
  async clickOnApplyFilterSet() {
    await this.applyFilterSet
      .click()

    await this.filterSetsList.waitFor({ state: 'hidden' });

  }

  async clickOnApplyFilter() {
    await this.applyFilter
      .click()

  }

  async clickOnViewInAbsolute() {
    await this.viewInAbsoluteNumbers.click()
  }

  async getForecastValues() {
    let totalValueFirstRow = await this.totalForecastValueFirstRow.innerText()
    let netSalesFirstRow = await this.netSalesForecastValueFirstRow.innerText()

    totalValueFirstRow = totalValueFirstRow.slice(1, -1)
    netSalesFirstRow = netSalesFirstRow.slice(1, -1)

    totalValueFirstRow = totalValueFirstRow.replace(/,/g, '')
    netSalesFirstRow = netSalesFirstRow.replace(/,/g, '')

    debug.log("totalValue:", totalValueFirstRow, " netSales:", netSalesFirstRow)

    return { totalValue: parseInt(totalValueFirstRow), netSales: parseInt(netSalesFirstRow) }
  }

}
  async verifyVisibilityOfDeadlineDate(){

    const deadlineDate = await this.date.innerText(); //Segment will submit the forecast on Apr,29 2024
    const stringToTrim = deadlineDate;
    const actualDate = stringToTrim.substring(stringToTrim.indexOf('on') + 3).trim();
    let strExpdate = await Utility.getUpcomingForecastSubmissionDate(testdata.expected_reponse);
    expect(actualDate).toEqual(strExpdate);
  
  }
}
