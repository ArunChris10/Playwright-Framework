import { Page } from "@playwright/test";
import { CreateForecastPopup } from './create-forecast.-popup.page';
import { CurrentForecast } from './current-forecast.page';
import { OpenCurrentForecast } from './open-forecast.page';
import { OrganisationSelection } from './organisation-selection.page';
import { AddDriverPage } from "./add-driver-page";
import { KpiForecastPage } from "./kpi-forecast-page";


export class UFMPageFactory {

  private readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  currentForecast() {
    return new CurrentForecast(this.page);
  }

  createForecastPopup() {
    return new CreateForecastPopup(this.page);
  }

  openCurrentForecast() {
    return new OpenCurrentForecast(this.page);
  }

  organisationSelection() {
    return new OrganisationSelection(this.page);
  }

  addDriverPage() {
    return new AddDriverPage(this.page)
  }

}
