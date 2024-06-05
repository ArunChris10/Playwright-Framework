import { Locator, Page } from "@playwright/test";

export class RollingForecastCalendar {

  readonly page: Page;
  readonly addCycleButton: Locator;
  readonly createForecastCycleModal: Locator;
  readonly chooseDateMessage: Locator;
  readonly saveForecastCycle: Locator;
  readonly cancel: Locator;
  readonly cancelModal: Locator;
  readonly cycleContainer: Locator;
  readonly cycleContainerString: String;
  readonly sbaProgressContainer: Locator
  readonly publishCalendar: Locator
  readonly publishMessage: Locator
  readonly deleteMessage: Locator
  readonly publishDates: Locator
  readonly publishSuccessMessage: Locator
  readonly deleteCycle: Locator
  readonly deleteCycleInModal: Locator
  readonly ellipsesGenericButton: Locator;
  readonly rollingForecastTab: Locator;
  readonly nudgeMessageForPublishDueDate: Locator;
  readonly corporateDueDateMessage: Locator;
  readonly filterContainer: Locator;


  constructor(page: Page) {
    this.page = page;
    this.addCycleButton = page.getByText("Add cycle")
    this.createForecastCycleModal = page.getByText("Create Forecast Cycle")
    this.chooseDateMessage = page.getByText('Choose a date from the')
    this.saveForecastCycle = page.locator('//button[contains(text(),"Save forecast cycle")]')
    this.cancel = page.getByText('Cancel')
    this.cancelModal = page.getByTestId('cancel-button')
    this.cycleContainerString = '//div[contains(@class,"forecastCycleContainer")]//div[contains(@class,"cardContainer")]'
    this.cycleContainer = page.locator('//div[contains(@class,"forecastCycleContainer")]//div[contains(@class,"cardContainer")]')
    this.sbaProgressContainer = page.locator('//div[contains(@class,"bussiness-progress-grid")]')
    this.filterContainer = page.locator('//div[contains(@class,"FilterComponent")]')
    this.publishCalendar = page.getByText('Publish rolling forecast calendar')
    this.publishMessage = page.getByText('Organization reviewers will see these due dates via IBG. Then, they will set due dates for when they want to receive lines of business forecasts')
    this.publishDates = page.getByText(/Publish FY\d{2} dates/)
    this.publishSuccessMessage = page.getByText('Due dates published successfully')
    this.deleteCycle = page.locator('//span[contains(text(),"Delete cycle")]')
    this.deleteCycleInModal = page.getByRole('button').filter({ hasText: 'Delete Cycle' })
    this.deleteMessage = page.getByText('Once deleted, all the due dates you set in this forecast cycle will be permanently removed.')
    this.ellipsesGenericButton = page.locator('button[id="basic-button"]');
    this.rollingForecastTab = page.getByText("Rolling forecast", { exact: true })
    this.nudgeMessageForPublishDueDate = page.getByText('Once you\'ve set all the fiscal year\'s dates, publish the line of business forecast due dates.')
    this.corporateDueDateMessage = page.getByText('The corporate forecast is due on')
  }

  async clickOnAddCycle() {
    this.addCycleButton.click({ force: true })
    await this.page.waitForSelector('//div[@class="create-forecast-cycle-container"]', { state: "visible" })
  }

  async isCreateForecastCycleModalOpened() {
    await this.saveForecastCycle.waitFor({ state: "visible" })
    return await this.createForecastCycleModal.isVisible()
  }

  async isChooseDateMessageDisplayed() {
    await this.page.waitForTimeout(500)
    return await this.chooseDateMessage.isVisible()
  }

  async clickOnSaveForecastCycle() {
    await this.saveForecastCycle.first().click()
  }

  async clickOnCancel() {
    await this.cancel.click()
  }

  async clickOnCancelModal() {
    await this.cancelModal.click()
  }

  async setOrganizationRadioButton(selection: string) {
    await this.page.locator(`//span[contains(text(),"${selection}")]/../input`).click()
  }

  async selectCalendarDate(date: number, month: number) {
    await this.page.locator(`(//div[contains(@class,"MuiDateCalendar-root")])[${month}]//div[@role="rowgroup"]//button[contains(text(),"${date}")]`).click()
  }

  async getDateProperty(date: number, month: number) {
    let backgroundColor;

    backgroundColor = await this.page.$eval(`(//div[contains(@class,"MuiDateCalendar-root")])[${month}]//div[@role="rowgroup"]//button[contains(text(),"${date}")]`, element => {
      const style = window.getComputedStyle(element);
      return { backgroundColour: style.backgroundColor, border: style.border };
    });
    return backgroundColor;
  }

  async isCycleExists(date: number, month: string, waitfor = false) {
    await this.cycleContainer.first().waitFor({ state: "visible" })
    if (waitfor == true) {
      await this.page.locator(`${this.cycleContainerString}//div[contains(text(),"${month} ${date}")]`).first().waitFor({ state: "visible" })
    }
    else {
      await this.page.waitForTimeout(1000)
    }
    return await this.page.locator(`${this.cycleContainerString}//div[contains(text(),"${month} ${date}")]`).isVisible()
  }

  async clickOnPublishCalendar() {
    await this.publishCalendar.click()
  }

  async waitForPublishCalendarModal() {
    await this.publishMessage.waitFor({ state: "visible" })
  }

  async clickOnPublishDates() {
    await this.publishDates.click()
  }

  async waitForPublishSuccessMessage() {
    await this.publishSuccessMessage.waitFor({ state: "visible" })
  }

  async clickOnCycleMoreSettings(date: number, month: string) {
    await this.page.locator(`${this.cycleContainerString}//div[contains(text(),"${month} ${date}")]/../..//button`).click()
  }

  async clickOnDeleteCycle() {
    await this.deleteCycle.click()
  }

  async clickOnDeleteCycleInModal() {
    await this.deleteCycleInModal.click()
  }

  async waitForDeleteCycleModal(state) {
    await this.deleteMessage.waitFor({ state: state })
  }

  async deleteAllCycles() {
    await this.cycleContainer.first().waitFor({ state: "visible" })
    while (await this.ellipsesGenericButton.first().isVisible()) {
      await this.ellipsesGenericButton.first().click()
      await this.clickOnDeleteCycle()
      await this.waitForDeleteCycleModal("visible")
      await this.clickOnDeleteCycleInModal()
      await this.waitForDeleteCycleModal("hidden")
    }
  }

  async clickOnRollingForecastTab() {
    await this.rollingForecastTab.click()
    await this.sbaProgressContainer.waitFor({ state: "visible" })
  }
  async isPublishDueDateNudgeMessageDisplayed() {
    await this.page.waitForTimeout(1000)
    return await this.nudgeMessageForPublishDueDate.isVisible()
  }

  async getCorporateDueDateMessage() {
    return this.corporateDueDateMessage.innerText()
  }

}