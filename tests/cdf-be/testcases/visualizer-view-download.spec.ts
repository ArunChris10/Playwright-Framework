import { expect, test } from '../../common/fixtures/test-hook';
import { VisualizerUtility } from '../fixtures/visualizer-utils';
import testdatafile from '../testdata/visualizer-view-download.json';
import { CdfUtility } from '../fixtures/cdf-utils';
import { DemandBaseClass } from '../fixtures/demand-common-utils'
import debug from 'debug';

test.describe("Verify that the user should be able to download csv and excel from the visualizer screen and validate the data", { tag: "@visualizerDownloadTest @ibg-service-visualizer @Regression" }, () => {

    let demandId, visualizerData;

    test.beforeAll(async ({ request }) => { demandId = await CdfUtility.createScenario(request); });

    // test.afterAll(async ({ request }) => { await CdfUtility.deleteScenario(request, demandId); });

    test("Get visualizer data", async ({ request }) => {
        let visualizerDataResponse = await VisualizerUtility.getVisualizerData(request, demandId, testdatafile.data);
        expect(visualizerDataResponse).toBeOK();
        visualizerData = await visualizerDataResponse.json();
        visualizerData = visualizerData.filter(c => c.channelGroup == 'DELIVERY')[0].data[0].data[0].data[0].kpiValue;
    });


    test("Download csv, save the csv and validate data", async ({ request }) => {
        let csvDownloadResponse = await VisualizerUtility.getVisualizerData(request, demandId, testdatafile.csv);
        expect(csvDownloadResponse).toBeOK();
        let csvResponseData = await DemandBaseClass.getCSVDataAsArray(csvDownloadResponse);
        let csvData = parseFloat(csvResponseData.filter(row => row[0] === "202602" && row[1] === "DELIVERY").map(row => row[2])[0]);
        debug.log(csvData);
        expect(csvData).toEqual(visualizerData);
    });

    test("Download excel, save the excel and validate data", async ({ request }) => {
        let excelDownloadResponse = await VisualizerUtility.getVisualizerData(request, demandId, testdatafile.excel);
        expect(excelDownloadResponse).toBeOK();
        let excelData = await DemandBaseClass.getCellValueFromExcel(excelDownloadResponse, 'C10');
        expect(excelData).toEqual(visualizerData);
    });

});