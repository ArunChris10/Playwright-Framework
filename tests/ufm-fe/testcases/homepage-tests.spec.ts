import { test, expect } from '@playwright/test';
import { CurrentForecast } from '../pages/current-forecast.page';
import { LoginPage } from '../pages/login.page';
import { OrganisationSelection } from '../pages/organisation-selection.page';


// test('Validate the @breadcrum navigation @P',async ({page}) => {
//   await page.goto(process.env.ufmAppBaseURL, { timeout: 120000 });
//   let organisationSelection : OrganisationSelection = new OrganisationSelection(page);
//   expect(await organisationSelection.isOrganisationSelectionNavigated()).toBeTruthy();
//   let currentForecast : CurrentForecast = await organisationSelection.selectOrganisation('Health & wellness');
//   // organisationSelection=await currentForecast.gotoOrganisationSelection();
//   test.setTimeout(160000);
//   // expect(await organisationSelection.isOrganisationSelectionNavigated()).toBeTruthy();
// })