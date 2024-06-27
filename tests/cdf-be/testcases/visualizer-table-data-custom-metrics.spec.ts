import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import testdatafile from '../testdata/visualizer-table-data-custom-metrics.json';
import debug from 'debug';

test.describe("Verify that the user should be able to add custom metrices under metric section on the visualizer", { tag: "@Smoke @visualizerTableDataCustomMetrics" }, () => {

    test("Verify the custom metric SUM", async ({ request }) => {
        let visualizerTableDataCustomMeticsResponse = await VisualizerUtility.visualizerTableDataCustomMetricsForSum(request);

        // Assertion
        expect(visualizerTableDataCustomMeticsResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomMeticsResponseBody = await visualizerTableDataCustomMeticsResponse.json();
        debug.log(JSON.stringify(visualizerTableDataCustomMeticsResponseBody));

        let gmvValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[0].kpiValue
        let unitsValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[1].kpiValue
        
        let sumValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[2].kpiValue
        debug.log("Sum Value: ", sumValue);

        let calculatedSumValue = gmvValue+unitsValue;
        debug.log("Calculated Sum Value: ", calculatedSumValue);
        
        // Assertion of calculated sum with response sum
        expect(sumValue).toEqual(calculatedSumValue);

        // Assertion of actual response with expected response
        expect(visualizerTableDataCustomMeticsResponseBody).toEqual(testdatafile.expected_response_for_sum);
        debug.log("User is able to add custom metric sum");
    })

    test("Verify the custom metric DIFFERENCE", async ({ request }) => {
        let visualizerTableDataCustomMeticsResponse = await VisualizerUtility.visualizerTableDataCustomMetricsForDifference(request);

        // Assertion
        expect(visualizerTableDataCustomMeticsResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomMeticsResponseBody = await visualizerTableDataCustomMeticsResponse.json();
        debug.log(JSON.stringify(visualizerTableDataCustomMeticsResponseBody));

        let gmvValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[0].kpiValue
        let unitsValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[1].kpiValue
        
        let differenceValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[2].kpiValue
        debug.log("Difference Value: ", differenceValue);

        let calculatedDifferenceValue = Math.abs(gmvValue-unitsValue);
        debug.log("Calculated Difference Value: ", calculatedDifferenceValue);
        
        // Assertion of calculated difference with response difference
        expect(differenceValue).toEqual(calculatedDifferenceValue);
        
        // Assertion of actual response with expected response
        expect(visualizerTableDataCustomMeticsResponseBody).toEqual(testdatafile.expected_response_for_difference);
        debug.log("User is able to add custom metric difference");
    })

    test("Verify the custom metric PERCENT DIFFERENCE", async ({ request }) => {
        let visualizerTableDataCustomMeticsResponse = await VisualizerUtility.visualizerTableDataCustomMetricsForPercentDifference(request);

        // Assertion
        expect(visualizerTableDataCustomMeticsResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomMeticsResponseBody = await visualizerTableDataCustomMeticsResponse.json();
        debug.log(JSON.stringify(visualizerTableDataCustomMeticsResponseBody));

        let gmvValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[0].kpiValue
        let unitsValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[1].kpiValue
        
        let percentDifferenceValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[2].kpiValue
        debug.log("Percent Difference Value: ", percentDifferenceValue);

        let calculatedPercentDifferenceValue = Math.round((Math.abs(gmvValue-unitsValue)/unitsValue)*100000)/1000;
        debug.log("Calculated Percent Difference Value: ", calculatedPercentDifferenceValue);

        // Assertion of calculated percent difference value with response percent difference value
        expect(percentDifferenceValue).toEqual(calculatedPercentDifferenceValue);
        
        // Assertion of actual response with expected response
        expect(visualizerTableDataCustomMeticsResponseBody).toEqual(testdatafile.expected_response_for_percent_difference);
        debug.log("User is able to add custom metric percent difference");
    })

    test("Verify the custom metric YEAR OVER YEAR PERCENT", async ({ request }) => {
        let visualizerTableDataCustomMeticsResponse = await VisualizerUtility.visualizerTableDataCustomMetricsForYearOverYearPercent(request);

        // Assertion
        expect(visualizerTableDataCustomMeticsResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomMeticsResponseBody = await visualizerTableDataCustomMeticsResponse.json();
        debug.log(JSON.stringify(visualizerTableDataCustomMeticsResponseBody));

        let previousYearValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[1].data[0].kpiValue
        let currentYearValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[13].data[0].kpiValue
        
        let yoyDifferencePercentValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[13].data[2].kpiValue
        debug.log("Yoy Difference Percent Value: ", yoyDifferencePercentValue);

        let CalculatedYoyDifferencePercentValue = Math.round(((currentYearValue-previousYearValue)/previousYearValue)*100000)/1000;
        debug.log("Calculated Yoy Difference Percent Value: ", CalculatedYoyDifferencePercentValue);

        // Assertion of calculated yoyDifferencePercent with response yoyDifferencePercent
        expect(yoyDifferencePercentValue).toEqual(CalculatedYoyDifferencePercentValue);
        
        // Assertion of actual response with expected response
        expect(visualizerTableDataCustomMeticsResponseBody).toEqual(testdatafile.expected_response_for_yoy);
        debug.log("User is able to add custom metric yoy difference percent");
    })

    test("Verify the custom metric YOY Difference", async ({ request }) => {
        let visualizerTableDataCustomMeticsResponse = await VisualizerUtility.visualizerTableDataCustomMetricsForYoyDifference(request);

        // Assertion
        expect(visualizerTableDataCustomMeticsResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomMeticsResponseBody = await visualizerTableDataCustomMeticsResponse.json();
        debug.log(JSON.stringify(visualizerTableDataCustomMeticsResponseBody));

        let previousYearValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[1].data[0].kpiValue
        let currentYearValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[13].data[0].kpiValue
        
        let yoyDifferenceValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[13].data[2].kpiValue
        debug.log("Yoy Difference Value: ", yoyDifferenceValue);

        let CalculatedYoyDifferenceValue = Math.round((currentYearValue-previousYearValue)*100)/100;
        debug.log("Calculated Yoy Difference Value: ", CalculatedYoyDifferenceValue);

        // Assertion of calculated yoy difference with response yoy difference
        expect(yoyDifferenceValue).toEqual(CalculatedYoyDifferenceValue);
        
        // Assertion of actual response with expected response
        expect(visualizerTableDataCustomMeticsResponseBody).toEqual(testdatafile.expected_response_for_yoy_difference);
        debug.log("User is able to add custom metric yoy difference");
    })

    test("Verify the custom metric Last Year Value", async ({ request }) => {
        let visualizerTableDataCustomMeticsResponse = await VisualizerUtility.visualizerTableDataCustomMetricsForLastYearValue(request);

        // Assertion
        expect(visualizerTableDataCustomMeticsResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomMeticsResponseBody = await visualizerTableDataCustomMeticsResponse.json();
        debug.log(JSON.stringify(visualizerTableDataCustomMeticsResponseBody));

        // Assertion of actual response with expected response
        expect(visualizerTableDataCustomMeticsResponseBody).toEqual(testdatafile.expected_response_for_last_year_value);
        debug.log("User is able to add custom metric last year value");
    })

    test("Verify the custom metric Percent of Sales", async ({ request }) => {
        let visualizerTableDataCustomMeticsResponse = await VisualizerUtility.visualizerTableDataCustomMetricsForPercentOfSales(request);

        // Assertion
        expect(visualizerTableDataCustomMeticsResponse).toBeOK();

        // Extracting the response body
        let visualizerTableDataCustomMeticsResponseBody = await visualizerTableDataCustomMeticsResponse.json();
        debug.log(JSON.stringify(visualizerTableDataCustomMeticsResponseBody));

        let gmvValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[0].kpiValue
        let unitsValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[1].kpiValue
        
        let percentOfSalesValue = visualizerTableDataCustomMeticsResponseBody[0].data[0].data[0].data[2].kpiValue
        debug.log("Percent of Sales Value: ", percentOfSalesValue);

        let calculatedPercentOfSalesValue = Math.round((unitsValue/gmvValue)*100000)/1000;
        debug.log("Calculated Percent of Sales Value: ", calculatedPercentOfSalesValue);

        // Assertion of calculated percent of sales value with response percent of sales value
        expect(percentOfSalesValue).toEqual(calculatedPercentOfSalesValue);
        
        // Assertion of actual response with expected response
        expect(visualizerTableDataCustomMeticsResponseBody).toEqual(testdatafile.expected_response_for_percent_of_sales);
        debug.log("User is able to add custom metric percent of sales");
    })


})