import * as path from 'path';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import commonEndpoints from '../testdata/common-demand-endpoints.json';
import testDataFile from '../testdata/adjustment-upload-layer.json';

export class AdjustmentUploadLayer{
    static headers = {
        "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
        "WM_SVC.NAME": process.env.WM_SVC_NAME,
        "WM_SVC.ENV": process.env.envName,
    };

    static convertToBase64(excelFilePath) {
        const fileBuffer = fs.readFileSync(excelFilePath);
        return fileBuffer.toString('base64');
    }

    static async saveExcel(downloadExcelResponse, excelFileName) {
        let excelBuffer = await downloadExcelResponse.body()
        let excelFilePath = path.join(__dirname, excelFileName);
        fs.writeFileSync(excelFilePath, excelBuffer);

        console.log("Excel file got downloaded");
    }

    static async downloadExcel(request, demandId, forecastVersion, forecastLayerId, excelFileName, metricType, metricUnit=null) {
        const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandId}/excel`;

        testDataFile.payloadForExportExcel.layerIds[0] = forecastLayerId;
        testDataFile.payloadForExportExcel.version = forecastVersion;
        testDataFile.payloadForExportExcel.metricType = metricType;
        testDataFile.payloadForExportExcel.metricUnit = metricUnit;

        const response = await request.post(
            endpointURL,
            {
                data: testDataFile.payloadForExportExcel,
                headers: this.headers
            }
        );
        
        this.saveExcel(response, excelFileName);
        return response;
    }

    static async updateExcelCellValue(excelFilePath, cellsToUpdate) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelFilePath);

        const worksheet = workbook.getWorksheet(workbook.worksheets[0].name);
        
        cellsToUpdate.forEach(cellToUpdate => {
            const cell = worksheet?.getCell(cellToUpdate.position);
            cell.value = cellToUpdate.value;
        });

        await workbook.xlsx.writeFile(excelFilePath);
    }

    static async uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate) {
        let excelFilePath = path.join(__dirname, excelFileName);

        await this.updateExcelCellValue(excelFilePath, cellsToUpdate);

        let base64ConvertedValue = this.convertToBase64(excelFilePath);

        testDataFile.payloadForUploadLayer.layers[0].file = base64ConvertedValue;
        testDataFile.payloadForUploadLayer.layers[0].forecastVersion = forecastVersion;
        const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandId}`;

        const response = await request.put(
            endpointURL,
            {
                data: testDataFile.payloadForUploadLayer,
                headers: this.headers
            }
        );

        return response;
    }

    static async deleteUploadLayer(request, demandId, layerId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandId}` + "/layer/" + `${layerId}`;
        console.log("Endpoint URL for deleting upload layer: ", endpointURL);
    
        // API Request
        const response = await request.delete(
            endpointURL,
            {
                headers: this.headers
            }
        );
    
        return response;
      }
}