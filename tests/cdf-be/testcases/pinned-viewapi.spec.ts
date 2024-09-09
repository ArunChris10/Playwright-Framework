import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import debug from 'debug';

test.describe("Verify if user can pinned a view", { tag: "@Smoke @pinnedUnpinnedView" }, () => {
    
    let visualizerPinnedResponse;
    let visualizerUnpinnedResponse;

    test("Verify visualizer-pinned api is working", async ({ request }) => {
        visualizerPinnedResponse = await VisualizerUtility.pinnedView(request);
        // Assertion
        expect(visualizerPinnedResponse).toBeOK();

        // Extracting the response body
        let visualizerPinnedResponseBody = await visualizerPinnedResponse.json();
        debug.log(JSON.stringify(visualizerPinnedResponseBody));

        expect(visualizerPinnedResponseBody.isPinned).toEqual(true);
    })

    test("Verify visualizer-unpinned api is working", async ({ request }) => {
        visualizerUnpinnedResponse = await VisualizerUtility.unpinnedView(request);

        // Assertion
        expect(visualizerUnpinnedResponse).toBeOK();

        // Extracting the response body
        let visualizerUnpinnedResponseBody = await visualizerUnpinnedResponse.json();
        debug.log(JSON.stringify(visualizerUnpinnedResponseBody));

        expect(visualizerUnpinnedResponseBody.isPinned).toEqual(false);
    })
})