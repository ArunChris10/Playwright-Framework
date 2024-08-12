import { test, expect } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import testdatafile from '../testdata/get-visualizer-table-filters.json';
import debug from 'debug';

test.describe("Verify user sees options to filter the view based upon dimensions:Channel group,base channel,SBU and Dept", { tag: "@Smoke @getVisualizerTableFilter @ibg-service-scenario-financials @Regression"}, () => {
    let getVisualizerTableFilterDataResponse;

    test("Verify user options to filter the view based upon dimensions", async ({ request }) => {
        getVisualizerTableFilterDataResponse = await VisualizerUtility.getVisualizerTableFilters(request);

        // Assertion
        expect(getVisualizerTableFilterDataResponse).toBeOK();
        
        // Extracting the response body
        let getVisualizerTableFilterDataResponseBody = await getVisualizerTableFilterDataResponse.json();
        debug.log(JSON.stringify(getVisualizerTableFilterDataResponseBody));
        expect(getVisualizerTableFilterDataResponseBody).toEqual(testdatafile.expected_response);
        debug.log("User is able to filter based on dimensions");
    })
})