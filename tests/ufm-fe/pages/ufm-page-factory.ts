import { Page } from "@playwright/test";
import { CreateForecastPopup } from './create-forecast.-popup.page';
import { CurrentForecast } from './current-forecast.page';
import { OpenCurrentForecast } from './open-forecast.page';
import { MyKPITablePage } from './my-kpi-table.page';
import { FiltersPage } from './filters.page';
import { CopyPopupPage } from './copy-popup.page';
import { OrganisationSelection } from './organisation-selection.page';
import { AddDriverPage } from "./add-driver-page";
import { RollingForecastCalendar } from "./rolling-forecast-Calendar.page";
import { UpdatePageCalendarView } from "./update-page-calendar-view";
import { DataScienceReviewPage } from './data-science-review.page';
import { SnapshotsForecast } from './snapshots-forecast.page';
import {ExcelUtility} from './excelutility.page';

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

  updatePageCalendarView() {
    return new UpdatePageCalendarView(this.page);
  }

  organisationSelection() {
    return new OrganisationSelection(this.page);
  }

  addDriverPage() {
    return new AddDriverPage(this.page)
  }

  rollingForecastCalendarPage() {
    return new RollingForecastCalendar(this.page)
  }
  dataScienceReviewPage() {
    return new DataScienceReviewPage(this.page);
  }

  snapshotsPage() {
    return new SnapshotsForecast(this.page);
  }

  excelUtility() {
    return new ExcelUtility(this.page);
  }

  myKpiTablePage() {
    return new MyKPITablePage(this.page);
  }
  
  filtersPage() {
    return new FiltersPage(this.page);
  }

  copyForecastPage() {
    return new CopyPopupPage(this.page);
  }
}
