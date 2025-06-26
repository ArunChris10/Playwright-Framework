import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { organization } from "../testdata/copyForecast.json";

test.describe('Verify user is able to test Copy Forecast Messages', { tag: "@Smoke @CopyForecastMessages" }, () => {
    let objpageFactory: PageFactory;
    let scenario_details;
    let currentForecast;
    let selectedSourceOptionName;
    let selectedTargetOptionName;
    let errorMessage;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    });
    test('Check if the user is able to test CopyForecast messages in Target Forecast after Data Load Started.', { tag: "@CopyForecastMessages" }, async ({ request }) => {
        test.setTimeout(300000);

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        });
        await test.step(`Click on ${organization.name} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(organization.name);
        });

        let firstForecast;
        await test.step("Wait until currentForecast has firstForecast value", async () => {
            currentForecast = await UfmUtility.getCurrentForecastList(
                organization.lob,
                request
            );
            console.log("Current Forecast Response:", currentForecast);
            firstForecast = currentForecast[0];
        });

        if (!firstForecast) {
            throw new Error("No forecast data found in currentForecast.");
        }

        scenario_details = {
            name: firstForecast.name,
            scenarioId: firstForecast.scenarioId,
        };

        await test.step(`Click on Open ${organization.name} Forecast`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenFirstForecastByName(scenario_details.name);
        });
        await test.step(`Click on action button in the forecast`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnActionButton();
        });
        await test.step(`Verify copy forecast button is available`, async () => {
            await expect(objpageFactory.ufmPageFactory().openCurrentForecast().copyForecast).toBeVisible();
        });
        await test.step(`Click on Copy Forecast data button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnOpenCopyForecastDataButton();
        });
        await test.step(`Click on Source Forecast Dropdown button`, async () => {
            selectedSourceOptionName = await objpageFactory.ufmPageFactory().openCurrentForecast().clickSourceForecastDropdown(scenario_details.name, false);
        });
        await test.step(`Click on Target Forecast Dropdown button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickTargetForecastDropdown(scenario_details.name, true);
        });
        await test.step(`Click on Copy Forecast button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCopyForecastButton();
        });
        await test.step(`Check if Data Load Started message after Copy Forecast button is correct`, async () => {
            const expectedMessage = `Data load from ${selectedSourceOptionName} has started. This process may take up to 10 minutes. You’ll be notified once it’s complete.`;
            errorMessage = `Something went wrong while copying data from ${selectedSourceOptionName}. Please try again later.`
            const actualMessage = await objpageFactory.ufmPageFactory().openCurrentForecast().getAlertMessage(expectedMessage, errorMessage);
            expect(actualMessage).toBe(expectedMessage);
        });
        await test.step(`Check if message after Data Load Started is correct`, async () => {
            const expectedMessage = `Your data has been successfully loaded from ${selectedSourceOptionName}. You can now review the updates in the forecast table`;
            const actualMessage = await objpageFactory.ufmPageFactory().openCurrentForecast().getAlertMessage(expectedMessage, errorMessage);
            expect(actualMessage).toBe(expectedMessage);
        });
    });
    test('Check if the user is able to test CopyForecast messages in Source Forecast after Data Load Started.', { tag: "@CopyForecastMessages" }, async ({ request }) => {
        test.setTimeout(300000);

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        });
        await test.step(`Click on ${organization.name} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(organization.name);
        });

        let firstForecast;
        await test.step("Wait until currentForecast has firstForecast value", async () => {
            currentForecast = await UfmUtility.getCurrentForecastList(
                organization.lob,
                request
            );
            console.log("Current Forecast Response:", currentForecast);
            firstForecast = currentForecast[0];
        });

        if (!firstForecast) {
            throw new Error("No forecast data found in currentForecast.");
        }

        scenario_details = {
            name: firstForecast.name,
            scenarioId: firstForecast.scenarioId,
        };

        await test.step(`Click on Open ${organization.name} Forecast`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenFirstForecastByName(scenario_details.name);
        });
        await test.step(`Click on action button in the forecast`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnActionButton();
        });
        await test.step(`Click on Copy Forecast data button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnOpenCopyForecastDataButton();
        });
        await test.step(`Click on Source Forecast Dropdown button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickSourceForecastDropdown(scenario_details.name, true);
        });
        await test.step(`Click on Target Forecast Dropdown button`, async () => {
            selectedTargetOptionName = await objpageFactory.ufmPageFactory().openCurrentForecast().clickTargetForecastDropdown(scenario_details.name, false);
        });
        await test.step(`Click on Copy Forecast button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnCopyForecastButton();
        });
        await test.step(`Check if Data Load Started message after Copy Forecast button is correct`, async () => {
            const expectedMessage = `Data load to ${selectedTargetOptionName} has started. This process may take up to 10 minutes. You’ll be notified once it’s complete.`;
            errorMessage = `Something went wrong while copying data to ${selectedTargetOptionName}. Please try again later.`
            const actualMessage = await objpageFactory.ufmPageFactory().openCurrentForecast().getAlertMessage(expectedMessage, errorMessage);
            expect(actualMessage).toBe(expectedMessage);
        });
        await test.step(`Check if message after Data Load Started is correct`, async () => {
            const expectedMessage = `Your data has been successfully loaded to ${selectedTargetOptionName}. You can now review the updates in the forecast table`;
            const actualMessage = await objpageFactory.ufmPageFactory().openCurrentForecast().getAlertMessage(expectedMessage, errorMessage);
            expect(actualMessage).toBe(expectedMessage);
        });
    });
});
