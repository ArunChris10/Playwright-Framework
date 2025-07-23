import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { signinUtility } from "../fixtures/signinUtility";
import { parentChildNodeUtility } from "../fixtures/parentChildNodeUtility";
import { TIMEOUT_SSDM_FE } from '../constants/timeout.json';
import { request } from "http";
import { treeView } from '../testdata/fileName.json';


let defaultViewParentNodes;
test.describe(
  'Validate functionality of tree view on landing page',
  { tag: "@Smoke @Regression @TreeViewValidation" },
  async () => {
    let objpageFactory: PageFactory;
    let parentChildRelationresponse: any;
    test.describe.configure({ mode: 'parallel', timeout: 20000 });

    // Before each test, sign in and initialize the page factory
    test.beforeEach(async ({ request, page }) => {
      test.setTimeout(TIMEOUT_SSDM_FE);
      await signinUtility.SignIn(page);
      objpageFactory = new PageFactory(page);
      parentChildRelationresponse = await parentChildNodeUtility.getNodeVariantResponse(request);
      await objpageFactory.ssdmPageFactory().treeViewPage().switchToTreeView();
      defaultViewParentNodes = await objpageFactory.ssdmPageFactory().treeViewPage().validateDefaultViewParentNodes(treeView.defaultViewParentNodes);
    });

    // After each test, close only the page to ensure clean up
    test.afterEach(async ({ page }) => {
      try {
        await page.close();
      } catch (e) { }
    });

    test('Verify child nodes of default parent nodes of driver tree', async () => {
      for (const parentNode of defaultViewParentNodes) {
        const childrenFromAPI = await parentChildNodeUtility.getChildNodeForSelectedParent(parentChildRelationresponse, parentNode);
        const sortedChildrenFromAPI = childrenFromAPI.sort((a, b) => (a < b ? 1 : -1));
        console.log(`Sorted children (Descending) for parent ${parentNode}:`, sortedChildrenFromAPI);
        const childrenFromUI = await objpageFactory.ssdmPageFactory().treeViewPage().getChildrenOfParentNode(parentNode);
        await objpageFactory.ssdmPageFactory().treeViewPage().validateChildrenNodes(childrenFromUI, sortedChildrenFromAPI);
      }
    });

    test('Verify Search works for full match and selected record is displayed in Right pane', async () => {
      const firstChildForSearch = await parentChildNodeUtility.getChildNodeForSelectedParent(parentChildRelationresponse, defaultViewParentNodes[0]);
      await objpageFactory.ssdmPageFactory().treeViewPage().validateFullMatchSearchForTreeView(defaultViewParentNodes[0], firstChildForSearch[0]);
      await objpageFactory.ssdmPageFactory().treeViewPage().validateClearingSearchRevertsToDefault(treeView.defaultViewParentNodes);
    });


    test('Verify Search works for partial match and selected record is displayed in Right pane', async () => {
      const randomIndex = Math.floor(Math.random() * defaultViewParentNodes.length);
      const firstChildForSearch = await parentChildNodeUtility.getChildNodeForSelectedParent(parentChildRelationresponse, defaultViewParentNodes[randomIndex]);
      const partialSearchString = firstChildForSearch[0].slice(-7);
      await objpageFactory.ssdmPageFactory().treeViewPage().validatePartialMatchSearchForTreeView(partialSearchString);
      await objpageFactory.ssdmPageFactory().treeViewPage().validateClearingSearchRevertsToDefault(treeView.defaultViewParentNodes);
    });

    test('Verify Expand All and Collapse All works on click', async () => {
      const allChildrenFromAPI: any[] = [];
      for (const parentNode of defaultViewParentNodes) {
        const childrenFromAPI = await parentChildNodeUtility.getChildNodeForSelectedParent(parentChildRelationresponse, parentNode);
        allChildrenFromAPI.push(...childrenFromAPI);
      }
      let expandedlevelOneChildNodes = await objpageFactory.ssdmPageFactory().treeViewPage().validateAndGetLevelOneChildNodesOnExpandAll(defaultViewParentNodes,allChildrenFromAPI);
      await objpageFactory.ssdmPageFactory().treeViewPage().validateCollapseAll(treeView.defaultViewParentNodes);
    });

    test('Verify column Search and Sort works in grid view of tree view', async () => {
      await objpageFactory.ssdmPageFactory().treeViewPage().clickSearchedNodeToView(treeView.SearchForColumnSortAndFilter[0]);
      await objpageFactory.ssdmPageFactory().treeViewPage().validateColumnLevelSort(treeView.treeviewAllColumns);
      await objpageFactory.ssdmPageFactory().treeViewPage().validateFilteredRecords(treeView.filterColumns);
    });

  }
);