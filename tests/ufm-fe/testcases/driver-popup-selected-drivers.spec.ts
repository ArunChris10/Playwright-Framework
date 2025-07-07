
import { PageFactory } from '../../common/pages/page-factory';
import { test, expect } from "../../common/fixtures/test-hook";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { supplyChainDefaultDriver } from "../testdata/drivers.json";
import { organization } from "../testdata/copyForecast.json";

test.describe('Verify user is able to select drivers', { tag: "@Smoke @driverPopUpSelectedDriver" }, () => {
    let objpageFactory: PageFactory;
    let scenario_details;
    let currentForecast;
    const driverNames = supplyChainDefaultDriver.names;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    });
    test('Check if the user is able to drag selected driver ', { tag: "@driverPopUpSelectedDriver" }, async ({ request }) => {
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
            const lastDriverName = driverNames[driverNames.length - 1];
            const firstDriverNameAfterSwitch = await objpageFactory.ufmPageFactory().addDriverPage().getFirstDriverName();
            expect(firstDriverNameAfterSwitch).toBe(lastDriverName);
        });
    });
});
