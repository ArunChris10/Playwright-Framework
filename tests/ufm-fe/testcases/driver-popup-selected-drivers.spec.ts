import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import commonData from "../../ufm-be/constants/common.json";
import { merchOpsDefaultDriver } from "../testdata/drivers.json";
import { ForecastUtility } from "../../ufm-be/fixtures/forecast-utils";
import { demandOrganization } from "../testdata/organizations.json";

test.describe('Verify user is able to select drivers and switch orders', { tag: "@Smoke @driverPopUpSelectedDriver" }, () => {
    let objpageFactory: PageFactory, scenario_details, currentForecast, firstDriverNameAfterSwitch, lastDriverName, scenarioId, firstForecast;

    const driverNames = merchOpsDefaultDriver.names;

    test.beforeAll(async ({ pageFactory, request }) => {
        objpageFactory = pageFactory;
        scenarioId = await ForecastUtility.createForecast(
            demandOrganization.lob,
            request,
        );
    });
    test.afterAll(async ({ request }) => {
        await ForecastUtility.deleteForecast(
            scenarioId,
            scenario_details.scenarioVersion,
            commonData.lob_dim_id,
            scenario_details.lineOfBusiness,
            request
        );
    });
    test('Check if the user is able to drag selected driver and the updated order is reflecting in the MyKPI table upon clicking apply', { tag: "@driverPopUpSelectedDriver" }, async ({ request, page }) => {
        test.setTimeout(300000);

        await test.step('Go To UFM Page', async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        });
        await test.step(`Click on ${demandOrganization.name} Organization`, async () => {
            await objpageFactory.ufmPageFactory().organisationSelection().selectOrganisation(demandOrganization.name);
        });

        await test.step("Wait until currentForecast has firstForecast value", async () => {
            currentForecast = await UfmUtility.getCurrentForecastList(
                demandOrganization.lob,
                request
            );
            await page.waitForTimeout(3000);
            console.log("Current Forecast Response:", currentForecast);
            firstForecast = currentForecast[0];
        });

        if (!firstForecast) {
            throw new Error("No forecast data found in currentForecast.");
        }

        scenario_details = {
            name: firstForecast.name,
            scenarioId: firstForecast.scenarioId,
            scenarioVersion: firstForecast.scenarioVersion,
            lineOfBusiness: firstForecast.lineOfBusiness,
        };

        await test.step(`Click on Open ${demandOrganization.name} Forecast`, async () => {
            await objpageFactory.ufmPageFactory().currentForecast().clickOpenFirstForecastByName(scenario_details.name);
        });
        await test.step(`Click on Drivers button`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().clickOnChooseDriver();
        });
        await test.step(`Select drivers`, async () => {
            await objpageFactory.ufmPageFactory().addDriverPage().waitForPageLoad();
            for (const driverName of driverNames) {
                await objpageFactory.ufmPageFactory().addDriverPage().onCheckDriverBasedOnName(driverName);
            }
        });
        await test.step(`Verify first driver`, async () => {
            const firstDriverName = driverNames[0];
            const firstDriverNameBeforeSwitch = await objpageFactory.ufmPageFactory().addDriverPage().getFirstDriverName();
            expect(firstDriverNameBeforeSwitch).toBe(firstDriverName);
        });
        await test.step(`Switch Drivers order`, async () => {
            await objpageFactory.ufmPageFactory().addDriverPage().switchSelectedDriverOrder();
        });
        await test.step(`Verify last driver is now first driver`, async () => {
            lastDriverName = driverNames[driverNames.length - 1];
            firstDriverNameAfterSwitch = await objpageFactory.ufmPageFactory().addDriverPage().getFirstDriverName();
            expect(firstDriverNameAfterSwitch).toBe(lastDriverName);
        });
        await test.step(`Apply Drivers`, async () => {
            await objpageFactory.ufmPageFactory().addDriverPage().clickOnApplyDrivers();
        });
        await test.step('Validate added driver is visible on KPI table', async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().waitForKPITableToLoad();        
        });
        await test.step(`Verify if the updated order is reflecting in the MyKPI table upon clicking apply`, async () => {
            firstDriverNameAfterSwitch = await objpageFactory.ufmPageFactory().addDriverPage().getKPILandingFirstDriverName();
            expect(firstDriverNameAfterSwitch).toBe(lastDriverName);
        });
        await test.step(`Verify if user can change the order in MyKPI table after Apply`, async () => {
            await objpageFactory.ufmPageFactory().openCurrentForecast().switchKPILandingSelectedDriverOrder();
            expect(firstDriverNameAfterSwitch).toBe(lastDriverName);
        });
        await test.step(`Verify first driver is now first driver`, async () => {
            const firstDriverName = driverNames[0];
            firstDriverNameAfterSwitch = await objpageFactory.ufmPageFactory().addDriverPage().getKPILandingFirstDriverName();
            expect(firstDriverNameAfterSwitch).toBe(firstDriverName);
        });
    });
});
