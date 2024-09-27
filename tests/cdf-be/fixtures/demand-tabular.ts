import { DemandBaseClass } from "./demand-common-utils";
import commonEndpoints from "../testdata/common-demand-endpoints.json";
import { expect } from "../../common/fixtures/test-hook";

export class DemandTabular extends DemandBaseClass {

  static async downloadExcelandReturnData(
    request,
    demandStackId,
    fileName,
    payload
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandStackId}/excel`;

    payload = {
      ...payload,
    };

    // API Request
    this.headers["Connection"] = "keep-alive";
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    const sheetData = await this.saveExcelAndReturnSheetData(
      response,
      fileName
    );
    return sheetData;
  }

  static validateSbus(data, payload) {
    const totalSbus = payload.sbu.length;
    let sbusFoundInResponse = 0;

    expect(data[`C${8}`].v === payload.organizationalLevel).toBe(true);

    for(let i=9; i<totalSbus+9; i++) {
      if(payload.sbu.indexOf(data[`C${i}`].v) !== -1) {
        sbusFoundInResponse++;
      }
    }

    expect(sbusFoundInResponse === totalSbus).toBe(true);

  }

  static validateYears(data, years) {
    expect(data[`D${8}`].v.includes(years[0])).toBe(true);
    expect(data[`F${8}`].v.includes(years[1])).toBe(true);
  }

  static validateMonths(data, monthNames) {
    expect(data[`D${8}`].v.includes(monthNames[0])).toBe(true);
    expect(data[`E${8}`].v.includes(monthNames[1])).toBe(true);
    expect(data[`F${8}`].v.includes(monthNames[0])).toBe(true);
    expect(data[`G${8}`].v.includes(monthNames[1])).toBe(true);
  }

  static validateMetrics(data, allColumnsSelected) {
    expect(data[`B${9}`].v === allColumnsSelected.selectedMetrics[0]).toBe(true);
  }

  static validateExcelAndForecastValues(excelData, forecastData, excelColumns, sbus) {
    //console.log(excelData[`${excelColumns[0]}${9}`].v);
    //console.log(forecastData.forecast[0].forecast);
    for(let i=0; i<sbus.length; i++) {
      for(let j=0; j< excelColumns.length; j++) {
        expect(excelData[`${excelColumns[j]}${9+i}`].v === forecastData.forecast[i].forecast[j].amount).toBe(true)
      }
    }
  }

}
