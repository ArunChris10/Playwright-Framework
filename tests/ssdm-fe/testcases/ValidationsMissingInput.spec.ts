import { test } from "../../common/fixtures/test-hook";
import { expect } from "@playwright/test";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { createNodeUtility } from "../fixtures/createNodeUtility";
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { nodeCrudDialog } from '../testdata/fileName.json';
import { filterOptions } from '../testdata/fileName.json';

let newNodeKey;
let partitionData;
let newCreatedNodeData;

test.describe(
  'Validations tests for Missing Input',
  { tag: "@Smoke @Regression @MissingInputValidations" },
  async () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });

    // Before each test, sign in and initialize the page factory
    test.beforeEach(async ({ page, request }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      partitionData = await createNodeUtility.getUfdmPartitionData(request);
      console.log(`NodeId: ${partitionData.nodeId}, partitionGrain: ${partitionData.partitionGrain}`);
      newCreatedNodeData = await createNodeUtility.createNewNode(request);
      console.log(`nodeName: ${newCreatedNodeData.nodeName}, nodeKey: ${newCreatedNodeData.nodeKey}`);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);

    });

    test.afterEach(async ({ page, request }) => {
      await objpageFactory.ssdmPageFactory().driverTreeSummary().clickdriverTreeTab();
      await objpageFactory.ssdmPageFactory().nodeCRUDValidation().deleteNode(newCreatedNodeData.nodeName);
      newCreatedNodeData = await createNodeUtility.deleteCreatedNode(request, newCreatedNodeData.nodeKey);
    });



    // Test: Verify Input missing error for New Node Variant creation from landing page - type "Input"
    test('Verify Input missing error for New Node Variant creation - Input Type', async () => {

      await test.step('Click on Create New Node icon and select the Node Type as Input', async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectMandatoryDropdownValues(1, "Input");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData.nodeName);
        for (let i = 2; i <= 7; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectMandatoryDropdownValues(i);
        }
      });

      await test.step(`Validate Field level errors`, async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().validateMissingInputMessage();
      });

      await test.step(`Save Changes to create the node variant`, async () => {
        await objpageFactory.ssdmPageFactory().nodeCRUDValidation().saveCreateNodeFlow(newCreatedNodeData.nodeName);
      });

      await test.step(`Validate Missing Input Error on Driver Tree Summary screen`, async () => {
        await objpageFactory.ssdmPageFactory().driverTreeSummary().clickdriverTreeSummary();
        await objpageFactory.ssdmPageFactory().driverTreeSummary().validateMissingInputError(newCreatedNodeData.nodeName)
      });
    })


    // Test: Verify Input missing error for New Node Variant creation from landing page - type Calculated
    test('Verify Input missing error for New Node Variant creation - Calculated Type', async () => {

      await test.step('Click on Create New Node icon and select the Node Type as Calculated', async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().clickNewNodeButton();
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectMandatoryDropdownValues(1, "Calculated");
        await objpageFactory.ssdmPageFactory().createNewNodeModal().page.waitForTimeout(2000);
        await objpageFactory.ssdmPageFactory().createNewNodeModal().selectCreatedNode(nodeCrudDialog.fields.metricName, newCreatedNodeData.nodeName);
        for (let i = 2; i <= 6; i++) {
          await objpageFactory.ssdmPageFactory().createNewNodeModal().selectMandatoryDropdownValues(i);
        }
      });

      await test.step(`Validate Field level errors`, async () => {
        await objpageFactory.ssdmPageFactory().createNewNodeModal().validateNoMissingInputMessage();
      });
    });
  })
