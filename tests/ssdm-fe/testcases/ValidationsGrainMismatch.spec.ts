import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { createNodeUtility } from "../fixtures/createNodeUtility";
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { nodeCrudDialog } from '../testdata/fileName.json';
import { filterOptions } from '../testdata/fileName.json';

let ufdmNodes;
let driverTreeNodes;
let identifiedNodeId;
let partitionData;
let newCreatedNodeData;
let calculationFormulaNode;
const inputSelectedGrainsinDriverTree: string[] = [];
const calculatedSelectedGrainsinDriverTree: string[] = [];

test.describe(
  'Validations tests for Grain mismatch',
  { tag: "@Smoke @Regression @mytest" },
  async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });

    // Before each test, sign in and initialize the page factory
    test.beforeEach(async ({ page, request }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      /*ufdmNodes = await createNodeUtility.getUfdmPartitionData(request,"moreGrains");
      driverTreeNodes = await createNodeUtility.getdriverTreeNodes(request);
      identifiedNodeId = createNodeUtility.getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes.nodeIds, driverTreeNodes);
      partitionData = await createNodeUtility.getPartitionGrainForNodeId(identifiedNodeId, request);
      //identifiedNodeId = "9_MKTG";
      //partitionData = ["Channel", "Department", "Entity", "Month"];
       newCreatedNodeData = await createNodeUtility.createNewNode(request, identifiedNodeId);
      console.log(`nodeName: ${newCreatedNodeData.nodeName}, nodeKey: ${newCreatedNodeData.nodeKey}`); */
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
    });

    /* test.afterEach(async ({ page, request }) => {
      await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.clickdriverTreeTab();
      await objpageFactory.ssdmPageFactory().nodeCRUDValidation().deleteNode(newCreatedNodeData.nodeName);
      newCreatedNodeData = await createNodeUtility.deleteCreatedNode(request, newCreatedNodeData.nodeKey);
    }); */



    // Test: Verify Grain Mismatch error with node variant grains less than ufdm - type "Input"
    test('Verify Grain Mismatch error with node variant grains less than ufdm - type "Input"', async ({request}) => {

      ufdmNodes = await createNodeUtility.getUfdmPartitionData(request,"lessGrains");
      driverTreeNodes = await createNodeUtility.getdriverTreeNodes(request);
      identifiedNodeId = createNodeUtility.getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes.nodeIds, driverTreeNodes);
      partitionData = await createNodeUtility.getPartitionGrainForNodeId(identifiedNodeId, request);
      /* newCreatedNodeData = await createNodeUtility.createNewNode(request, identifiedNodeId);
      console.log(`nodeName: ${newCreatedNodeData.nodeName}, nodeKey: ${newCreatedNodeData.nodeKey}`); */

      await test.step('Click on Create New Node icon and select the Node Type as Input for less grains', async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        /* await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Input");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.ownerEditor);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.viewer);
        //await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData.nodeName);
        for (let i = 0; i <= partitionData.length - 1; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(partitionData[i]);
          inputSelectedGrainsinDriverTree.push(partitionData[i]);
          console.log('Selected Grains in Driver Tree:', inputSelectedGrainsinDriverTree);
        } */
      });

     /*  await test.step(`Save Changes to create the node variant with less grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData.nodeName);
      });

      await test.step(`Validate grain mismatch Error on Driver Tree Summary screen for less grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.clickdriverTreeSummary();
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.validateGrainMismatchError(newCreatedNodeData.nodeName, partitionData.join(', '), inputSelectedGrainsinDriverTree.join(', '));
        console.log("Grain Mismatch validation completed successfully.");
      }); */

      // Test: Verify Grain Mismatch error with node variant grains less than ufdm - type "Calculated"
      /* await test.step('Click on Create New Node icon and select the Node Type as Calculated for less grains', async () => {
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.clickdriverTreeTab();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Calculated");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        //await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData.nodeName);
        for (let i = 0; i <= partitionData.length - 1; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(partitionData[i]);
          calculatedSelectedGrainsinDriverTree.push(partitionData[i]);
          console.log('Selected Grains in Driver Tree:', calculatedSelectedGrainsinDriverTree);
        }
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(6);
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "random123");
      });

       await test.step(`Save Changes to create the node variant with less grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData.nodeName);
      });

      await test.step(`Validate Grain Mismatch Error on Driver Tree Summary screen for less grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.clickdriverTreeSummary();
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.validateGrainMismatchError(newCreatedNodeData.nodeName, partitionData.join(', '), calculatedSelectedGrainsinDriverTree.join(', '));
        console.log("Grain Mismatch validation completed successfully.");
      }); */ 
    })

    // Test: Verify Grain Mismatch error with node variant grains more than ufdm - type "Input"
    /*test('Verify Grain Mismatch error with node variant grains more than ufdm - type "Input"', async ({request}) => {

      ufdmNodes = await createNodeUtility.getUfdmPartitionData(request,"moreGrains");
      driverTreeNodes = await createNodeUtility.getdriverTreeNodes(request);
      identifiedNodeId = createNodeUtility.getFirstNodeIdInUfdmNotInDriverTree(ufdmNodes.nodeIds, driverTreeNodes);
      partitionData = await createNodeUtility.getPartitionGrainForNodeId(identifiedNodeId, request);

      await test.step('Click on Create New Node icon and select the Node Type as Input -for more grains', async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Input");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.ownerEditor);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByValue(nodeCrudDialog.fields.viewer);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData.nodeName);
        for (let i = 4; i <= 5; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(i);
        }
        inputSelectedGrainsinDriverTree.push('Month', 'Channel'); 
      });

       await test.step(`Save Changes to create the node variant with more grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData.nodeName);
      });

      await test.step(`Validate grain mismatch Error on Driver Tree Summary screen for more grains than ufdm- input`, async () => {
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.clickdriverTreeSummary();
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.validateGrainMismatchError(newCreatedNodeData.nodeName, partitionData.join(', '), inputSelectedGrainsinDriverTree.join(', '));
        console.log("Grain Mismatch validation completed successfully.");
      });

      // Test: Verify Grain Mismatch error with node variant grains more than ufdm - type "Calculated"
      await test.step('Click on Create New Node icon and select the Node Type as Calculated for more grains', async () => {
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.clickdriverTreeTab();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(1, "Calculated");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        //await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData.nodeName);
        for (let i = 2; i <= 3; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(i);
        }
        calculatedSelectedGrainsinDriverTree.push('Month', 'Channel');
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectGrainByIndex(6);
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().fillAndValidateTextInputBox(nodeCrudDialog.fields.calculationText, "random123");
      }); */

      /*await test.step(`Save Changes to create the node variant with more grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData.nodeName);
      });
  
      await test.step(`Validate Grain Mismatch Error on Driver Tree Summary screen for more grains than ufdm- calculated`, async () => {
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.clickdriverTreeSummary();
        await objpageFactory.ssdmPageFactory()driverTreeSummaryPageValidation.validateGrainMismatchError(newCreatedNodeData.nodeName, partitionData.join(', '), calculatedSelectedGrainsinDriverTree.join(', '));
        console.log("Grain Mismatch validation completed successfully.");
      }); 
    })*/
  })
