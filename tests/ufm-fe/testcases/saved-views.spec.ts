import { expect, test } from "../../common/fixtures/test-hook";
import data from "../testdata/views.json";
import { PageFactory } from "../../common/pages/page-factory";
import { UfmUtility } from "../../ufm-be/fixtures/ufm-utils";
import { ForecastUtility } from "../../ufm-be/fixtures/forecast-utils";
import commonData from "../../ufm-be/constants/common.json";

let lob = "Optical";
let lob_1 = "RX";

let testData = data[lob];

let viewName: string | number = "views" + Date.now();

test.describe(
  "Verify user is able to create edit and delete savedViews",
  { tag: "@Smoke @savedViews @Regression" },
  () => {
    let objpageFactory: PageFactory;

    test.describe.configure({ timeout: 1200_000, mode: "serial" });

    let scenario_details;
    let scenarioId;
    let scenarioId_1;
    let scenario_details_1;

    test.beforeAll(async ({ pageFactory, request }) => {
      objpageFactory = pageFactory;
      scenarioId = await ForecastUtility.createForecast(
        lob.toUpperCase(),
        request
      );

      let currentForecast = await UfmUtility.getCurrentForecastList(
        lob,
        request
      );

      scenario_details = await UfmUtility.getScenarioDetails(
        currentForecast,
        scenarioId
      );
      if (test.info().title.includes("Check if the view created in LOB A is not reflecting in LOB B")) {
        scenarioId_1 = await ForecastUtility.createForecast(lob_1.toUpperCase(), request);

        let currentForecast_1 = await UfmUtility.getCurrentForecastList(
              lob_1,
              request
        );
        scenario_details_1 = await UfmUtility.getScenarioDetails(
            currentForecast_1,
          scenarioId_1
        );
      }
    });
    // test.afterAll(async ({ request }) => {
    //   await ForecastUtility.deleteForecast(
    //     scenario_details["scenarioId"],
    //     scenario_details["scenarioVersion"],
    //     commonData.ba_dim_id,
    //     await UfmUtility.getMapping(lob, "dim_val_id"),
    //     request
    //   );
    // });

    test(
      `Check if user able to create a view for scenario from lob: ${lob}`,
      { tag: "@createView @Regression" },
      async () => {
        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });
        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Validate the save view modal", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .validateSaveViewModal();
        });

        await test.step("Click on Save with empty name", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews("");
          //clickOnSave returns false if element is disabled
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .clickOnSave()
          ).toBeFalsy();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName);
        });
      }
    );

    test("Check if system warns user when provided duplicate name",{ tag: "@createView @Regression @Smoke" }, async () => {
      await test.step("Click on Create new view", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnCreateNewView("dropDown");
      });
      await test.step("Validate driver modal opens upon clicking create new view", async () => {
        expect(
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .waitForPageLoad()
        ).toBeTruthy();
      });

      await test.step("Search and add drivers", async () => {
        await objpageFactory
          .ufmPageFactory()
          .addDriverPage()
          .searchAndApplyDrivers(testData.driver.inputDriver);
      });

      await test.step("Validate the header of saved views dropDown", async () => {
        let savedViewsHeader = await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .getSavedViewsDropdownHeader();

        expect(savedViewsHeader?.toString()).toEqual("Untitled View");
      });
      await test.step("Click on Save View", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnSaveView();
      });
      await test.step("Click on Save with duplicate name", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .inputSaveViews(viewName);
        //clickOnSave returns false if element is disabled
        expect(
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .checkDuplicateViewMessage()
        ).toBeTruthy();
        expect(
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave()
        ).toBeFalsy();
      });
    });

    test(
      `Create views with header changes(filters,units)`,
      { tag: "@createView @Regression @Smoke" },
      async () => {
        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });
        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });
        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Open a saved view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView("");
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForKPITableLoad()
          ).toBeTruthy();
        });

        // Changing values in toolbar
        const groupByOptions = [
          {
            data: {
              department: {
                option: "Department",
              },
            },
          },
        ];

        for (const groupByOption of groupByOptions) {
          for (const [, groupBySelection] of Object.entries(
            groupByOption.data
          )) {
            await test.step(`Select ${groupBySelection["option"]} group By Options`, async () => {
              await objpageFactory
                .ssdmPageFactory()
                .applyFilter()
                .clickOnGroupBy();
              await objpageFactory
                .ssdmPageFactory()
                .applyFilter()
                .selectGroupByOption(groupBySelection["option"]);
            });
          }
        }

        const filterOption = {
          data: {
            channel: {
              dropDown: "Channel",
              childDropDown: "DELIVERY",
              option: "OWNED_S2H",
            },
            department: {
              dropDown: "Department",
              childDropDown: "FOOD",
              option: "1_CANDY",
            },
          },
        };

        for (const [, filterSelection] of Object.entries(filterOption.data)) {
          await test.step(`Select ${filterSelection["childDropDown"]} ${filterSelection["dropDown"]} ${filterSelection["option"]} filter options`, async () => {
            await objpageFactory
              .ssdmPageFactory()
              .applyFilter()
              .clickOnFiltersButton();
            await objpageFactory
              .ufmPageFactory()
              .currentForecast()
              .clickOnFilterDropdown(filterSelection["dropDown"]);
            await objpageFactory
              .ssdmPageFactory()
              .applyFilter()
              .clickOnFilterOption(filterSelection["childDropDown"]);
            await objpageFactory
              .ssdmPageFactory()
              .applyFilter()
              .searchFilterOption(filterSelection["option"]);
          });
        }

        await test.step("Click on Apply Changes", async () => {
          await objpageFactory
            .ssdmPageFactory()
            .applyFilter()
            .clickOnApplyChanges();
        });

        await test.step("Validate kpi table loads", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForKPITableLoad()
          ).toBeTruthy();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();
          expect(savedViewsHeader?.toString()).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });
        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews("New View");
        });
        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();
          expect(savedViewsHeader?.toString()).toEqual("New View");
        });
      }
    );

    test(
      `Check if user able to create a view with numeric name for scenario from lob: ${lob}`,
      { tag: "@createView @Smoke @Regression" },
      async () => {
        viewName = Math.floor(Math.random() * 90000) + 10000;

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader?.toString()).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName.toString());
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName.toString());
        });
      }
    );

    test(
      `Retrieve if user views exist, create one if not, and validate name and icon`,
      { tag: "@getUserViews @Smoke @Regression" },
      async () => {
        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Check if user views are present", async () => {
          const userViewsWithIcon = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getUserViewTilePresence();
          if (userViewsWithIcon === 0) {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .clickOnChooseDriver();

            await test.step("Validate driver modal opens upon clicking create new view", async () => {
              expect(
                await objpageFactory
                  .ufmPageFactory()
                  .addDriverPage()
                  .waitForPageLoad()
              ).toBeTruthy();
            });

            await test.step("Search and add drivers", async () => {
              await objpageFactory
                .ufmPageFactory()
                .addDriverPage()
                .searchAndApplyDrivers(testData.driver.inputDriver);
            });

            await test.step("Click on apply drivers", async () => {
              await objpageFactory
                .ufmPageFactory()
                .addDriverPage()
                .clickOnApplyDrivers();
            });

            await test.step("Validate the header of saved views dropDown", async () => {
              let savedViewsHeader = await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .getSavedViewsDropdownHeader();

              expect(savedViewsHeader).toEqual("Untitled View");
            });

            await test.step("Click on Save View", async () => {
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .clickOnSaveView();
            });

            await test.step("Input a name in save view text field", async () => {
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .inputSaveViews(viewName);
            });

            await test.step("Click on Save", async () => {
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .clickOnSave();
            });

            await test.step("Wait for View Saved Successfull snackbar", async () => {
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .waitForSaveViewSuccessMessage();
            });

            await test.step("Validate the header of saved views dropDown", async () => {
              let savedViewsHeader = await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .getSavedViewsDropdownHeader();

              expect(savedViewsHeader).toEqual(viewName);
            });
          } else {
            expect(userViewsWithIcon).toBeGreaterThan(0);
          }
        });
      }
    );

    test(
      `Check if user able to delete a view for scenario from lob: ${lob}`,
      { tag: "@deleteView @Smoke @Regression" },
      async () => {
        await test.step("Click on Saved views Dropdown", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSavedViewsDropdown();
        });

        await test.step("Hover on the view name and click delete", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .deleteView(viewName);
        });

        await test.step("Click on delete in confirmation modal", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnDeleteButton();
        });

        await test.step("Wait for delete success confirmation message", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForDeleteViewSuccessMessage();
        });

        await test.step("Validate user is taken back to KPI launch page and view is deleted", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .getViewTilePresence(viewName)
          ).toBeFalsy();
        });
      }
    );

    test(
      `Edit views with special characters`,
      { tag: "@editViews @Smoke @Regression" },
      async () => {
        const randomName = `View_${Math.random()
          .toString(36)
          .substring(2, 10)}`;
        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Frecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Select a view tile", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .selectViewTile();
        });

        await test.step("Validate kpi landing page is loaded", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnDriver();

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDrivers);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });
        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDrivers);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(randomName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(randomName);
        });
      }
    );
    test(
      `Edit views and verify the edits`,
      { tag: "@editViews @verify @Smoke @Regression" },
      async () => {
        const randomName = `View_${Math.random()
          .toString(36)
          .substring(2, 10)}`;
        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Select a view tile", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .selectViewTile();
        });

        await test.step("Validate KPI landing page is loaded", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnDriver();

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDrivers);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(randomName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successful snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate drivers are present in ag-grid", async () => {
          const driversInGrid = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getDriversFromGrid();
          expect(driversInGrid).toBe(testData.driver.expectedDriverCount);
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();
          expect(savedViewsHeader).toEqual(randomName);
        });
      }
    );

    test(
      `Check if user able to create a view with duplicate name for scenario from lob: ${lob}`,
      { tag: "@createView @duplicateViewName @Smoke @Regression" },
      async () => {
        viewName = testData.viewName;

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName);
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSavedViewsDropdown();
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });
        await test.step("Check if duplicate view name message is visible", async () => {
          const isDuplicateMessageVisible = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .isDuplicateViewMessageVisible();
          expect(isDuplicateMessageVisible).toBeTruthy();
        });
      }
    );
    test(
      `Check if a view is edited successfully`,
      { tag: "@editViews @success @Smoke @Regression" },
      async () => {
        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Select a view tile", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .selectViewTile();
        });

        await test.step("Validate KPI landing page is loaded", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnDriver();

        await test.step("Validate driver modal opens upon clicking Drivers chip", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDrivers);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successful snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });
      }
    );

    test(
      `Check if user able to create a view with very long view name`,
      { tag: "@createView @longViewName @Smoke @Regression" },
      async () => {
        viewName = "View_" + "x".repeat(255);

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual("Untitled View");
        });
        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDrivers);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName);
        });
      }
    );
    test(
      `Check if user able to edit a view by giving a very long view name`,
      { tag: "@editView @longViewName @Smoke @Regression" },
      async () => {
        viewName = "View_" + "y".repeat(255);

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Select a view tile", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .selectViewTile();
        });

        await test.step("Validate KPI landing page is loaded", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnDriver();

        await test.step("Validate driver modal opens upon clicking Drivers chip", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDrivers);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName);
        });
      }
    );
    test(
      `Check if user able to create a view with unique name`,
      { tag: "@createView @uniqueName @Smoke @Regression" },
      async () => {

        viewName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName);
        });
      }
    );
    test(
      `Check if user able to switch between views`,
      { tag: "@switchView @Smoke @Regression" },
      async () => {

        viewName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName);
        });
        await test.step("Validate KPI landing page is loaded", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForPageLoad()
          ).toBeTruthy();
        });
        await test.step("Click on the views dropdown", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSavedViewsDropdown();
        });
        await test.step("switch to a different view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .switchToFirstView(viewName);
        });
        await test.step("Validate KPI landing page is loaded after switching to a different view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForPageLoad()
          ).toBeTruthy();
        });
        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();
            expect(savedViewsHeader).not.toEqual(viewName);
        });
      }
    );
    
    test(
      `Check if the view created in LOB A is not reflecting in LOB B`,
      { tag: "@switchViewBetweenLobs @Smoke @Regression" },
      async () => {

        viewName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });

        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });

        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });

        await test.step("Click on Create new view", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnCreateNewView();
        });

        await test.step("Validate driver modal opens upon clicking create new view", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });

        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDriver);
        });

        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual("Untitled View");
        });

        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveView();
        });

        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViews(viewName);
        });

        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });

        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });

        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();

          expect(savedViewsHeader).toEqual(viewName);
        });
        await test.step('Go To organization selection page', async () => {
          await objpageFactory.ufmPageFactory().organisationSelection().clickOnOrganizationBreadcrumb()
      })
      await test.step(`Click on ${testData.orgName} Organization`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .organisationSelection()
          .selectOrganisation(testData.orgName);
      });
      await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .currentForecast()
          .clickOpenForecastByName(scenario_details_1["name"]);
      });
      await test.step("Verify if the view is not showing up", async () => {
        expect(
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getViewTilePresence(viewName)
        ).toBeFalsy();
      });
      }
    );
    test("Check if views are empty", { tag: "@emptyViews @Smoke @Regression" }, async ({ page }) => {
      await test.step("Go To UFM Page", async () => {
        await objpageFactory
          .ufmPageFactory()
          .organisationSelection()
          .navigate();
      });

      await test.step(`Click on ${testData.orgName} Organization`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .organisationSelection()
          .selectOrganisation(testData.orgName);
      });

      await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .currentForecast()
          .clickOpenForecastByName(scenario_details["name"]);
      });
      await test.step("Check if views are empty", async () => {
        const userViewsCount = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getUserViewTilePresence();
        const globalViewsCount = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getGlobalViewTilePresence();

        if (userViewsCount && globalViewsCount === 0) {
            const isTextVisible = await page.locator('text=Start your forecast by adding drivers').isVisible();
            expect(isTextVisible).toBeTruthy();
        }
    });
  });
  test(
    `Check if a user view can be saved as a new view`,
    { tag: "@saveAsNewView" },
    async () => {

      viewName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

      await test.step("Go To UFM Page", async () => {
        await objpageFactory
          .ufmPageFactory()
          .organisationSelection()
          .navigate();
      });

      await test.step(`Click on ${testData.orgName} Organization`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .organisationSelection()
          .selectOrganisation(testData.orgName);
      });

      await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
        await objpageFactory
          .ufmPageFactory()
          .currentForecast()
          .clickOpenForecastByName(scenario_details["name"]);
      });

      await test.step("Select a view tile", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .selectViewTile();
      });

      await test.step("Validate KPI landing page is loaded", async () => {
        expect(
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForPageLoad()
        ).toBeTruthy();
      });

      await objpageFactory
        .ufmPageFactory()
        .openCurrentForecast()
        .clickOnDriver();

      await test.step("Validate driver modal opens upon clicking Drivers chip", async () => {
        expect(
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .waitForPageLoad()
        ).toBeTruthy();
      });

      await test.step("Search and add drivers", async () => {
        await objpageFactory
          .ufmPageFactory()
          .addDriverPage()
          .searchAndApplyDrivers(testData.driver.inputDrivers);
      });

      await test.step("Click on apply drivers", async () => {
        await objpageFactory
          .ufmPageFactory()
          .addDriverPage()
          .clickOnApplyDrivers();
      });

      await test.step("Click on Save View", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnSaveAsNew();
      });

      await test.step("Input a name in save view text field", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .inputSaveViewsAs(viewName);
      });

      await test.step("Click on Save", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnSave();
      });

      await test.step("Wait for View Saved Successfull snackbar", async () => {
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .waitForSaveViewSuccessMessage();
      });

      await test.step("Validate the header of saved views dropDown", async () => {
        let savedViewsHeader = await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .getSavedViewsDropdownHeader();

        expect(savedViewsHeader).toEqual(viewName);
      });
    });
    test(
      `Check if a user view can be saved as a new view from a global view`,
      { tag: "@saveAsNewView @globalView @Smoke @Regression" },
      async () => {
  
        viewName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  
        await test.step("Go To UFM Page", async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .navigate();
        });
  
        await test.step(`Click on ${testData.orgName} Organization`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .organisationSelection()
            .selectOrganisation(testData.orgName);
        });
  
        await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
          await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(scenario_details["name"]);
        });
        const globalViewsCount = await objpageFactory
        .ufmPageFactory()
        .openCurrentForecast()
        .getGlobalViewTilePresence();
        if(globalViewsCount >0 ) {
          
          await test.step("Select a view tile", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .selectGlobalViewTile();
          });
  
        await test.step("Validate KPI landing page is loaded", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .waitForPageLoad()
          ).toBeTruthy();
        });
  
        await objpageFactory
          .ufmPageFactory()
          .openCurrentForecast()
          .clickOnDriver();
  
        await test.step("Validate driver modal opens upon clicking Drivers chip", async () => {
          expect(
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .waitForPageLoad()
          ).toBeTruthy();
        });
  
        await test.step("Search and add drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .searchAndApplyDrivers(testData.driver.inputDrivers);
        });
  
        await test.step("Click on apply drivers", async () => {
          await objpageFactory
            .ufmPageFactory()
            .addDriverPage()
            .clickOnApplyDrivers();
        });
  
        await test.step("Click on Save View", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSaveAsNew();
        });
  
        await test.step("Input a name in save view text field", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .inputSaveViewsAs(viewName);
        });
  
        await test.step("Click on Save", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnSave();
        });
  
        await test.step("Wait for View Saved Successfull snackbar", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .waitForSaveViewSuccessMessage();
        });
  
        await test.step("Validate the header of saved views dropDown", async () => {
          let savedViewsHeader = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .getSavedViewsDropdownHeader();
  
          expect(savedViewsHeader).toEqual(viewName);
        });
      }
      });
      test(
        `Check if user able to switch between views and overwrite changes`,
        { tag: "@switchView @overwrite @Smoke @Regression" },
        async () => {
  
          viewName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  
          await test.step("Go To UFM Page", async () => {
            await objpageFactory
              .ufmPageFactory()
              .organisationSelection()
              .navigate();
          });
  
          await test.step(`Click on ${testData.orgName} Organization`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .organisationSelection()
              .selectOrganisation(testData.orgName);
          });
  
          await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .currentForecast()
              .clickOpenForecastByName(scenario_details["name"]);
          });

          await test.step("Select a view tile", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .selectViewTile();
          });
    
          await test.step("Validate KPI landing page is loaded", async () => {
            expect(
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .waitForPageLoad()
            ).toBeTruthy();
          });
    
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnDriver();
    
          await test.step("Validate driver modal opens upon clicking Drivers chip", async () => {
            expect(
              await objpageFactory
                .ufmPageFactory()
                .addDriverPage()
                .waitForPageLoad()
            ).toBeTruthy();
          });
    
          await test.step("Search and add drivers", async () => {
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .searchAndApplyDrivers(testData.driver.inputDrivers);
          });
    
          await test.step("Click on apply drivers", async () => {
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .clickOnApplyDrivers();
          });
          await test.step("Validate KPI landing page is loaded", async () => {
            expect(
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .waitForPageLoad()
            ).toBeTruthy();
          });
          await test.step("Click on the views dropdown", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .clickOnSavedViewsDropdown();
          });
          await test.step("switch to a different view", async () => {
            let savedViewsHeader = await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .getSavedViewsDropdownHeader();
  
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .switchToFirstView(savedViewsHeader);
          });
          await test.step("Validate the unsaved view modal", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .validateUnsavedViewModal();
          });
          await test.step("Validate if the view was overwritten", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .clickOnOverwrite();

              let savedViewsHeader = await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .getSavedViewsDropdownHeader();

              await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .getSavedViewsDropdownHeader();
    
            expect(savedViewsHeader).not.toEqual(viewName);
          });
        }
      );
      test(
        `Check if user able to switch between views and cancel changes`,
        { tag: "@switchView @cancel @Smoke @Regression" },
        async () => {
  
          viewName = `${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  
          await test.step("Go To UFM Page", async () => {
            await objpageFactory
              .ufmPageFactory()
              .organisationSelection()
              .navigate();
          });
  
          await test.step(`Click on ${testData.orgName} Organization`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .organisationSelection()
              .selectOrganisation(testData.orgName);
          });
  
          await test.step(`Click on Open ${testData.orgName} Forecast`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .currentForecast()
              .clickOpenForecastByName(scenario_details["name"]);
          });

          await test.step("Select a view tile", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .selectViewTile();
          });
    
          await test.step("Validate KPI landing page is loaded", async () => {
            expect(
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .waitForPageLoad()
            ).toBeTruthy();
          });
    
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnDriver();
    
          await test.step("Validate driver modal opens upon clicking Drivers chip", async () => {
            expect(
              await objpageFactory
                .ufmPageFactory()
                .addDriverPage()
                .waitForPageLoad()
            ).toBeTruthy();
          });
    
          await test.step("Search and add drivers", async () => {
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .searchAndApplyDrivers(testData.driver.inputDrivers);
          });
    
          await test.step("Click on apply drivers", async () => {
            await objpageFactory
              .ufmPageFactory()
              .addDriverPage()
              .clickOnApplyDrivers();
          });
          await test.step("Validate KPI landing page is loaded", async () => {
            expect(
              await objpageFactory
                .ufmPageFactory()
                .openCurrentForecast()
                .waitForPageLoad()
            ).toBeTruthy();
          });
          await test.step("Click on the views dropdown and switch view", async () => {
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .clickOnSavedViewsDropdown();
            
            let savedViewsHeader = await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .getSavedViewsDropdownHeader();

              await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .switchToFirstView(savedViewsHeader);

              await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .validateUnsavedViewModal();

              await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .clickOnCancel();

             let newSavedViewsHeader = await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .getSavedViewsDropdownHeader();
    
            expect(newSavedViewsHeader).toEqual(savedViewsHeader);
          });
        }
      );

});
