import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import debug from 'debug';

test.describe("Verify if user can see list of all saved views", { tag: "@Smoke @updateView" }, () => {
    
    let visualizerViewsOrderResponse;

    test("Verify visualizer-update-views-order api is working", async ({ request }) => {
        visualizerViewsOrderResponse = await VisualizerUtility.updateViewsOrder(request);
        // Assertion
        expect(visualizerViewsOrderResponse).toBeOK();

        // Extracting the response body
        let visualizerViewsOrderResponseBody = await visualizerViewsOrderResponse.json();
        debug.log(JSON.stringify(visualizerViewsOrderResponseBody));

        expect(visualizerViewsOrderResponseBody.visualizerViewList[0].applicationId).toEqual(1);
    })
})