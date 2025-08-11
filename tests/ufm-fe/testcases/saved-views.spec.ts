import { expect, test } from '../../common/fixtures/test-hook';
import data from '../testdata/views.json';
import { PageFactory } from '../../common/pages/page-factory';
import { UfmUtility } from '../../ufm-be/fixtures/ufm-utils';
import { ForecastUtility } from '../../ufm-be/fixtures/forecast-utils';
import commonData from "../../ufm-be/constants/common.json"


let lob = "Optical"

let testData = data[lob]

let viewName: string | number = "views" + Date.now()


test.describe('Verify user is able to create edit and delete savedViews', { tag: "@Smoke @savedViews @ibg-shared-ui @ibg-shared-pages @ibg-ufm2-ui" }, () => {

    let objpageFactory: PageFactory;

    test.describe.configure({ timeout: 1200_000, mode: "serial" })

    let scenario_details;
    let scenarioId

    test.beforeAll(async ({ pageFactory, request }) => {
        objpageFactory = pageFactory;
        scenarioId = await ForecastUtility.createForecast(lob.toUpperCase(), request);

        let currentForecast = await UfmUtility.getCurrentForecastList(
            lob,
            request
        );

        scenario_details = await UfmUtility.getScenarioDetails(
            currentForecast,
            scenarioId
        );

    })

    test.afterAll(async ({ request }) => {
        await ForecastUtility.deleteForecast(
            scenario_details["scenarioId"],
            scenario_details["scenarioVersion"],
            commonData.ba_dim_id,
            await UfmUtility.getMapping(lob, "dim_val_id"),
            request
        );

    })



    test(`Check if user able to create a view for scenario from lob: ${lob}`, { tag: "@createView" }, async () => {

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
        await test.step(`Click on ${testData.orgName} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(testData.orgName);
        })

        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenForecastByName(scenario_details["name"])
        })

        await test.step("Click on Create new view", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCreateNewView()
        })

        await test.step('Validate driver modal opens upon clicking create new view', async () => {
            expect(await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()).toBeTruthy()
        })

        await test.step("Search and add drivers", async () => {

            await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(testData.driver.inputDriver)

        })

        await test.step("Validate the header of saved views dropDown", async () => {
            let savedViewsHeader = await objpageFactory.ufmPageFactory().openCurrentForecast().getSavedViewsDropdownHeader()

            expect(savedViewsHeader).toEqual("Untitled View")
        })

        await test.step("Click on Save View", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveView()
        })

        await test.step("Validate the save view modal", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().validateSaveViewModal()
        })

        await test.step("Click on Save with empty name", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().inputSaveViews('')
            //clickOnSave returns false if element is disabled
            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSave()).toBeFalsy()
        })


        await test.step("Input a name in save view text field", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().inputSaveViews(viewName)
        })

        await test.step("Click on Save", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSave()
        })

        await test.step("Wait for View Saved Successfull snackbar", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForSaveViewSuccessMessage()
        })

        await test.step("Validate the header of saved views dropDown", async () => {
            let savedViewsHeader = await objpageFactory.ufmPageFactory().openCurrentForecast().getSavedViewsDropdownHeader()

            expect(savedViewsHeader).toEqual(viewName)
        })
    })

    test('Check if system warns user when provided duplicate name', async () => {
        await test.step("Click on Create new view", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCreateNewView("dropDown")
        })
        await test.step('Validate driver modal opens upon clicking create new view', async () => {
            expect(await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()).toBeTruthy()
        })

        await test.step("Search and add drivers", async () => {

            await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(testData.driver.inputDriver)

        })

        await test.step("Validate the header of saved views dropDown", async () => {
            let savedViewsHeader = await objpageFactory.ufmPageFactory().openCurrentForecast().getSavedViewsDropdownHeader()

            expect(savedViewsHeader?.toString()).toEqual("Untitled View")
        })
        await test.step("Click on Save View", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveView()
        })
        await test.step("Click on Save with duplicate name", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().inputSaveViews(viewName)
            //clickOnSave returns false if element is disZabled
            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().checkDuplicateViewMessage()).toBeTruthy()
            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSave()).toBeFalsy()
        })


    })
    test(`Check if user able to create a view with numeric name for scenario from lob: ${lob}`, { tag: "@createView" }, async () => {


        viewName = Math.floor(Math.random() * 90000) + 10000

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })

        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenForecastByName(scenario_details["name"])
        })


        await test.step("Click on Create new view", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCreateNewView()
        })

        await test.step('Validate driver modal opens upon clicking create new view', async () => {
            expect(await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()).toBeTruthy()
        })

        await test.step("Search and add drivers", async () => {

            await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(testData.driver.inputDriver)

        })

        await test.step("Validate the header of saved views dropDown", async () => {
            let savedViewsHeader = await objpageFactory.ufmPageFactory().openCurrentForecast().getSavedViewsDropdownHeader()

            expect(savedViewsHeader?.toString()).toEqual("Untitled View")
        })

        await test.step("Click on Save View", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveView()
        })


        await test.step("Input a name in save view text field", async () => {

            await objpageFactory.ufmPageFactory().openCurrentForecast().inputSaveViews(viewName.toString())
        })

        await test.step("Click on Save", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSave()
        })

        await test.step("Wait for View Saved Successfull snackbar", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForSaveViewSuccessMessage()
        })

        await test.step("Validate the header of saved views dropDown", async () => {
            let savedViewsHeader = await objpageFactory.ufmPageFactory().openCurrentForecast().getSavedViewsDropdownHeader()

            expect(savedViewsHeader).toEqual(viewName.toString())
        })
    })

    test(`Check if user able to create a view with very long name for scenario from lob: ${lob}`, { tag: "@createView" }, async () => {


        viewName = testData.longName

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })

        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenForecastByName(scenario_details["name"])
        })


        await test.step("Click on Create new view", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCreateNewView()
        })

        await test.step('Validate driver modal opens upon clicking create new view', async () => {
            expect(await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad()).toBeTruthy()
        })

        await test.step("Search and add drivers", async () => {

            await objpageFactory.ufmPageFactory().addDriverPage().searchAndApplyDrivers(testData.driver.inputDriver)

        })

        await test.step("Click on apply drivers", async () => {
            await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers()
        })

        await test.step("Validate the header of saved views dropDown", async () => {
            let savedViewsHeader = await objpageFactory.ufmPageFactory().openCurrentForecast().getSavedViewsDropdownHeader()

            expect(savedViewsHeader).toEqual("Untitled View")
        })

        await test.step("Click on Save View", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSaveView()
        })


        await test.step("Input a name in save view text field", async () => {

            await objpageFactory.ufmPageFactory().openCurrentForecast().inputSaveViews(viewName)
        })

        await test.step("Click on Save", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSave()
        })

        await test.step("Wait for View Saved Successfull snackbar", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForSaveViewSuccessMessage()
        })

        await test.step("Validate the header of saved views dropDown", async () => {
            let savedViewsHeader = await objpageFactory.ufmPageFactory().openCurrentForecast().getSavedViewsDropdownHeader()

            expect(savedViewsHeader).toEqual(viewName)
        })
    })

    test(`Check if user able to delete a view for scenario from lob: ${lob}`, { tag: "@deleteView" }, async () => {

        await test.step("Click on Saved views Dropdown", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnSavedViewsDropdown()
        })

        await test.step("Hover on the view name and click delete", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().deleteView(viewName)
        })

        await test.step("Click on delete in confirmation modal", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnDeleteButton()
        })

        await test.step("Wait for delete success confirmation message", async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForDeleteViewSuccessMessage()
        })

        await test.step("Validate user is taken back to KPI launch page and view is deleted", async () => {
            expect(await objpageFactory.ufmPageFactory().openCurrentForecast().getViewTilePresence(viewName)).toBeFalsy()
        })


    })
});
