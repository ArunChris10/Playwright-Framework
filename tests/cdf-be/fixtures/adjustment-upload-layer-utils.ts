import * as path from 'path';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import commonEndpoints from '../testdata/common-demand-endpoints.json';
import testDataFile from '../testdata/adjustment-upload-layer.json';
import testDataFileManageRebase from '../testdata/manage-rebase.json'
import { APIRequestContext, type APIResponse } from "@playwright/test";
import { CdfUtility } from "./cdf-utils";
import { DemandBaseClass } from "./demand-common-utils";
import { expect, test } from "../../common/fixtures/test-hook";
import { LockUnlockUtility } from "./lock-unlock-utils";
import { ManageRebaseUtility } from "./manage-rebase-utils";
import type { Department, GetDemandScenarioForecastResponse } from "../types/get-demand-scenario-forecast-response";

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

    static async downloadExcel(
        request: APIRequestContext,
        demandId: string,
        forecastVersion: string,
        forecastLayerId: string,
        excelFileName: string,
        metricType: string = 'GMV Shipped',
        metricUnit: string = null,
        timeFilter: 'year' | 'quarter' | 'month' = 'month'
    ) {
        const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandId}/excel`;

        testDataFile.payloadForExportExcel.layerIds[0] = forecastLayerId;
        testDataFile.payloadForExportExcel.version = forecastVersion;
        testDataFile.payloadForExportExcel.metricType = metricType;
        testDataFile.payloadForExportExcel.metricUnit = metricUnit;
        testDataFile.payloadForExportExcel.timeFilter = testDataFile.timeFilters[timeFilter]

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

    static async uploadExcel(
        request: APIRequestContext,
        demandId: string,
        forecastVersion: string,
        excelFileName: string,
        cellsToUpdate: { position: string, value: number }[]
    ) {
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

    // Note: This function only works with a file written by the AdjustmentUploadLayer.downloadExcel method
    // and a payload with organizationLevel=department
    static async getDepartmentFromExcelCell(excelFileName: string, position: string): Promise<ExcelJS.CellValue> {
        let excelFilePath = path.join(__dirname, excelFileName);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(excelFilePath);

        const worksheet = workbook.getWorksheet(workbook.worksheets[0].name);

        const row = position.match(/\d+/)[0]
        const departmentColumn = 'D'

        return worksheet.getCell(`${departmentColumn}${row}`).value
    }

    // Huge generalization of Adjustment Layer - Upload tests. Can be extended to include similar use-cases (noted below).
    static async testExcelUploadAndAssertResponse(
        request: APIRequestContext,
        timeFilter: 'year' | 'quarter' | 'month' = 'month'
    ) {
        const excelFileName = `download_${new Date().getTime()}_data.xlsx`
        const cellsToUpdate = [
            { position : testDataFile.cellPositionForDepartment, value: testDataFile.valueToBeUpdated },
            { position: testDataFile.cellPositionForSBU, value: testDataFile.valueToBeUpdated },
            { position: testDataFile.cellPositionForChannel, value: testDataFile.valueToBeUpdated },
        ]

        let demandId: string,
            forecastVersion: string,
            forecastLayerId: string,
            layerIdOfUpload: string,
            uploadLayerResponse: APIResponse

        demandId = await CdfUtility.createScenario(request)

        const demandScenarioDetails =
            await DemandBaseClass.getDemandStackDetails(request, demandId)

        forecastVersion = demandScenarioDetails.forecastInfoDTO.forecastInfo.version
        forecastLayerId = demandScenarioDetails.forecastInfoDTO.forecastInfo.forecastLayerId

        testDataFile.payloadForGetDemandScenarioForecast.version = forecastVersion

        await test.step("Download the Demand Stack's excel file with months as the time-span", async () => {
            await AdjustmentUploadLayer.downloadExcel(
                request,
                demandId,
                forecastVersion,
                forecastLayerId,
                excelFileName,
                undefined, // Edit to generalize a different metricType
                undefined, // Edit to generalize a different metricUnit
                timeFilter
            )
        })

        await test.step("Lock the demand stack before creating an upload layer", async () => {
            const lockDSSResponseForUploadLayer = await LockUnlockUtility.lockDSSData(request, demandId)
            await expect(lockDSSResponseForUploadLayer).toBeOK()
        })

        await test.step('Update an excel value and create an upload layer', async () => {
            uploadLayerResponse = await AdjustmentUploadLayer.uploadExcel(request, demandId, forecastVersion, excelFileName, cellsToUpdate)
            await expect(uploadLayerResponse).toBeOK()

            const uploadLayerResponseBody = await uploadLayerResponse.json()
            layerIdOfUpload = uploadLayerResponseBody[0].layerId;
        })

        await test.step("Verify the demand output data matches the data previously uploaded by the user", async () => {
            testDataFile.payloadForGetDemandScenarioForecast.layerIds[0] = layerIdOfUpload

            const demandScenarioForecastResponse = await ManageRebaseUtility.getDemandScenarioForecast(
                request,
                demandId,
                testDataFileManageRebase.endpointForGetDemandScenarioForecast,
                { ...testDataFile.payloadForGetDemandScenarioForecast, timeFilter: testDataFile.timeFilters[timeFilter] }
            )

            const demandScenarioForecast =
                await demandScenarioForecastResponse.json() as GetDemandScenarioForecastResponse<Department>

            const modifiedDepartment = await AdjustmentUploadLayer.getDepartmentFromExcelCell(
                excelFileName,
                cellsToUpdate[0].position
            )

            let forecastKey: string;
            switch (timeFilter) {
                case 'year': {
                    forecastKey = 'yearlyForecast'
                    break
                }
                case 'quarter': {
                    forecastKey = 'quarterlyForecast'
                    break
                }
                default: forecastKey = 'forecast'
            }

            for (const department of demandScenarioForecast[forecastKey]) {
                if (department.departmentIdAndNameConcat.replace(/\s/g, '') === modifiedDepartment) {
                    const departmentAmountInApiUploadLayer = department.forecast[0].amount
                    console.log(
                        `${department.departmentDisplayName} amount in upload layer (${layerIdOfUpload}): `,
                        departmentAmountInApiUploadLayer
                    )
                    expect(departmentAmountInApiUploadLayer).toEqual(testDataFile.valueToBeUpdated)
                }
            }
        })

        await CdfUtility.deleteScenario(request, demandId)
    }
}