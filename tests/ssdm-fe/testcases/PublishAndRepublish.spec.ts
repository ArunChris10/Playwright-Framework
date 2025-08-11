import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { parentChildNodeUtility } from "../fixtures/parentChildNodeUtility";
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';

let driverTreeVersion;
let latestPublishedDriverTreeVersionFromAPI;
let driverTreeName;
let dataSetSelected;
let createdDateForDraft;
let defaultdataSetForDraft;

test.describe(
  'Validations tests for Publish Flow',
  { tag: "@Smoke @Regression @PublishDriverTree @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui @ibg-platform2-ui" },
  async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });
    test.beforeEach(async ({ page, request }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      objpageFactory = new PageFactory(page);
      ({ driverTreeName, dataSetSelected, driverTreeVersion } = await parentChildNodeUtility.getDriverTreeVersion(request));
      latestPublishedDriverTreeVersionFromAPI = `${driverTreeName} Version ${driverTreeVersion} - View`;
      console.log("latestPublishedDriverTreeVersion from API- " + latestPublishedDriverTreeVersionFromAPI);
      ({ defaultdataSetForDraft, createdDateForDraft } = await parentChildNodeUtility.getCurrentDraftCreatedDate(request));
    });

    test.afterEach(async ({ page }) => {
      try {
        await page.close();
      } catch (e) { }
    });

    test('Validate driver tree settings with Draft Version selected - Viewer role', async ({ page }) => {
      await signinUtility.SignIn(page, "viewer");
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateLatestDraftDriverTreeVersion(createdDateForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDetailedChangeLog();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSet(defaultdataSetForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSetDropdownisDisabled();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validatePublishSettingsNotPresent();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateChangeLog(createdDateForDraft);
    });

    test('Validate driver tree settings with Published Version selected - Viewer role', async ({ page }) => {
      await signinUtility.SignIn(page, "viewer");
      let publishedVersionOnUI = await objpageFactory.ssdmPageFactory().settingsDialogPage().getLatestPublishedDriverTreeVersion();
      expect(publishedVersionOnUI).toBe(latestPublishedDriverTreeVersionFromAPI);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSet(dataSetSelected);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSetDropdownisDisabled();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validatePublishSettingsNotPresent();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().closeDriverTreeSettingsDialog();
    });

    test('Validate driver tree settings with Published Version selected - Editor role', async ({ page }) => {
      await signinUtility.SignIn(page, "editor");
      let publishedVersionOnUI = await objpageFactory.ssdmPageFactory().settingsDialogPage().getLatestPublishedDriverTreeVersion();
      expect(publishedVersionOnUI).toBe(latestPublishedDriverTreeVersionFromAPI);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSet(dataSetSelected);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSetDropdownisDisabled();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validatePublishSettingsNotPresent();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().closeDriverTreeSettingsDialog();
    });

    test('Validate driver tree settings with Draft Version selected - Editor role', async ({ page }) => {
      await signinUtility.SignIn(page, "editor");
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateLatestDraftDriverTreeVersion(createdDateForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSet(defaultdataSetForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateChangeLog(createdDateForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSetSelection();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().revertToDefaultDataSet(defaultdataSetForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validatePublishSettingsNotPresent();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDetailedChangeLog();
    });

    test('Validate driver tree settings with Published Version selected - Publisher role', async ({ page }) => {
      await signinUtility.SignIn(page, "publisher");
      let publishedVersionOnUI = await objpageFactory.ssdmPageFactory().settingsDialogPage().getLatestPublishedDriverTreeVersion();
      expect(publishedVersionOnUI).toBe(latestPublishedDriverTreeVersionFromAPI);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSet(dataSetSelected);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSetDropdownisDisabled();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validatePublishSettings();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().closeDriverTreeSettingsDialog();
    });

    test('Validate driver tree settings with Draft Version selected - Publisher role', async ({ page }) => {
      await signinUtility.SignIn(page, "publisher");
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateLatestDraftDriverTreeVersion(createdDateForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDetailedChangeLog();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSet(defaultdataSetForDraft);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validatePublishSettings();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSetDropdownisDisabled();
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateChangeLog(createdDateForDraft);
    });

    test('Validate Publisher is able to Republish', async ({ page }) => {
      await signinUtility.SignIn(page, "publisher");
      let publishedVersionOnUI = await objpageFactory.ssdmPageFactory().settingsDialogPage().getLatestPublishedDriverTreeVersion();
      expect(publishedVersionOnUI).toBe(latestPublishedDriverTreeVersionFromAPI);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validateDataSet(dataSetSelected);
      await objpageFactory.ssdmPageFactory().settingsDialogPage().validatePublishSettings();
      let republishedDriverTreeVersion = await objpageFactory.ssdmPageFactory().settingsDialogPage().republishDriverTree();
      let publishedVersionOnUIPostRepublish = await objpageFactory.ssdmPageFactory().settingsDialogPage().getLatestPublishedDriverTreeVersion();
      expect(publishedVersionOnUIPostRepublish).toContain(republishedDriverTreeVersion);
    });
  })
