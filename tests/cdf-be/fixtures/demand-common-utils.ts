import debug from "debug";
import scenario from "../testdata/scenario.json";
import * as path from 'path';
import * as fs from 'fs';
import * as xlsx from 'xlsx'
import commonEndpoints from "../testdata/common-demand-endpoints.json";

export class DemandBaseClass {
  static headers = {
    "WM_CONSUMER.ID": process.env.WM_CONSUMER_ID,
    "WM_SVC.NAME": process.env.WM_SVC_NAME,
    "WM_SVC.ENV": process.env.envName,
  };

  // This method will create the scenario and asserts the response
  static async getDemandStackDetails(request, demandStackId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${scenario.endpoint}${demandStackId}`;
    const response = await request.get(endpointURL, { headers: this.headers });
    return await response.json();
  }

  static async getCSVDataAsArray(csvApiResponse): Promise<string[][]> {
    // This function accepts the csv download api response as input, downloads and saves the file, reads data, deletes file 
    // and returns the data of the csv file as an array of objects
    let csvBuffer = await csvApiResponse.body();
    let csvFilePath = path.join(__dirname, "download.csv");
    fs.writeFileSync(csvFilePath, csvBuffer);
    // debug.log("CSV downloaded successfully");
    let csvFileData = fs.readFileSync(csvFilePath, 'utf8');

    const csvArray = csvFileData
        .split(/\r\n/)
        .map(row =>
            // Matches commas with no space after them. The lookahead regex is needed to parse the
            // file correctly because sometimes cell values can contain commas, i.e. ARTS, CRAFTS, SEWING & FABRICS
            row.split(/,(?=\S)/)
        )

    // The CSV ends with a comma, and as expected, this matches the regex and creates a final entry with [''] as a value.
    // So, discard this. Unfortunately, there is no better way to match/remove all commas without generating this entry.
    csvArray.splice(csvArray.length - 1)

    fs.unlinkSync(csvFilePath);
    return csvArray;
  }

  // Locating the appropriate data belonging to a column can be troublesome within the CSV array rows (and must be referenced by index)
  // The returned record provides a way to reference the column by name
  static getCSVHeadersRecord(csvArray: string[][]): Record<string, number> {
    const csvHeaders = csvArray[0]
    const csvColumnNamesRecord = {}

    csvHeaders.forEach((columnName, index) => {
      csvColumnNamesRecord[columnName] = index
    })

    return csvColumnNamesRecord
  }

  static async getCellValueFromExcel(excelApiResponse, cellId) {
    // This function accepts the excel download api response as input, downloads and saves the file, reads data, deletes file
    // and return the data from the cell value mentioned in the input
    let excelBuffer = await excelApiResponse.body();
    let excelFilePath = path.join(__dirname, "download.xlsx");
    fs.writeFileSync(excelFilePath, excelBuffer);
    debug.log("excel downloaded successfully");
    let workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const excelData = sheet[cellId].v;
    fs.unlinkSync(excelFilePath);
    return excelData;
  }

  static async lockUnlockDemandScenario(request, urlParam, demandStackId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandStackId}/${urlParam}`;
    // API Request
    const response = await request.post(endpointURL, {
      headers: this.headers,
    });
    return response;
  }

  static async saveExcel(excelApiResponse, fileName) {
    // This function accepts the excel download api response as input, downloads and saves the file.
    let excelBuffer = await excelApiResponse.body();
    let excelFilePath = path.join(__dirname, fileName);
    fs.writeFileSync(excelFilePath, excelBuffer);
    debug.log("excel downloaded successfully");
    fs.unlinkSync(excelFilePath);
  }

  static async getByteStreamFromExcel(fileName) {
    // This function takes filepath and convert it into byte stream.
    let excelFilePath = path.join(__dirname, fileName);
    
  }
  static async fileToBase64(fileName) {
    let excelFilePath = path.join(__dirname, fileName);
    return new Promise((resolve, reject) => {
      fs.readFile(excelFilePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const base64 = Buffer.from(data).toString('base64');
          resolve(base64);
        }
      });
    });
  };

  static async getSheetDataFromExcel(excelApiResponse) {
    // This function accepts the excel download api response as input, downloads and saves the file, reads data, deletes file
    // and return the data from the cell value mentioned in the input
    let excelBuffer = await excelApiResponse.body();
    let excelFilePath = path.join(__dirname, "download.xlsx");
    fs.writeFileSync(excelFilePath, excelBuffer);
    debug.log("excel downloaded successfully");
    let workbook = xlsx.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    fs.unlinkSync(excelFilePath);
    return xlsx.utils.sheet_to_json(sheet);
  }

  static async deleteManualAdjustmentLayer(request, demandId, layerId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandId}` + "/layer/" + `${layerId}`;
    console.log("Endpoint URL for deleting Manual adjustment layer: ", endpointURL);

    // API Request
    const response = await request.delete(
        endpointURL,
        {
            header: this.headers
        }
    );

    return response;
  }
}
