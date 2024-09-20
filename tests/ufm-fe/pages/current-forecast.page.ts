import { expect, Locator, Page } from "@playwright/test";
import { CreateForecastPopup } from "./create-forecast.-popup.page";
import { OpenCurrentForecast } from "../pages/open-forecast.page";
import forecast from "../testdata/forecast.json";
import debug from "debug";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../../ufm-be/testdata/deadlinedate-api.json";

export class CurrentForecast {
  readonly page: Page;
  readonly lnkOrganisationSelection: Locator;
  readonly createForecastButton: Locator;
  readonly sbaName: Locator;
  readonly forecastStatus: Locator;
  readonly filterSetsDropdown: Locator;
  readonly filterSetsList: Locator;
  readonly totalValueForecastHeader: Locator;
  readonly applyFilterSet: Locator;
  readonly applyFilter: Locator;
  readonly viewInAbsoluteNumbers: Locator;
  readonly totalForecastValueFirstRow: Locator;
  readonly netSalesForecastValueFirstRow: Locator;
  readonly createNewFilterSet: Locator;
  readonly filterSetName: Locator;
  readonly selectedUFMFilterSection: Locator;
  readonly saveFilterSet: Locator;
  readonly open: Locator;
  private readonly urlEndpoint = process.env.ufmAppBaseURL + "";
  readonly date: Locator;
  readonly forecastHeader: Locator;
  readonly rollingForecastCalendarTab: Locator;
  readonly forecastCycleContainer: Locator;
  readonly nudgeMessageForCreateDueDate: Locator;
  readonly ellipses: Locator;
  readonly sendButton: Locator
  readonly recallButton: Locator
  readonly recallForecast: Locator
  readonly recallForecastHeader: Locator

  constructor(page: Page) {
    this.page = page;
    this.lnkOrganisationSelection = page.getByText("Organization Selection");
    this.createForecastButton = page.getByText("Create forecast");
    this.forecastStatus = page.locator(
      '//div[@class="ag-pinned-left-cols-container"]//child::div[@class = "ag-cell ag-cell-not-inline-editing ag-cell-normal-height ag-cell-value"]//div'
    );
    this.filterSetsDropdown = page.getByText("Filter sets");
    this.filterSetsList = page.locator(
      '//*[contains(@class,"FilterSet_filtersetModalContainer")]/descendant::span'
    );
    this.totalValueForecastHeader = page.locator(
      '//div[@col-id="totalvalue.forecast"]'
    );
    this.applyFilterSet = page.locator(
      '//div[contains(@class,"FilterSet")]//button[contains(text(),"Apply")]'
    );
    this.applyFilter = page.locator(
      '//div[contains(@class,"UFMFilters_filter_button")]//button[contains(text(),"Apply")]'
    );
    this.viewInAbsoluteNumbers = page.getByText("Absolute");
    this.totalForecastValueFirstRow = page.locator(
      '(//div[@col-id="totalvalue.forecast" and @role="gridcell"])[1]'
    );
    this.netSalesForecastValueFirstRow = page.locator(
      '(//div[@col-id="netsales.forecast" and @role="gridcell"])[1]'
    );
    this.date = page.locator(
      '//h3[text()="Current Forecast"]//following::div[@class="vis-container"]//child::div[@class = "msg"]'
    );
    this.createNewFilterSet = page.getByRole("button", {
      name: "Create new filter set",
    });
    this.filterSetName = page.getByPlaceholder("Filter set");
    this.selectedUFMFilterSection = page.locator(
      '//p[contains(@class,"UFMFilters_selectedFilters")]'
    );
    this.saveFilterSet = page.getByText("Save");
    this.open = page.getByText("Open");
    this.ellipses = page.locator('//button[@aria-label="More options"]')
    this.forecastHeader = page.locator(
      '//div[contains(@class,"title-forecast")]'
    );
    this.rollingForecastCalendarTab = page.getByText(
      "Rolling forecast calender"
    );
    this.forecastCycleContainer = page.locator(
      '//div[contains(@class,"forecastCycleContainer")]'
    );
    this.nudgeMessageForCreateDueDate = page.getByText(
      "A new fiscal year is approaching. Set rolling forecast due dates for FY"
    );

    this.sendButton = page.getByText('Send', { exact: true })
    this.recallButton = page.getByText('Recall', { exact: true })
    this.recallForecast = page.getByText('Recall forecast', { exact: true })
    this.recallForecastHeader = page.locator("//h2[contains(text(),'Recall forecast')]")
  }

  async gotoOrganisationSelection() {
    await this.lnkOrganisationSelection.click();
  }

  async clickOnCreateForecast() {
    await this.createForecastButton.first().click();
    return new CreateForecastPopup(this.page);
  }

  async clickOnSendToReview(sbaName) {
    await this.page.getByText(`Send to ${sbaName} review`).click()
  }

  async clickOnRecallForecast() {
    await this.recallForecast.click()
  }

  async validateSendToReviewModal(sbaName) {
    await this.page.getByText(`Send to ${sbaName.toUpperCase()}`, { exact: true }).isVisible()
    await this.page.getByText(`Your forecast will be sent to the ${sbaName.toUpperCase()} reviewer`).isVisible()
  }

  async validateRecallForecastModal(sbaName) {
    await this.recallForecastHeader.isVisible()
    await this.page.getByText(`After recalling your forecast, you'll be able to make changes to your forecast. Then you can send it back to your ${sbaName} reviewer.`).isVisible()
  }

  async clickOnSendButton() {
    await this.sendButton.click()
  }

  async clickOnRecallButton() {
    await this.recallButton.click()
  }
  async waitforSendToReviewToComplete(sbaName) {
    await this.page.getByText(`Your forecast will be sent to the ${sbaName.toUpperCase()} reviewer`).waitFor({ state: "detached", timeout: 480000 })
  }

  async waitforRecallForecastToComplete(sbaName) {
    await this.page.getByText(`After recalling your forecast, you'll be able to make changes to your forecast. Then you can send it back to your ${sbaName} reviewer.`).waitFor({ state: "detached", timeout: 480000 })
  }

  async getScenarioStatus(scenarioName) {
    return await this.page.locator(`//div[contains(text(),'${scenarioName}')]//following-sibling::div[@col-id='forecastStatus']//span`).innerText()
  }

  async verifySBAName(breadCrumName: string) {
    const sbaNameText = await this.page
      .getByText(`${breadCrumName}`)
      .innerText();
    Utility.logIt(sbaNameText);
    expect(sbaNameText).toBe(forecast.Merch.sbaBreadCrumName);
    return new OpenCurrentForecast(this.page);
  }

  async clickOnFilterSetsDropdown() {
    await this.page.keyboard.press("Escape");
    await this.filterSetsDropdown.first().click();
    await this.waitForFiltersetListToBeVisible();
  }

  async waitForFiltersetListToBeVisible() {
    await this.filterSetsList
      .first()
      .waitFor({ state: "visible", timeout: 420000 });
  }

  async getAvailableFilterSetsList() {
    const filterSetInnerTexts = await this.filterSetsList.allInnerTexts();
    return filterSetInnerTexts;
  }

  async waitForForecastToLoad() {
    await this.totalValueForecastHeader.first().waitFor({ state: "visible" });
  }

  async clickOnFilterSet(filterSetName: string) {
    await this.page.getByText(`${filterSetName}`).click();

    const selectedRadioButton = await this.page.$(
      `//span[contains(text(),"${filterSetName}")]/parent::label`
    );
    const classOfSelectedFilter = await selectedRadioButton.getAttribute(
      "class"
    );

    expect(classOfSelectedFilter.includes("checked"));
  }

  async clickOnApplyFilterSet() {
    await this.applyFilterSet.click();
    await this.filterSetsList.waitFor({ state: "hidden" });
  }

  async clickOnApplyFilter() {
    await this.applyFilter.first().click();
  }

  async clickOnViewIn(Conversion: string) {
    await this.page.getByText(`${Conversion}`).click();
  }

  async getForecastValues() {
    let totalValueFirstRow: string | number =
      await this.totalForecastValueFirstRow.innerText();
    let netSalesFirstRow: string | number =
      await this.netSalesForecastValueFirstRow.innerText();

    totalValueFirstRow = parseFloat(totalValueFirstRow.replace(/[,$-]/g, ""));
    netSalesFirstRow = parseFloat(netSalesFirstRow.replace(/[,$-]/g, ""));

    totalValueFirstRow = isNaN(totalValueFirstRow) ? 0 : totalValueFirstRow;
    netSalesFirstRow = isNaN(netSalesFirstRow) ? 0 : netSalesFirstRow;

    debug.log(
      "totalValue:",
      totalValueFirstRow,
      " netSales:",
      netSalesFirstRow
    );

    return { totalValue: totalValueFirstRow, netSales: netSalesFirstRow };
  }

  async verifyVisibilityOfDeadlineDate() {
    const deadlineDate = await this.date.innerText(); //Segment will submit the forecast on Apr,29 2024
    const stringToTrim = deadlineDate;
    const actualDate = stringToTrim
      .substring(stringToTrim.indexOf("on") + 3)
      .trim();

    let strExpdate = await Utility.getUpcomingForecastSubmissionDate(
      testdata.expected_reponse
    );
    expect(actualDate).toEqual(strExpdate);
  }

  async clickOnFilterDropdown(filterName: string) {
    await this.page
      .getByRole("button", { name: `${filterName}`, exact: true })
      .first()
      .click();
  }

  async selectFilterOption(filterOption: string) {
    const filterSelection = await this.page.getByLabel(`${filterOption}`);

    await filterSelection.check();
    await expect(filterSelection).toBeChecked();
    await this.page.keyboard.press("Escape");
  }

  async clickOnCreateNewFilterSet() {
    await this.createNewFilterSet.click();
  }

  async fillFilterSetName(filterSetName: string) {
    await this.filterSetName.fill(filterSetName);
  }

  async getUFMSelectedFilters() {
    return await this.selectedUFMFilterSection.allInnerTexts();
  }

  async clickOnSaveFilterSet() {
    await this.saveFilterSet.click();
    await this.page.waitForTimeout(500)
  }

  async deleteFilterSet(filterSetName: string) {
    await this.page
      .locator(
        `//label[@data-testid="${filterSetName}"]/following-sibling::*[@data-testid="del_button"]`
      )
      .click();
    await this.page.waitForTimeout(1000);
  }

  async clickOnOpenParticularForecast(LOB: string) {
    let forecastParentElement = this.page
      .locator(
        `//div[contains(@class,'CurrentForecast_card-container')]//div[contains(text(),"${LOB}")]/parent::div`
      )
      .first();

    let forecastRowID = await forecastParentElement.getAttribute("row-id");

    let forecastName = await forecastParentElement
      .locator('//div[@col-id="name"]')
      .innerText();

    let LOBForecast = await this.page.locator(`//div[contains(@class,'CurrentForecast_card-container')]//div[@row-id=${forecastRowID}]`
    );



    await LOBForecast.locator(this.open).click();

    let foreCastHeader = await this.forecastHeader.innerText();

    expect(foreCastHeader).toEqual(forecastName);
  }


  async clickOnParticularForecastEllipses(LOB: string) {
    let forecastParentElement = this.page
      .locator(
        `//div[contains(@class,'CurrentForecast_card-container')]//div[contains(text(),"${LOB}")]/parent::div`
      )
      .first();

    let forecastRowID = await forecastParentElement.getAttribute("row-id");

    let forecastName = await forecastParentElement
      .locator('//div[@col-id="name"]')
      .innerText();

    let LOBForecast = await this.page.locator(`//div[contains(@class,'CurrentForecast_card-container')]//div[@row-id=${forecastRowID}]`
    );

    await LOBForecast.locator(this.ellipses).click();

    return forecastName
  }

  async clickOnRollingForecastCalendarTab() {
    await this.rollingForecastCalendarTab.click();
    await this.forecastCycleContainer.waitFor({ state: "visible" });
  }

  async isCreateDueDateNudgeMessageDisplayed() {
    await this.page.waitForTimeout(1000);
    return await this.nudgeMessageForCreateDueDate.isVisible();
  }
}
