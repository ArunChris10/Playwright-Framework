import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import debug from 'debug';

test.describe("Verify if super user can publish a view to current demand", { tag: "@Smoke @publishToCurrentDemand @ibg-service-scenario-financials @Regression" }, () => {
    
    let visualizerSaveDataResponse, templateId;

    test.beforeAll(async ({ request }) => {
        const templates = await VisualizerUtility.getTemplate(request);
        templateId = templates.find(
          (t) => t.isMergedTemplate === true
        )?.templateId;
      });

    test("Verify visualizer-save api is working", async ({ request }) => {
        visualizerSaveDataResponse = await VisualizerUtility.visualizerSaveCurrentDemand(request, templateId);

        // Assertion
        expect(visualizerSaveDataResponse).toBeOK();

        // Extracting the response body
        let visualizerSaveDataResponseBody = await visualizerSaveDataResponse.json();
        debug.log(JSON.stringify(visualizerSaveDataResponseBody));

        expect(visualizerSaveDataResponseBody.visualizerViewDto.isPublish).toEqual(true);
        debug.log("Published to current demand");
    })
})