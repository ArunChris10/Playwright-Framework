import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import debug from 'debug';

test.describe("Verify if super user can publish a view to current demand", { tag: "@Smoke @publishToCurrentDemand" }, () => {
    
    let visualizerSaveDataResponse;

    test("Verify visualizer-save api is working", async ({ request }) => {
        visualizerSaveDataResponse = await VisualizerUtility.visualizerSave(request);

        // Assertion
        expect(visualizerSaveDataResponse).toBeOK();

        // Extracting the response body
        let visualizerSaveDataResponseBody = await visualizerSaveDataResponse.json();
        debug.log(JSON.stringify(visualizerSaveDataResponseBody));

        expect(visualizerSaveDataResponseBody.visualizerViewDto.isPublish).toEqual(true);
        debug.log("Published to current demand");
    })
})