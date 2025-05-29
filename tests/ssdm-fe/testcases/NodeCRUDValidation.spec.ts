import { test, expect } from '@playwright/test';
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from '../fixtures/signinUtility';
import { Logger } from '../../common/fixtures/logger-utils';
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';

test.describe('Node CRUD Validation', () => {
  let objpageFactory: PageFactory;

  test.beforeEach(async ({ page }) => {
    test.setTimeout(TIMEOUT_SSDM_FE);
    await signinUtility.SignIn(page);
    objpageFactory = new PageFactory(page);
  });

  test('Create a new node', async () => {
    await test.step('Open node creation dialog', async () => {
      await objpageFactory.ssdmPageFactory().nodePage().openCreateNodeDialog();
    });
    await test.step('Fill node details and save', async () => {
      await objpageFactory.ssdmPageFactory().nodePage().fillNodeDetails({ name: 'Test Node', description: 'Node for CRUD test' });
      await objpageFactory.ssdmPageFactory().nodePage().saveNode();
    });
    await test.step('Verify node is created', async () => {
      const nodeExists = await objpageFactory.ssdmPageFactory().nodePage().isNodePresent('Test Node');
      expect(nodeExists).toBeTruthy();
      Logger.log('Node created successfully.');
    });
  });

  test('Edit an existing node', async () => {
    await test.step('Open node edit dialog', async () => {
      await objpageFactory.ssdmPageFactory().nodePage().openEditNodeDialog('Test Node');
    });
    await test.step('Update node details and save', async () => {
      await objpageFactory.ssdmPageFactory().nodePage().fillNodeDetails({ name: 'Test Node Edited', description: 'Node edited for CRUD test' });
      await objpageFactory.ssdmPageFactory().nodePage().saveNode();
    });
    await test.step('Verify node is updated', async () => {
      const nodeExists = await objpageFactory.ssdmPageFactory().nodePage().isNodePresent('Test Node Edited');
      expect(nodeExists).toBeTruthy();
      Logger.log('Node edited successfully.');
    });
  });

  test('Delete a node', async () => {
    await test.step('Open node delete dialog', async () => {
      await objpageFactory.ssdmPageFactory().nodePage().openDeleteNodeDialog('Test Node Edited');
    });
    await test.step('Confirm node deletion', async () => {
      await objpageFactory.ssdmPageFactory().nodePage().confirmDeleteNode();
    });
    await test.step('Verify node is deleted', async () => {
      const nodeExists = await objpageFactory.ssdmPageFactory().nodePage().isNodePresent('Test Node Edited');
      expect(nodeExists).toBeFalsy();
      Logger.log('Node deleted successfully.');
    });
  });
});