import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { createNodeUtility } from "../fixtures/createNodeUtility";
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { nodeCrudDialog } from '../testdata/fileName.json';

let ufdmNodes;
let driverTreeNodes;
let identifiedNodeId;
let partitionData;
let newCreatedNodeData;
let newCreatedNodeData_less_Input;
let newCreatedNodeData_more_Input;
let newCreatedNodeData_less_Calculated;
let newCreatedNodeData_more_Calculated
const inputSelectedGrainsinDriverTree: string[] = [];
const calculatedSelectedGrainsinDriverTree: string[] = [];

test.describe(
  'Validations tests for Grain mismatch- type Input',
  { tag: "@Smoke @Regression @mytest" },
  async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });

    // Before each test, sign in and initialize the page factory
    test.beforeEach(async ({ page, request }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
    });

    test.afterEach(async ({ page, request }, testInfo) => {
      await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeTab();
      const nodeData_more_Input = (testInfo as any).newCreatedNodeData_more_Input;
      const nodeData_less_Input = (testInfo as any).newCreatedNodeData_less_Input;
      if (nodeData_more_Input) {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().deleteNode(newCreatedNodeData_more_Input.nodeName);
        await createNodeUtility.deleteCreatedNode(request, newCreatedNodeData_more_Input.nodeKey);
      }
      if (nodeData_less_Input) {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().deleteNode(newCreatedNodeData_less_Input.nodeName);
        await createNodeUtility.deleteCreatedNode(request, newCreatedNodeData_less_Input.nodeKey);
      }
    });

    // Test: Verify Grain Mismatch error with node variant grains less than ufdm - type "Input"
    test('Verify Grain Mismatch error with node variant grains less than ufdm - type "Input"', async ({ request }, testInfo) => {

      await test.step('Setup data- create node for less grains_Input', async () => {
        ufdmNodes = await createNodeUtility.getUfdmPartitionData(request, "lessGrains");
        driverTreeNodes = await createNodeUtility.getdriverTreeNodes(request);
        identifiedNodeId = createNodeUtility.getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes.nodeIds, driverTreeNodes);
        partitionData = await createNodeUtility.getPartitionGrainForNodeId(identifiedNodeId, request);
        newCreatedNodeData_less_Input = await createNodeUtility.createNewNode(request, identifiedNodeId);
        (testInfo as any).newCreatedNodeData_less_Input = newCreatedNodeData_less_Input;
        console.log(`nodeName: ${newCreatedNodeData_less_Input.nodeName}, nodeKey: ${newCreatedNodeData_less_Input.nodeKey}`);
      });

      await test.step('Click on Create New Node icon and select the Node Type as Input for less grains', async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Input");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.ownerEditor);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.viewer);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData_less_Input.nodeName);
        for (let i = 0; i <= partitionData.length - 2; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(partitionData[i]);
          inputSelectedGrainsinDriverTree.push(partitionData[i]);
        }
        inputSelectedGrainsinDriverTree.sort((a, b) => a.localeCompare(b));
        console.log('Selected Grains in Driver Tree:', inputSelectedGrainsinDriverTree);
      });

      await test.step(`Save Changes to create the node variant with less grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData_less_Input.nodeName);
      });

      await test.step(`Validate grain mismatch Error on Driver Tree Summary screen for less grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeSummary();
        let sortedPartitionData = partitionData.sort((a, b) => a.localeCompare(b));
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().validateGrainMismatchError(identifiedNodeId, inputSelectedGrainsinDriverTree.join(', '), sortedPartitionData.join(', '),);
        console.log("Grain Mismatch validation completed successfully.");
      });
    });


    // Test: Verify Grain Mismatch error with node variant grains more than ufdm - type "Input"
    test('Verify Grain Mismatch error with node variant grains more than ufdm - type "Input"', async ({ request }, testInfo) => {

      ufdmNodes = await createNodeUtility.getUfdmPartitionData(request, "moreGrains");
      driverTreeNodes = await createNodeUtility.getdriverTreeNodes(request);
      identifiedNodeId = createNodeUtility.getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes.nodeIds, driverTreeNodes);
      partitionData = await createNodeUtility.getPartitionGrainForNodeId(identifiedNodeId, request);
      newCreatedNodeData_more_Input = await createNodeUtility.createNewNode(request, identifiedNodeId);
      (testInfo as any).newCreatedNodeData_more_Input = newCreatedNodeData_more_Input;
      console.log(`nodeName: ${newCreatedNodeData_more_Input.nodeName}, nodeKey: ${newCreatedNodeData_more_Input.nodeKey}`);

      await test.step('Click on Create New Node icon and select the Node Type as Input -for more grains', async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Input");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.ownerEditor);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.viewer);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData_more_Input.nodeName);
        for (let i = 4; i <= 5; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(i);
        }
        calculatedSelectedGrainsinDriverTree.push('Channel', 'Month');
      });

      await test.step(`Save Changes to create the node variant with more grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData_more_Input.nodeName);
      });

      await test.step(`Validate grain mismatch Error on Driver Tree Summary screen for more grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeSummary();
        let sortedPartitionData = partitionData.sort((a, b) => a.localeCompare(b));
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().validateGrainMismatchError(identifiedNodeId, inputSelectedGrainsinDriverTree.join(', '), sortedPartitionData.join(', '),);
        console.log("Grain Mismatch validation completed successfully.");
      });
    });
  });

test.describe(
  'Validations tests for Grain mismatch- type Calculated',
  { tag: "@Smoke @Regression @mytest" },
  async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });

    // Before each test, sign in and initialize the page factory
    test.beforeEach(async ({ page, request }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
    });

    test.afterEach(async ({ page, request }, testInfo) => {
      await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeTab();
      const nodeData_more_Calculated = (testInfo as any).newCreatedNodeData_more_Calculated;
      const nodeData_less_Calculated = (testInfo as any).newCreatedNodeData_less_Calculated;
      if (nodeData_more_Calculated) {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().deleteNode(newCreatedNodeData_more_Calculated.nodeName);
        await createNodeUtility.deleteCreatedNode(request, newCreatedNodeData_more_Calculated.nodeKey);
      }
      if (nodeData_less_Calculated) {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().deleteNode(newCreatedNodeData_less_Calculated.nodeName);
        await createNodeUtility.deleteCreatedNode(request, newCreatedNodeData_less_Calculated.nodeKey);
      }
    });

    // Test: Verify Grain Mismatch error with node variant grains less than ufdm - type "Calculated"
    test('Verify Grain Mismatch error with node variant grains less than ufdm - type "Calculated"', async ({ request }, testInfo) => {

      await test.step('Setup data- create node for less grains_Calculated', async () => {
        ufdmNodes = await createNodeUtility.getUfdmPartitionData(request, "lessGrains");
        driverTreeNodes = await createNodeUtility.getdriverTreeNodes(request);
        identifiedNodeId = createNodeUtility.getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes.nodeIds, driverTreeNodes);
        partitionData = await createNodeUtility.getPartitionGrainForNodeId(identifiedNodeId, request);
        newCreatedNodeData_less_Calculated = await createNodeUtility.createNewNode(request, identifiedNodeId);
        (testInfo as any).newCreatedNodeData_less_Calculated = newCreatedNodeData_less_Calculated;
        console.log(`nodeName: ${newCreatedNodeData_less_Calculated.nodeName}, nodeKey: ${newCreatedNodeData_less_Calculated.nodeKey}`);
      });

      // Test: Verify Grain Mismatch error with node variant grains less than ufdm - type "Calculated"
      await test.step('Click on Create New Node icon and select the Node Type as Calculated for less grains', async () => {
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeTab();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Calculated");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData_less_Calculated.nodeName);
        for (let i = 0; i <= partitionData.length - 2; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(partitionData[i]);
          calculatedSelectedGrainsinDriverTree.push(partitionData[i]);
        }
        calculatedSelectedGrainsinDriverTree.sort((a, b) => a.localeCompare(b));
        console.log('Selected Grains in Driver Tree:', calculatedSelectedGrainsinDriverTree);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(6);
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "random123");
      });

      await test.step(`Save Changes to create the node variant with less grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData_less_Calculated.nodeName);
      });

      await test.step(`Validate Grain Mismatch Error on Driver Tree Summary screen for less grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeSummary();
        let sortedPartitionData = partitionData.sort((a, b) => a.localeCompare(b));
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().validateGrainMismatchError(identifiedNodeId, calculatedSelectedGrainsinDriverTree.join(', '), sortedPartitionData.join(', '));
        console.log("Grain Mismatch validation completed successfully.");
      });
    })

    // Test: Verify Grain Mismatch error with node variant grains more than ufdm - type "Calculated"
    test('Verify Grain Mismatch error with node variant grains more than ufdm - type "Calculated"', async ({ request }, testInfo) => {

      await test.step('Setup data- create node for less grains_Calculated', async () => {
        ufdmNodes = await createNodeUtility.getUfdmPartitionData(request, "moreGrains");
        driverTreeNodes = await createNodeUtility.getdriverTreeNodes(request);
        identifiedNodeId = createNodeUtility.getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes.nodeIds, driverTreeNodes);
        partitionData = await createNodeUtility.getPartitionGrainForNodeId(identifiedNodeId, request);
        newCreatedNodeData_more_Calculated = await createNodeUtility.createNewNode(request, identifiedNodeId);
        (testInfo as any).newCreatedNodeData_more_Calculated = newCreatedNodeData_more_Calculated;
        console.log(`nodeName: ${newCreatedNodeData_more_Calculated.nodeName}, nodeKey: ${newCreatedNodeData_more_Calculated.nodeKey}`);
      });

      await test.step('Click on Create New Node icon and select the Node Type as Calculated for more grains', async () => {
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeTab();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Calculated");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData_more_Calculated.nodeName);
        for (let i = 2; i <= 3; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(i);
        }
        calculatedSelectedGrainsinDriverTree.push('Channel', 'Month');
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(6);
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "random123");
      });


      await test.step(`Save Changes to create the node variant with more grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData_more_Calculated.nodeName);
      });

      await test.step(`Validate Grain Mismatch Error on Driver Tree Summary screen for more grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().clickdriverTreeSummary();
        let sortedPartitionData = partitionData.sort((a, b) => a.localeCompare(b));
        await objpageFactory.ssdmPageFactory().driverTreeSummaryPageValidation().validateGrainMismatchError(identifiedNodeId, calculatedSelectedGrainsinDriverTree.join(', '), sortedPartitionData.join(', '));
        console.log("Grain Mismatch validation completed successfully.");
      });
    })
  })
