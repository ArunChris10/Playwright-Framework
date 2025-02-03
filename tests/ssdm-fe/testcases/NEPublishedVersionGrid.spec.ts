import path from "path";
import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Node Edge Grid Test', { tag: "@Smoke @nodeEdgeGridFunctionality" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify user is able to see all the previously published NE versions On SSDM home page', { tag: "@nodeEdgeGridFunctionality" }, async () => {
        test.setTimeout(TIMEOUT);
        const expectedFilePath = path.join(__dirname, testData.filePath);


        await test.step('User Navigates to SSDM home page', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();

        });

        await test.step('User can see details for latest ten previously published NE versions in the grid', async () => {
            await objpageFactory.ssdmPageFactory().nodeEdgeGrid().visibiltyOfNodeEdgeGrid();
            await objpageFactory.ssdmPageFactory().nodeEdgeGrid().noOfPublishVersions();
            await objpageFactory.ssdmPageFactory().nodeEdgeGrid().visibiltyOfPublishedNodeEdgeDetails();

        });

        await test.step('User can see and download prevously published NE versions from the grid', async () => {
            const path = await objpageFactory.ssdmPageFactory().nodeEdgeGrid().verifyFileDownloaded();

        });

    })
})