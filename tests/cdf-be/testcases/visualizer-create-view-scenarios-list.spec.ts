import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import debug from 'debug';

test.describe("Verify user should be able to create a new view and scenarios should be displayed ", { tag: "@Smoke @createNewView" }, () => {

    let visualizerSaveDataResponse;

    test("Verify visualizer-save api is working", async ({ request }) => {
        visualizerSaveDataResponse = await VisualizerUtility.visualizerSave(request);

        // Assertion
        expect(visualizerSaveDataResponse).toBeOK();

        // Extracting the response body
        let visualizerSaveDataResponseBody = await visualizerSaveDataResponse.json();
        debug.log(JSON.stringify(visualizerSaveDataResponseBody));

        expect(visualizerSaveDataResponseBody.visualizerViewDto.visualizerViewId).not.toBeNull();
        let scenarioDtoListResponse = visualizerSaveDataResponseBody.visualizerViewDto.visualizerMetaDataDto.scenarioDtoList;
        debug.log(JSON.stringify(scenarioDtoListResponse));
        expect(scenarioDtoListResponse).not.toBeNull();
        expect(scenarioDtoListResponse.length).toEqual(5);

        //Current Demand Scenario
        let currentDemand = scenarioDtoListResponse.filter(scenario => scenario.scenarioDisplayName === "Current Demand");
        expect(currentDemand).not.toBeNull();
        expect(currentDemand.length).toEqual(1);

        //Actual scenario
        let actual = scenarioDtoListResponse.filter(scenario => scenario.scenarioDisplayName === "Actual");
        expect(actual).not.toBeNull();
        expect(actual.length).toEqual(1);

        //All DS scenarios
        let dsScenario = scenarioDtoListResponse.filter(scenario => scenario.scenarioDisplayName.startsWith("DS-"));
        expect(dsScenario).not.toBeNull();
        expect(dsScenario.length).toEqual(2);

        //All Total scenario
        let totalScenario = scenarioDtoListResponse.filter(scenario => scenario.scenarioDisplayName.startsWith("Total-"));
        expect(totalScenario).not.toBeNull();
        expect(totalScenario.length).toEqual(1);

        debug.log("Able to create a new view and scenarios are displayed ");
    })

     test("Verify visualizer clone api is working", async ({ request }) => {
            visualizerSaveDataResponse = await VisualizerUtility.visualizerSave(request);

            // Assertion
            expect(visualizerSaveDataResponse).toBeOK();

            // Extracting the response body
            let visualizerSaveDataResponseBody = await visualizerSaveDataResponse.json();
            debug.log(JSON.stringify(visualizerSaveDataResponseBody));
            expect(visualizerSaveDataResponseBody.visualizerViewDto.visualizerViewId).not.toBeNull();
            debug.log("Able to clone a existing view and scenarios are displayed ");

            // Extracting view id from newly cloned view
            let viewId = visualizerSaveDataResponseBody.visualizerViewDto.visualizerViewId
            let visualizerDeleteDataResponse = await VisualizerUtility.deleteView(request, viewId);
            // Assertion
            expect(visualizerDeleteDataResponse).toBeOK();

            // Extracting the response body
            let visualizerDeleteDataResponseBody = await visualizerDeleteDataResponse.json();
            debug.log(JSON.stringify(visualizerDeleteDataResponseBody));

             expect(visualizerDeleteDataResponseBody.message).toEqual("View has been deleted successfully!");
            debug.log("Able to delete a view with viewId =  " + viewId);
        })

})