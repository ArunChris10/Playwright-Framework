import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { filterOptions } from '../testdata/fileName.json';

test.describe(
  'Landing page validate Feature Test',
  { tag: "@Smoke @Regression @LandingPageValidation @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui @ibg-platform2-ui" },
  async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });

    // Before each test, sign in and initialize the page factory
    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
    });

    // After each test, close only the page to ensure clean up
    test.afterEach(async ({ page }) => {
      try {
        await page.close();
      } catch (e) { }
    });

    // Test: Verify landing page UI elements and controls
    test('Verify Landing page is available with its tabular records', async () => {
      // Step: Verify the search field is displayed on the landing page
      await test.step('Verify the search field is displayed', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().Search();
      });

      // Step: Validate the input records count and calculation count
      await test.step('Validate the input records count & calculation count is shown', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().Count();
      });

      // Step: Check if sort by option is present on the landing page
      await test.step('Check sort by is present in landing page home', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().SortBy();
      });

      // Step: Check if group by option is present on the landing page
      await test.step('Check group by is present in landing page home', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().GroupBy();
      });

      // Step: Verify that the table settings button is displayed
      await test.step('Table settings button is shown', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().Settings();
      });

      // Step: Ensure filter options are available for specific columns
      await test.step('Filter options is shown for columns except metric name & type', async () => {
        await objpageFactory.ssdmPageFactory().landingPage().Filter();
      });
    });

    // Test: Search with complete metric name
    test('Check if the search works with the complete metric name', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().verifySearchWithCompleteMetricName();
    });

    // Test: Search with partial metric name
    test('Check if the search works with the partial metric name', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().verifySearchWithPartialMetricName();
    });

    // Test: Search with incorrect metric name
    test('Check if the search response on incorrect metric name', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().verifySearchWithIncorrectMetricName();
    });

    // Test: Month column filter validation
    test('month column filter validation', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(
        filterOptions[0].data.month.dropDown,
        filterOptions[0].data.month.actuals
      );
    });

    // Test: Channel column filter validation
    test('channel column filter validation', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(
        filterOptions[0].data.channel.dropDown,
        filterOptions[0].data.channel.channelFilter
      );
    });

    // Test: Department column filter validation
    test('department column filter validation', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(
        filterOptions[0].data.department.dropDown,
        filterOptions[0].data.department.optionValue
      );
    });

    // Test: Entity column filter validation
    test('entity column filter validation', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(
        filterOptions[0].data.entity.dropDown,
        filterOptions[0].data.entity.option
      );
    });

    // Test: Owner column filter validation
    test('owner column filter validation', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().runFilterValidation(
        filterOptions[0].data.owner.dropDown,
        filterOptions[0].data.owner.options
      );
    });

    // Test: Clear-all filter button functionality
    test('User checks the Clear-all filter button functionality', async () => {
      // First, apply the filter
      await objpageFactory.ssdmPageFactory().landingPage().selectAndApplyFilter(
        filterOptions[0].data.month.dropDown,
        filterOptions[0].data.month.actuals
      );
      // Then, clear the filter and validate
      await objpageFactory.ssdmPageFactory().landingPage().verifyClearAllFilterFunctionality(
        filterOptions[0].data.month.dropDown,
        filterOptions[0].data.month.actuals
      );
    });

    // Test: Table settings validation
    test('User checks the table settings', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().tableSettings();
    });

    // Test: Sorting validation
    test('User sorts the data rows based on dropdown formats', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().verifySorting();
    });

    // Test: Grouping validation
    test('User groups the data rows based on dropdown formats', async () => {
      await objpageFactory.ssdmPageFactory().landingPage().verifyGrouping();
    });
  }
);