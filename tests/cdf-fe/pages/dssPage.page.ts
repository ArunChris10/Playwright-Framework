import { Page, Locator, expect } from "@playwright/test";
import { Utility } from "../../common/fixtures/utils";

import type { filterKey, figure, metric, view } from '../types/demand-output-filters.d.ts'

export class DssPage {

  private readonly page: Page;

  private readonly syncButtonToOpenModal: Locator;
  private readonly publishSlotRadioButtons: Locator;
  private readonly publishButton: Locator;
  private readonly syncStartedConfirmation: Locator;
  private readonly filterButtons: {
    channelGroups: Locator;
    channels: Locator;
    sbus: Locator;
    departments: Locator;
    years: Locator;
    quarters: Locator;
    months: Locator;
    metrics: Locator;
    resetFilters: Locator;
  }
  private readonly filterModal: {
    confirmButton: Locator;
    checkBoxes: {
      selectAll: Locator;
      checked: Locator;
    }
  }
  private readonly demandOutputViewControl: {
    sbuSwitch: Locator;
    yearButton: Locator;
    quarterButton: Locator;
    monthButton: Locator;
    absoluteButton: Locator;
    millionsButton: Locator;
    billionsButton: Locator;
  }
  private readonly firstDemandOutputDataGridCell: Locator;

  private static dataFiltersSelector = 'div[class*="LaunchpadFilters_dataFilters"]'
  private static dropdownButtonsSelector = 'div[class*="LaunchpadFilters_dropDownButtonGroup"]'
  private static filterModalSelector = 'div[class*=PopoverLayoutManager-module_layoutManager]'

  private static demandOutputGridSelector = 'div[class*="LaunchpadOutput_dataGrid"]'
  private static dataColumnSelector = 'div[class="ag-center-cols-viewport"]'

  constructor(page: Page) {
    this.page = page;

    this.syncButtonToOpenModal = this.page.getByTitle('Publish Data to Consumption').locator('#resync_btn');
    this.publishSlotRadioButtons = this
        .page
        .getByRole('group', { name: 'Publish on wmlink/currentdemand as'})
        .getByRole('radio')
    this.publishButton = this.page.getByRole('button', { name: 'Publish' });
    this.syncStartedConfirmation = this.page.getByText('Sync UFM started');

    this.filterButtons = {
      channelGroups: this.page.getByRole('button', { name: 'Channel Group' }),
      channels: this.page.getByRole('button', { name: /Channel(\s\((all|\d*)\))?$/i }),
      sbus: this.page.getByRole('button', { name: 'SBU' }),
      departments: this.page.getByRole('button', { name: 'Department' }),
      years: this.page
          .locator(DssPage.dropdownButtonsSelector)
          .getByRole('button', { name: 'Year' }),
      quarters: this.page
          .locator(DssPage.dropdownButtonsSelector)
          .getByRole('button', { name: 'Quarter' }),
      months: this.page
          .locator(DssPage.dropdownButtonsSelector)
          .getByRole('button', { name: 'Month' }),
      metrics: this.page.getByRole('button', { name: 'Metric' }),
      resetFilters: this.page.getByRole('button', { name: 'Reset Filters' }),
    }

    this.filterModal = {
      confirmButton: this.page.getByRole('button', { name: 'Confirm' }),
      checkBoxes: {
        selectAll: this.page
            .locator(DssPage.filterModalSelector)
            .getByRole('checkbox', {name: 'Select All'}),
        checked: this.page
            .locator(DssPage.filterModalSelector)
            .getByRole('checkbox', { checked: true })
      }
    }

    this.demandOutputViewControl = {
      sbuSwitch: this.page.getByRole('switch', { name: 'SBU View' }),
      yearButton: this.page
          .locator(DssPage.dataFiltersSelector)
          .getByRole('button', { name: 'Year' }),
      quarterButton: this.page
          .locator(DssPage.dataFiltersSelector)
          .getByRole('button', { name: 'Quarter' }),
      monthButton: this.page
          .locator(DssPage.dataFiltersSelector)
          .getByRole('button', { name: 'Month' }),
      absoluteButton: this.page.getByRole('button', { name: 'Absolute' }),
      millionsButton: this.page.getByRole('button', { name: 'Millions' }),
      billionsButton: this.page.getByRole('button', { name: 'Billions' }),
    }

    this.firstDemandOutputDataGridCell = this.page
        .locator(DssPage.demandOutputGridSelector)
        .locator(DssPage.dataColumnSelector)
        .getByRole('gridcell').first()
  }

  async waitForDemandOutputToBeVisible() {
    await Utility.waitForDataLoadingMessageToBeInvisible(this.page)
  }

  async openPublishDSSModal() {
    await this.syncButtonToOpenModal.click();
  }

  async populatePublishDSSModal(options, slot) {
    for (let option of options) {
      await this.page.getByText(option).click();
    }
    await this.publishSlotRadioButtons.nth(slot - 1).click()
    await this.publishButton.click();
  }

  async waitForPublishDSS() {
    await this.syncStartedConfirmation.isVisible();
    await this.page.waitForTimeout(30000);
  }

  async toggleSBUView() {
    await this.demandOutputViewControl.sbuSwitch.check();
    await this.waitForDemandOutputToBeVisible();
  }

  async toggleChannelView() {
    await this.demandOutputViewControl.sbuSwitch.uncheck();
    await this.waitForDemandOutputToBeVisible();
  }

  async toggleDemandOutputView(view: view) {
    const buttonKey = `${view}Button`
    await this.demandOutputViewControl[buttonKey].click({ force: true });
    await this.waitForDemandOutputToBeVisible();
  }

  async resetDemandOutputFilters() {
    await this.filterButtons.resetFilters.click()
  }

  async openFilterModal(filterKey: filterKey | 'metrics') {
    await this.filterButtons[filterKey].click();
  }

  async applyMetric(name: string) {
    await this.page.getByRole('radio', { name, exact: true }).dispatchEvent('click')
    await this.waitForDemandOutputToBeVisible()
  }

  async applyFilters(filters: string[], filterKey: filterKey) {
    await this.openFilterModal(filterKey)
    await this.filterModal.checkBoxes.selectAll.uncheck({ force: true });

    await Promise.all(filters.map(async (filter) => {
      await this.page.getByRole('checkbox', { name: filter }).check({ force: true });
    }))

    await this.filterModal.confirmButton.click();
    await this.waitForDemandOutputToBeVisible()
  }

  async getDemandOutputRow(name: string, category?: filterKey) {
    if (category === 'departments') {
      const demandOutputDepartmentText = new RegExp(`\\d+ - ${name}`, 'i');
      return this.page.getByText(demandOutputDepartmentText).first();
    }

    return this.page.getByRole('row', { name: `\uf130 ${name}` })
  }

  async getDemandOutputColumnHeader(name: string, category?: filterKey) {
    if (category === 'months') {
      const month: string = name.match(/[A-z]+/)[0].slice(0, 3)
      return this.page.getByRole('columnheader', { name: `${month} FY` })
    }

    if (category === 'quarters') {
      return this.page.getByRole('columnheader', { name: `${name} FY` })
    }

    return this.page.getByRole('columnheader', { name, exact: true })
  }

  async expandDemandOutputRows() {
    const demandOutputContractedRowIcons = this.page.locator('.ag-group-contracted > .ag-icon.ag-icon-tree-closed')
    for (let contractedIcon of await demandOutputContractedRowIcons.all()) {
      // dispatchEvent('click') is used over click() because the ag-grid icons have complex behavior that results in
      // poor accessibility (hence the PlayWright bot has trouble seeing they're visible), so the event needs to be forced
      await contractedIcon.dispatchEvent('click')
      await this.waitForDemandOutputToBeVisible();
    }
  }

  async assertFilterIsSelected(filters: string[], filterKey: filterKey) {
    await this.openFilterModal(filterKey)

    await expect(this.filterModal.checkBoxes.checked).toHaveCount(filters.length)
    return Promise.all(filters.map(async (filter: string) => {
      await expect(this.page.getByRole('checkbox', { name: filter })).toBeChecked();
    }))
  }

  async assertDemandOutputHasUnit(unit: metric["unit"] | figure["unit"]) {
    const numberAnnotation = /^[0-9]+(?:[.,][0-9]+)*$/
    const dollarNumberAnnotation = /^\$[0-9]+(?:[.,][0-9]+)*$/

    switch (unit) {
      case '': {
        await expect(this.firstDemandOutputDataGridCell).toHaveText(numberAnnotation)
        break
      }
      case 'absolute': {
        await expect(this.firstDemandOutputDataGridCell).toHaveText(dollarNumberAnnotation)
        break
      }
      default:
        await expect(this.firstDemandOutputDataGridCell).toContainText(unit)
    }
  }
}

