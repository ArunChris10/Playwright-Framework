import { testData } from "../testdata/inputNodeValues.json";
import { PageFactory } from "../../common/pages/page-factory";
import { test } from "../../common/fixtures/test-hook";

let lobList = {
    [testData[0].sbaName]: [testData[0].LOB],
};
const driverName = testData[0].driver.inputDriver;

Object.entries(lobList).forEach(([org, lob]) => {
    for (let i = 0; i < lob.length; i++) {
        test.describe(
            "Verify forecast comparison functionality",
            { tag: "@Smoke @forecastcomparison" },
            async () => {
                test.describe.configure({ timeout: 800_000, mode: "serial" });
                let objpageFactory: PageFactory;

                test.beforeAll(async ({ pageFactory, request }) => {
                    objpageFactory = pageFactory;
                });

                test("Verify inputter can apply comparisons on forecast data for input nodes for forecast comparison", async () => {
                    test.setTimeout(300000);

                    await test.step("Go To UFM Page", async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .organisationSelection()
                            .navigate();
                    });
                    await test.step(`Click on ${org} Organization`, async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .organisationSelection()
                            .selectOrganisation(org);
                    });

                    await test.step(`Click on Open ${org} Frecast`, async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .currentForecast()
                            .clickOnOpenParticularForecast(lob[i]);
                    });

                    await test.step("Click on choose different drivers", async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .openCurrentForecast()
                            .clickOnChooseDifferentDriver();
                    });

                    await test.step(`Search for input driver ${driverName}`, async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .addDriverPage()
                            .waitForPageLoad();
                        await objpageFactory
                            .ufmPageFactory()
                            .addDriverPage()
                            .inputDriverName(driverName);
                    });

                    await test.step(`Select input driver ${driverName}`, async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .addDriverPage()
                            .selectDriver(driverName);
                    });

                    await test.step("Click on Apply Drivers", async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .addDriverPage()
                            .clickOnApplyDrivers();
                    });

                    await test.step("Wait for KPI table to load", async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .openCurrentForecast()
                            .waitForKPITableToLoad();
                    });

                    await test.step("Click on Compare Button and check if the pop up is getting opened", async () => {
                        await objpageFactory
                            .forecastComparisonPageFactory()
                            .clickOnCompare();
                    });

                    await test.step("Click on comparison checkbox", async () => {
                        await objpageFactory
                            .forecastComparisonPageFactory()
                            .selectComparisonCheckBox("vs Last Year (LY)");
                    });

                    await test.step("User clicks on apply changes for comparison ", async () => {
                        await objpageFactory
                            .ssdmPageFactory()
                            .applyFilter()
                            .clickOnApplyChanges();
                    });

                    await test.step("Wait for KPI table to load after clicking on apply changes for comparison forecast", async () => {
                        await objpageFactory
                            .ufmPageFactory()
                            .openCurrentForecast()
                            .waitForKPITableToLoad();
                    });
                });
            }
        );
    }
});
