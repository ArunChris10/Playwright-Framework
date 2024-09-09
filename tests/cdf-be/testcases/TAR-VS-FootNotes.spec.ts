import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import debug from 'debug';

test.describe("Verify User should have ability to give the foot notes regarding the view that s been created or cloned.and should be visible at the bottom of the table", { tag: "@Smoke @VisualizerFootNotes @ibg-service-visualizer @Regression" }, () => {

    let visualizerSaveDataResponseBody;

    test("Verify User should have ability to give the foot notes ", async ({ request }) => {
        visualizerSaveDataResponseBody = await VisualizerUtility.VisualizerFootNotes(request, "test");
        debug.log(JSON.stringify(visualizerSaveDataResponseBody));
        expect(visualizerSaveDataResponseBody.visualizerViewDto.footNotes).toBe("test");
        debug.log("Able to create a new view and scenarios are displayed ");
    })

})