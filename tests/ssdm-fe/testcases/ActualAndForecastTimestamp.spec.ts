import { test } from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Visibility Of Actual And Forecast Timestamp Of Selected Dataset', { tag: "@Smoke @timestampVisibility" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
    })

    test('Verify user is able to see actual and forecast timestamp of the picked dataset On SSDM home page', { tag: "@timestampVisibility" }, async () => {
        test.setTimeout(TIMEOUT);

        await test.step('User validates the NE file', async () => {
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnAdminTab();
            await objpageFactory.ssdmPageFactory().uploadFile().clickOnSSDM();
        });

        await test.step('User selects dataset of choice', async () => {
            await objpageFactory.ssdmPageFactory().pickDataset().clickOnToggle();

        });

        await test.step('User can see actual and forecast timestamp of the corresponding selected dataset', async () => {
            await objpageFactory.ssdmPageFactory().viewTimestamp().visibilityOfTimestamp();

        });

    });
});