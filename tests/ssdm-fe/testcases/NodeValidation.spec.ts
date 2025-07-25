import { test } from '@playwright/test';
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from '../fixtures/signinUtility';
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { nodeCrudDialog } from '../testdata/fileName.json';

test.describe(
  'Node CRUD Operations Validation Feature Test',
  { tag: "@Smoke @Regression @NodeValidation" },
  () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: TIMEOUT_SSDM_FE });

    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
    });

    // Aggregation formula validation scenarios for create input node
    test('Create Input Node: Aggregation - selected nodes + number/function/formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 1);
    });

    test('Create Input Node: Aggregation - only a selected node from autosuggestions', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 2);
    });

    test('Create Input Node: Aggregation - only a number or function or formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 3);
    });

    test('Create Input Node: Aggregation - # followed by less than three characters', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 4);
    });

    test('Create Input Node: Aggregation - field empty or cleared', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 5);
    });

    // Aggregation formula validation scenarios for edit input node
    test('Edit Input Node: Aggregation - selected nodes + number/function/formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 1, false);
    });

    test('Edit Input Node: Aggregation - only a selected node from autosuggestions', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 2, false);
    });

    test('Edit Input Node: Aggregation - only a number or function or formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 3, false);
    });

    test('Edit Input Node: Aggregation - # followed by less than three characters', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 4, false);
    });

    test('Edit Input Node: Aggregation - field empty or cleared', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.input, 5, false);
    });

    // Aggregation formula validation scenarios for create calculated node
    test('Create Calculated Node: Aggregation - selected nodes + number/function/formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 1);
    });

    test('Create Calculated Node: Aggregation - only a selected node from autosuggestions', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 2);
    });

    test('Create Calculated Node: Aggregation - only a number or function or formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 3);
    });

    test('Create Calculated Node: Aggregation - # followed by less than three characters', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 4);
    });

    test('Create Calculated Node: Aggregation - field empty or cleared', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 5);
    });

    // Aggregation formula validation scenarios for edit calculated node
    test('Edit Calculated Node: Aggregation - selected nodes + number/function/formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 1, false);
    });

    test('Edit Calculated Node: Aggregation - only a selected node from autosuggestions', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 2, false);
    });

    test('Edit Calculated Node: Aggregation - only a number or function or formula', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 3, false);
    });

    test('Edit Calculated Node: Aggregation - # followed by less than three characters', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 4, false);
    });

    test('Edit Calculated Node: Aggregation - field empty or cleared', { tag: "@AggregationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateAggregationFormulaScenario(nodeCrudDialog.dialogHeaders.calculated, 5, false);
    });

    // Calculation formula validation scenarios for create calculated node
    test('Create Calculated Node: Calculation - selected nodes + number/function/formula', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(1);
    });

    test('Create Calculated Node: Calculation - only a selected node from autosuggestions', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(2);
    });

    test('Create Calculated Node: Calculation - only a number or function or formula', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(3);
    });

    test('Create Calculated Node: Calculation - # followed by less than three characters', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(4);
    });

    test('Create Calculated Node: Calculation - field empty or cleared', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(5);
    });

    // Calculation formula validation scenarios for edit calculated node
    test('Edit Calculated Node: Calculation - selected nodes + number/function/formula', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(1, false);
    });

    test('Edit Calculated Node: Calculation - only a selected node from autosuggestions', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(2, false);
    });

    test('Edit Calculated Node: Calculation - only a number or function or formula', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(3, false);
    });

    test('Edit Calculated Node: Calculation - # followed by less than three characters', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(4, false);
    });

    test('Edit Calculated Node: Calculation - field empty or cleared', { tag: "@CalculationValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaScenario(5, false);
    });

    // Orphan node validation scenario
    test('Driver Tree Summary: Orphan nodes are present', { tag: "@OrphanNodeValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .driverTreeSummaryPageValidation()
        .validateOrphanNodePresence();
    });

    // --- Parent Child Granularity Mismatch Validations ---
    test('Calculated Node Create - Calc Formula: Child node granularity matches parent', { tag: "@GranularityValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateParentChildGranularity('Calculated', 'calculationText', true);
    });

    test('Calculated Node Create - Aggr Formula: Child node granularity matches parent', { tag: "@GranularityValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateParentChildGranularity('Calculated', 'aggregationText', true);
    });

    test('Input Node Create - Aggr Formula: Child node granularity matches parent', { tag: "@GranularityValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateParentChildGranularity('Input', 'aggregationText', true);
    });

    test('Calculated Node Edit - Calc Formula: Child node granularity matches parent', { tag: "@GranularityValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateParentChildGranularity('Calculated', 'calculationText', false);
    });

    test('Calculated Node Edit - Aggr Formula: Child node granularity matches parent', { tag: "@GranularityValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateParentChildGranularity('Calculated', 'aggregationText', false);
    });

    test('Input Node Edit - Aggr Formula: Child node granularity matches parent', { tag: "@GranularityValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateParentChildGranularity('Input', 'aggregationText', false);
    });

    // --- Owner Field Mandatory Validations ---
    test('Input Node Create: Owner field mandatory', { tag: "@OwnerFieldValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateOwnerFieldMandatory(true);
    });

    test('Input Node Edit: Owner field mandatory', { tag: "@OwnerFieldValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateOwnerFieldMandatory(false);
    });

    // --- Calculation Formula Mandatory Validations ---
    test('Calculated Node Create: Calculation formula mandatory', { tag: "@CalculationFormulaMandatory" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaMandatory(true);
    });

    test('Calculated Node Edit: Calculation formula mandatory', { tag: "@CalculationFormulaMandatory" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCalculationFormulaMandatory(false);
    });

    // --- Causal Function Validations ---
    test('Calculated Node Create - Calc Formula: Only valid node variants if causal function not selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionNodeVariants('calculationText', true);
    });

    test('Calculated Node Create - Aggr Formula: Only valid node variants if causal function not selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionNodeVariants('aggregationText', true);
    });

    test('Calculated Node Edit - Calc Formula: Only valid node variants if causal function not selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionNodeVariants('calculationText', false);
    });

    test('Calculated Node Edit - Aggr Formula: Only valid node variants if causal function not selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionNodeVariants('aggregationText', false);
    });

    test('Calculated Node Create - Calc Formula: Free text if causal function selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionFreeText('calculationText', true);
    });

    test('Calculated Node Create - Aggr Formula: Free text if causal function selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionFreeText('aggregationText', true);
    });

    test('Calculated Node Edit - Calc Formula: Free text if causal function selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionFreeText('calculationText', false);
    });

    test('Calculated Node Edit - Aggr Formula: Free text if causal function selected', { tag: "@CausalFunctionValidation" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionFreeText('aggregationText', false);
    });

    // --- Invalid Node Variant Validations ---
    test('Calculated Node Create - Calc Formula: Error for invalid node variant if causal function not selected', { tag: "@InvalidNodeVariant" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionInvalidNodeVariant('calculationText', true);
    });

    test('Calculated Node Create - Aggr Formula: Error for invalid node variant if causal function not selected', { tag: "@InvalidNodeVariant" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionInvalidNodeVariant('aggregationText', true);
    });

    test('Calculated Node Edit - Calc Formula: Error for invalid node variant if causal function not selected', { tag: "@InvalidNodeVariant" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionInvalidNodeVariant('calculationText', false);
    });

    test('Calculated Node Edit - Aggr Formula: Error for invalid node variant if causal function not selected', { tag: "@InvalidNodeVariant" }, async () => {
      await objpageFactory
        .ssdmPageFactory()
        .nodeCRUDValidation()
        .validateCausalFunctionInvalidNodeVariant('aggregationText', false);
    });
  }
);