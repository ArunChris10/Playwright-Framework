import { expect, Locator, Page } from "@playwright/test";
import debug from "debug";
import fs from "fs";
import { Utility } from "../../common/fixtures/utils";
import { OrganisationSelection } from "./organisation-selection.page";

export class CurrentForecast {
  readonly page: Page;
  readonly lnkOrganisationSelection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.lnkOrganisationSelection = page.getByText("Organization Selection");
  }

  async gotoOrganisationSelection() {
    await this.lnkOrganisationSelection.click();
    let organisationSelection = new OrganisationSelection(this.page);
  }
}
