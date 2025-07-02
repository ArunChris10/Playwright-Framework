/**
 * Copy Forecast Cross-SBA Negative Test Suite - Scalable Multi-SBA Validation
 * 
 * This test suite validates the restriction functionality of copying forecast data 
 * within the same Strategic Business Area (SBA) in the UFM (Unified Forecast Management) system.
 * 
 * Test Coverage:
 * 1. Creates scenarios for all SBAs defined in sbaTestList via API
 * 2. Uses a single parameterized test that iterates over each SBA scenario
 * 3. For each SBA scenario, verifies that ALL OTHER SBA scenarios are NOT available in copy dropdowns
 * 4. Validates that only same-SBA scenarios appear in source and destination dropdowns
 * 5. Ensures proper SBA isolation in the copy forecast functionality across multiple SBAs
 * 6. Cleans up (deletes) all created scenarios after test completion
 * 
 * Test Structure:
 * - sbaTestList: Configurable list of SBAs to test (easily scalable)
 * - beforeAll: Iterates through sbaTestList to create scenarios for each SBA via API
 * - Single parameterized test: For each SBA, tests that other SBAs are not visible
 * - afterAll: Deletes all created scenarios via API
 * 
 * Scalability:
 * - Add/remove SBAs by modifying the sbaTestList array
 * - Test automatically adapts to any number of SBAs
 * - Each SBA is tested against ALL other SBAs in the list
 * 
 * Prerequisites:
 * - Valid test organizations for all SBAs in sbaTestList
 * - API access to create and delete forecast scenarios
 * - Proper user permissions for forecast operations
 * 
 * @author s0g0fhn
 * 
 * @tags @Smoke @CopyForecastCrossSBA @Negative @Scalable
 */

import { PageFactory } from "../../common/pages/page-factory";
import { test, expect } from "../../common/fixtures/test-hook";
import { ForecastUtility } from "../../ufm-be/fixtures/forecast-utils";
import commonData from "../../ufm-be/constants/common.json";

test.describe.configure({ mode: 'serial' });

test.describe(
  "Copy forecast data validation - Verify same SBA restriction in Source and Target dropdowns",
  { tag: "@Smoke @CopyForecastCrossSBA @Negative" },
  () => {
    let objpageFactory: PageFactory;
    let testPage: any; // Store page reference
    let createdScenarios: Array<{
      sbaData: any;
      scenarioDetails: any;
    }> = [];

    // List of SBAs to test - easily scalable for additional SBAs
    const sbaTestList = [
      {
        ba: "Supply chain",
        lob: "FULFILLMENT"
      },
      {
        ba: "Supply chain", 
        lob: "CORE_SERVICES"
      }
      // Add more SBAs here to scale the test:
      // {
      //   ba: "Supply chain",
      //   lob: "PLANNING", 
      //   sba: "PLANNING"
      // },
      // {
      //   ba: "Supply chain",
      //   lob: "FINANCE", 
      //   sba: "FINANCE"
      // }
    ];

    test.beforeAll(async ({ browser, request }) => {
      // Create a single page instance for the entire test suite
      testPage = await browser.newPage();
      objpageFactory = new PageFactory(testPage);
      
      // Create scenarios for each SBA in the list
      for (let i = 0; i < sbaTestList.length; i++) {
        const sbaData = sbaTestList[i];
        await test.step(`Create forecast scenario for ${sbaData.lob} SBA`, async () => {
          // Create or get existing forecast for current SBA
          const [scenarioDetails, isNewCreated] = await ForecastUtility.getOrCreateForecastIfNotExists(
            sbaData.lob,
            request
          );
          
          createdScenarios.push({
            sbaData: sbaData,
            scenarioDetails: scenarioDetails
          });
          
          console.log(`Scenario created/retrieved for ${sbaData.lob}: ${scenarioDetails.scenarioId}`);
        });
      }
    });

    test.afterAll(async ({ request }) => {
      // Clean up all created scenarios
      for (let i = 0; i < createdScenarios.length; i++) {
        const scenario = createdScenarios[i];
        await test.step(`Delete scenario from ${scenario.sbaData.lob} SBA`, async () => {
          if (scenario.scenarioDetails) {
            try {
              await ForecastUtility.deleteForecast(
                scenario.scenarioDetails.scenarioId,
                scenario.scenarioDetails.scenarioVersion,
                commonData.lob_dim_id,
                scenario.scenarioDetails.lineOfBusiness,
                request
              );
              console.log(`Scenario deleted: ${scenario.scenarioDetails.scenarioId} from ${scenario.sbaData.lob}`);
            } catch (error) {
              console.log(`Failed to delete scenario from ${scenario.sbaData.lob}: ${error}`);
            }
          }
        });
      }
    });

    // Single test that iterates over all SBAs internally
    test(`Verify cross-SBA scenario filtering - All SBAs should be restricted`, { tag: "@CopyForecastCrossSBA @Negative" }, async () => {
      test.setTimeout(600000); // Increased timeout for multiple SBA testing

      // Test each SBA scenario against all others
      for (let i = 0; i < sbaTestList.length; i++) {
        const currentScenario = createdScenarios[i];
        const otherScenarios = createdScenarios.filter((_, index) => index !== i);

        await test.step(`Testing SBA: ${currentScenario.sbaData.lob}`, async () => {
          // For first iteration, navigate to UFM page, for subsequent iterations use breadcrumb
          if (i === 0) {
            await test.step("Navigate to UFM Page", async () => {
              await objpageFactory
                .ufmPageFactory()
                .organisationSelection()
                .navigate();
            });
          } else {
            await test.step("Navigate back to organization selection page using breadcrumb", async () => {
              await objpageFactory
                .ufmPageFactory()
                .organisationSelection()
                .clickOnOrganizationBreadcrumb();
            });
          }

          await test.step(`Select ${currentScenario.sbaData.ba} Organization`, async () => {
            await objpageFactory
              .ufmPageFactory()
              .organisationSelection()
              .selectOrganisation(currentScenario.sbaData.ba);
          });

          await test.step(`Open ${currentScenario.scenarioDetails.name} scenario (${currentScenario.sbaData.lob}) in the current SBA`, async () => {
            await objpageFactory
            .ufmPageFactory()
            .currentForecast()
            .clickOpenForecastByName(currentScenario.scenarioDetails.name);
        });

        await test.step("Click on Actions button to access copy forecast functionality", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnActionButton();
        });

        await test.step("Verify Copy forecast data button is available", async () => {
          await expect(
            objpageFactory.ufmPageFactory().openCurrentForecast().copyForecast
          ).toBeVisible();
        });

        await test.step("Click on Copy forecast data button to open the modal", async () => {
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .clickOnOpenCopyForecastDataButton();
        });

        await test.step("Click on Source forecast dropdown and verify only same SBA scenarios are available", async () => {
          // Verify that current SBA scenario IS present in source dropdown
          const currentScenarioPresent = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .isScenarioInSourceDropdown(currentScenario.scenarioDetails.scenarioId);
          
          expect(currentScenarioPresent).toBe(true);
          
          // Close the dropdown after checking current scenario
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .closeDropdown();

          // Verify that scenarios from other SBAs are NOT present in source dropdown
          for (const otherScenario of otherScenarios) {
            const scenarioNotPresent = await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .isScenarioNotInSourceDropdown(otherScenario.scenarioDetails.scenarioId);
              
            expect(scenarioNotPresent).toBe(true);
            
            // Close the dropdown after each scenario check
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .closeDropdown();
          }
        });

        await test.step("Click on Target/Destination forecast dropdown and verify only same SBA scenarios are available", async () => {
          // Verify that current SBA scenario IS present in destination dropdown
          const currentScenarioPresent = await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .isScenarioInDestinationDropdown(currentScenario.scenarioDetails.scenarioId);
          
          expect(currentScenarioPresent).toBe(true);
          
          // Close the dropdown after checking current scenario
          await objpageFactory
            .ufmPageFactory()
            .openCurrentForecast()
            .closeDropdown();

          // Verify that scenarios from other SBAs are NOT present in destination dropdown
          for (const otherScenario of otherScenarios) {
            const scenarioNotPresent = await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .isScenarioNotInDestinationDropdown(otherScenario.scenarioDetails.scenarioId);
              
            expect(scenarioNotPresent).toBe(true);
            
            // Close the dropdown after each scenario check
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .closeDropdown();
          }
        });

        await test.step("Close the copy forecast modal", async () => {
          // Try to find and click cancel button to close the modal
          const cancelButton = testPage.locator("//button[contains(text(), 'Cancel') or contains(text(), 'Close')]");
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          } else {
            // If no cancel button, use page object method to close dropdown
            await objpageFactory
              .ufmPageFactory()
              .openCurrentForecast()
              .closeDropdown();
          }

          // Verify modal is closed
          await expect(
            objpageFactory.ufmPageFactory().openCurrentForecast().copyScenarioSourceForecastDropdown
          ).not.toBeVisible();
        });
        });
      }
    });
  }
);
