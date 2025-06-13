import { test} from '@playwright/test';
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from '../fixtures/signinUtility';
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { nodeCrudDialog } from '../testdata/fileName.json';

test.describe(
  'Node CRUD Operations Validation Feature Test',
  { tag: "@Smoke @Regression @NodeCRUDValidation" },
  () => {
    let objpageFactory: PageFactory;
    test.describe.configure({ mode: 'parallel', timeout: TIMEOUT_SSDM_FE });

    test.beforeEach(async ({ page }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
    });

  // 3 test cases for Input node
  test('Create Input Node', async () => {
    await objpageFactory.ssdmPageFactory().nodeCRUDValidation().validateCreateNodeFlow(nodeCrudDialog.dialogHeaders.input);
  });

  test('Edit Input Node', async () => {
    await objpageFactory.ssdmPageFactory().nodeCRUDValidation().validateEditNodeFlow(nodeCrudDialog.dialogHeaders.input);
  });

  test('Delete Input Node', async () => {
    await objpageFactory.ssdmPageFactory().nodeCRUDValidation().validateDeleteNodeFlow(nodeCrudDialog.dialogHeaders.input);
  });

  // 3 test cases for Calculated node
  test('Create Calculated Node', async () => {
    await objpageFactory.ssdmPageFactory().nodeCRUDValidation().validateCreateNodeFlow(nodeCrudDialog.dialogHeaders.calculated);
  });

  test('Edit Calculated Node', async () => {
    await objpageFactory.ssdmPageFactory().nodeCRUDValidation().validateEditNodeFlow(nodeCrudDialog.dialogHeaders.calculated);
  });

  test('Delete Calculated Node', async () => {
    await objpageFactory.ssdmPageFactory().nodeCRUDValidation().validateDeleteNodeFlow(nodeCrudDialog.dialogHeaders.calculated);
  });
})