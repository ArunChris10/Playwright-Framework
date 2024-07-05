import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import testdatafile from '../testdata/visualizer-table-data-custom-scenarios.json';
import { CdfUtility } from '../fixtures/cdf-utils';
import debug from 'debug';

test.describe("Verify that the user should be able to add custom metrices under metric section on the visualizer", { tag: "@Smoke @visualizerTableDataCustomScenarios" }, () => {

    let demandId1, demandId2;

    test.beforeAll(async ({ request }) => { 
        demandId1 = await CdfUtility.createScenario(request);
        demandId2 = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => { 
        await CdfUtility.deleteScenario(request, demandId1); 
        await CdfUtility.deleteScenario(request, demandId2);
    });

    test("Verify the custom scenario SUM, DIFFERENCE and % DIFFERENCE", async ({ request }) => {
        let visualizerTableDataCustomScenarioResponse = await VisualizerUtility.visualizerTableDataCustomScenarioSumDiff(request, demandId1, demandId2);

        // Assertion
        expect(visualizerTableDataCustomScenarioResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomScenarioResponseBody = await visualizerTableDataCustomScenarioResponse.json();

        let gmvValueScenario1 = visualizerTableDataCustomScenarioResponseBody[0].data[0].data[0].data[0].kpiValue
        let gmvValueScenario2 = visualizerTableDataCustomScenarioResponseBody[0].data[1].data[0].data[0].kpiValue

        let totalSum = visualizerTableDataCustomScenarioResponseBody[0].data[2].data[0].data[0].kpiValue

        let calculatedSum = gmvValueScenario1+gmvValueScenario2;

        debug.log("Calculated Sum Value: ", calculatedSum);
        debug.log("Sum Value: ", totalSum);

        expect(totalSum).toEqual(calculatedSum);
        debug.log("Custom scenario Sum check successful");

        let totalDiff = visualizerTableDataCustomScenarioResponseBody[0].data[3].data[0].data[0].kpiValue

        let calculatedDiff = gmvValueScenario1-gmvValueScenario2;

        debug.log("Calculated Diff Value: ", calculatedDiff);
        debug.log("Diff Value: ", totalDiff);

        expect(calculatedDiff).toEqual(totalDiff);
        debug.log("Custom scenario Difference check successful");

        let calculatedDifferencePercentage = parseFloat((((gmvValueScenario1-gmvValueScenario2)/gmvValueScenario1) * 100).toFixed(3))

        let diffPercentage = visualizerTableDataCustomScenarioResponseBody[0].data[4].data[0].data[0].kpiValue

        debug.log("Diff Percentage Value: ", diffPercentage);

        expect(calculatedDifferencePercentage).toEqual(diffPercentage);
        debug.log("Custom scenario Difference Percentage check successful");

    })

    test("Verify the custom scenario YoY%, YoyDifference and lastYearValue", async ({ request }) => {
        let dateIntervalStart, dateIntervalEnd;
        dateIntervalStart = testdatafile.dateIntervalStartOld;
        dateIntervalEnd = testdatafile.dateIntervalEndtOld;

        let visualizerTableDataCustomScenarioResponseOld = await VisualizerUtility.visualizerTableDataCustomScenarioYoy(request, demandId1, dateIntervalStart, dateIntervalEnd);
        
        // Assertion
        expect(visualizerTableDataCustomScenarioResponseOld).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomScenarioResponseBodyOld = await visualizerTableDataCustomScenarioResponseOld.json();

        dateIntervalStart = testdatafile.dateIntervalStartNew;
        dateIntervalEnd = testdatafile.dateIntervalEndNew;

        let visualizerTableDataCustomScenarioResponseNew = await VisualizerUtility.visualizerTableDataCustomScenarioYoy(request, demandId1, dateIntervalStart, dateIntervalEnd);
        
        // Assertion
        expect(visualizerTableDataCustomScenarioResponseNew).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomScenarioResponseBodyNew = await visualizerTableDataCustomScenarioResponseNew.json();

        let gmvOld = visualizerTableDataCustomScenarioResponseBodyOld[0].data[0].data[0].data[0].kpiValue
        let gmvNew = visualizerTableDataCustomScenarioResponseBodyNew[0].data[0].data[0].data[0].kpiValue

        let calculatedYoyPercentage = parseFloat((((gmvNew-gmvOld)/gmvOld) * 100).toFixed(3))

        let yoyPercentage = visualizerTableDataCustomScenarioResponseBodyNew[0].data[1].data[0].data[0].kpiValue

        debug.log("Calculated Yoy Percentage: ", calculatedYoyPercentage);
        debug.log("Yoy Percentage: ", yoyPercentage);

        expect(yoyPercentage).toEqual(calculatedYoyPercentage);
        debug.log("Custom scenario YoY Percentage check successful");

        let calculatedYoyDifference = gmvNew - gmvOld;

        let yoyDifference = visualizerTableDataCustomScenarioResponseBodyNew[0].data[2].data[0].data[0].kpiValue

        debug.log("Calculated Diff Value: ", calculatedYoyDifference);
        debug.log("Diff Value: ", yoyDifference);

        expect(yoyDifference).toEqual(calculatedYoyDifference);
        debug.log("Custom scenario YoY Difference check successful");

        let lastYearValue = visualizerTableDataCustomScenarioResponseBodyNew[0].data[3].data[0].data[0].kpiValue

        debug.log("Last Year Value: ", lastYearValue);

        expect(gmvOld).toEqual(lastYearValue);
        debug.log("Custom scenario Last Year Value check successful");

    })
})