import debug from "debug";
import scenario from "../testdata/scenario.json";
import * as path from 'path';
import * as fs from 'fs';
import * as xlsx from 'xlsx'

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

  static async getCSVDataAsObjects(csvApiResponse) {
    // This function accepts the csv download api response as input, downloads and saves the file, reads data, deletes file 
    // and returns the data of the csv file as an array of objects
    let csvBuffer = await csvApiResponse.body();
    let csvFilePath = path.join(__dirname, "download.csv");
    fs.writeFileSync(csvFilePath, csvBuffer);
    debug.log("CSV downloaded successfully");
    let csvFileData = fs.readFileSync(csvFilePath, 'utf8');
    const rows = csvFileData.split('\n');
    fs.unlinkSync(csvFilePath);
    return rows;
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
}
