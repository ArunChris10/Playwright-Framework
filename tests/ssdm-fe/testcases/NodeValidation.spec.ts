import { test } from '@playwright/test';
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from '../fixtures/signinUtility';
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { nodeCrudDialog } from '../testdata/fileName.json';

test.describe(
  'Node CRUD Operations Validation Feature Test',
  { tag: "@Smoke @Regression @NodeValidations" },
  () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: TIMEOUT_SSDM_FE });

    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
    });

    // Aggregation formula validation scenarios for create input node
    test('Create Input Node: Aggregation - selected nodes + number/function/formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 1);
    });

    test('Create Input Node: Aggregation - only a selected node from autosuggestions', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 2);
    });

    test('Create Input Node: Aggregation - only a number or function or formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 3);
    });

    test('Create Input Node: Aggregation - # followed by less than three characters', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 4);
    });

    test('Create Input Node: Aggregation - field empty or cleared', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 5);
    });

    // Aggregation formula validation scenarios for edit input node
    test('Edit Input Node: Aggregation - selected nodes + number/function/formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 1, false);
    });

    test('Edit Input Node: Aggregation - only a selected node from autosuggestions', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 2, false);
    });

    test('Edit Input Node: Aggregation - only a number or function or formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 3, false);
    });

    test('Edit Input Node: Aggregation - # followed by less than three characters', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 4, false);
    });

    test('Edit Input Node: Aggregation - field empty or cleared', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 5, false);
    });

    // Aggregation formula validation scenarios for create calculated node
    test('Create Calculated Node: Aggregation - selected nodes + number/function/formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 1);
    });

    test('Create Calculated Node: Aggregation - only a selected node from autosuggestions', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 2);
    });

    test('Create Calculated Node: Aggregation - only a number or function or formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 3);
    });

    test('Create Calculated Node: Aggregation - # followed by less than three characters', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 4);
    });

    test('Create Calculated Node: Aggregation - field empty or cleared', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 5);
    });

    // Aggregation formula validation scenarios for edit calculated node
    test('Edit Calculated Node: Aggregation - selected nodes + number/function/formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 1, false);
    });

    test('Edit Calculated Node: Aggregation - only a selected node from autosuggestions', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 2, false);
    });

    test('Edit Calculated Node: Aggregation - only a number or function or formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 3, false);
    });

    test('Edit Calculated Node: Aggregation - # followed by less than three characters', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 4, false);
    });

    test('Edit Calculated Node: Aggregation - field empty or cleared', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 5, false);
    });

    // Calculation formula validation scenarios for create calculated node
    test('Create Calculated Node: Calculation - selected nodes + number/function/formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(1);
    });

    test('Create Calculated Node: Calculation - only a selected node from autosuggestions', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(2);
    });

    test('Create Calculated Node: Calculation - only a number or function or formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(3);
    });

    test('Create Calculated Node: Calculation - # followed by less than three characters', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(4);
    });

    test('Create Calculated Node: Calculation - field empty or cleared', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(5);
    });

    // Calculation formula validation scenarios for edit calculated node
    test('Edit Calculated Node: Calculation - selected nodes + number/function/formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(1, false);
    });

    test('Edit Calculated Node: Calculation - only a selected node from autosuggestions', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(2, false);
    });

    test('Edit Calculated Node: Calculation - only a number or function or formula', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(3, false);
    });

    test('Edit Calculated Node: Calculation - # followed by less than three characters', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(4, false);
    });

    test('Edit Calculated Node: Calculation - field empty or cleared', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(5, false);
    });

    // Orphan node validation scenario
    test('Driver Tree Summary: Orphan nodes are present', async () => {
      await objpageFactory
        .ssdmPageFactory()
        .driverTreeSummaryPageValidation()
        .validateOrphanNodePresence();
    });
  }
);