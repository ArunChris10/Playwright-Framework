import { test } from '../../common/fixtures/test-hook';
import { PageFactory } from '../../common/pages/page-factory';

test.describe('Verify if AOP scenario is available in admin menu', { tag: "@Smoke @OpenAOP" }, async () => {
    let objpageFactory: PageFactory;

    test.beforeAll(async ({ pageFactory }) => {
        objpageFactory = pageFactory;
    });

    test('Verify if AOP scenario is available in admin menu', { tag: "@OpenAOP" }, async ({ page }) => {
        await objpageFactory.ufmPageFactory().organisationSelection().navigate();
        await objpageFactory.ufmPageFactory().dataScienceReviewPage().navigateToAOP();
    });
});