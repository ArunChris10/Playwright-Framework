import { Locator, Page } from "@playwright/test";
import { CurrentForecast } from "./current-forecast.page";

export class OrganisationSelection {
  readonly page: Page;
  readonly organizationSelectionBreadCrumb: Locator;
  private readonly urlEndpoint = process.env.ufmAppBaseURL + "";

  constructor(page: Page) {
    this.page = page;
    this.organizationSelectionBreadCrumb = page.getByText("Organization Selection")
  }

  async selectOrganisation(organisationName: string) {
    await this.page.getByText(organisationName).click();
    return new CurrentForecast(this.page);
  }

  async isOrganisationSelectionNavigated() {
    await this.page.waitForSelector('.loading', { state: 'hidden', timeout: 160000 });
    return await this.page.getByText('Choose an organization to view UFM forecasts').isVisible();
  }

  async navigate() {
    await this.page.goto(this.urlEndpoint, { timeout: 120000 });
  }

  async clickOnOrganizationBreadcrumb() {
    await this.organizationSelectionBreadCrumb.click()
  }

}