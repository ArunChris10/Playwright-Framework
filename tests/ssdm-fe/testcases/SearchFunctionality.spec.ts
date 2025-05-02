import path from "path";
import { test, expect} from "../../common/fixtures/test-hook";
import { PageFactory } from '../../common/pages/page-factory';
import { testData } from '../testdata/fileName.json';
import { TIMEOUT } from '../constants/timeout.json';


test.describe('Search Feature Test', { tag: "@Smoke @Regression @searchFunctionality" },async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
            objpageFactory = pageFactory;
            await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        })
test('Check if the search functionality is working fine', async()=>{
    test.step('Check if the search works with the complete metric name', async () => {
        
        test.setTimeout(TIMEOUT);

    })
    test.step('Check if the search works with the partial metric name', async () => {
        
        test.setTimeout(TIMEOUT);

    })
    test.step('Check if the search response on incorrect metric name', async () => {
        
        test.setTimeout(TIMEOUT);

    })
});
});