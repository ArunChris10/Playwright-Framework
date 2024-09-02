import { expect } from '../../common/fixtures/test-hook';
import testDataFile from '../testdata/current-demand-actuals-validation.json';
import { DemandBaseClass } from "./demand-common-utils";
import { Utility } from '../../common/fixtures/utils';


export class CurrentDemandActualsValidation extends DemandBaseClass{

    static async uploadGrossGmvUnits(request) {
        const endpointURL = `${process.env.apiBaseURLCDF}${testDataFile.endpointForUploadGrossGmvUnits}`;
        console.log("Endpoint URL for upload Gross GMV Units: ", endpointURL);

        // API Request
        this.headers["Connection"] = "keep-alive";
        const response = await request.post(
            endpointURL,
            {
                data: testDataFile.payloadForUploadGrossGmvUnits,
                headers: this.headers
            }
        )
    }

    static async getDemandScenarioForecastBySlot(request, endpoint, payload, slotId) {
        const endpointURL = `${process.env.apiBaseURLCDF}${endpoint}${slotId}`;
        console.log("Endpoint URL for getDemandScenarioForecastBySlot: ", endpointURL);

        // API Request
        this.headers["Connection"] = "keep-alive";
        const response = await request.post(
            endpointURL,
            {
                data: payload,
                headers: this.headers
            }
        );

        return response;
    }

    static validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, forecastData) {
        expect(parseInt(forecastData[0].year)).toBeLessThanOrEqual(actualsStartYear);
        expect(parseInt(forecastData[0].month)).toBeLessThanOrEqual(actualsStartMonth);

        // Traverse through the forecast data and validate 
        var count = 0;

        forecastData.forEach(function(forecastInfo) {
            if(forecastInfo.amount != null && forecastInfo.units != null && forecastInfo.aur != null && forecastInfo.sales != null && forecastInfo.uomValue != null && parseInt(forecastInfo.year) < actualsEndYear) {
                count = count+1;
            } else if(forecastInfo.amount != null && forecastInfo.units != null && forecastInfo.aur != null && forecastInfo.sales != null && forecastInfo.uomValue != null && parseInt(forecastInfo.year) == actualsEndYear && parseInt(forecastInfo.month) <= actualsEndMonth) {
                count = count + 1;
            }
        });

        console.log("Count: ", count);

        return count;

    } 

    static validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, forecastData) {
        // Traverse through the forecast data and validate 
        var count = 0;

        forecastData.forEach(function(forecastInfo) {
            if(forecastInfo.amount != null && forecastInfo.units != null && forecastInfo.aur != null && forecastInfo.sales != null && forecastInfo.uomValue != null && forecastInfo.grossGmv != null && parseInt(forecastInfo.year) < actualsEndYear) {
                count = count+1;
            } else if(forecastInfo.amount != null && forecastInfo.units != null && forecastInfo.aur != null && forecastInfo.sales != null && forecastInfo.uomValue != null && forecastInfo.grossGmv != null && parseInt(forecastInfo.year) == actualsEndYear && parseInt(forecastInfo.month) <= actualsEndMonth) {
                count = count + 1;
            }
        });

        console.log("Count: ", count);

        return count;

    } 

    static validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, forecastData) {
        // Traverse through the forecast data and validate 
        var count = 0;

        forecastData.forEach(function(forecastInfo) {
            if(forecastInfo.amount != null && forecastInfo.units != null && forecastInfo.aur != null && forecastInfo.sales != null && forecastInfo.uomValue != null && forecastInfo.grossUnit != null && parseInt(forecastInfo.year) < actualsEndYear) {
                count = count+1;
            } else if(forecastInfo.amount != null && forecastInfo.units != null && forecastInfo.aur != null && forecastInfo.sales != null && forecastInfo.uomValue != null && forecastInfo.grossUnit != null && parseInt(forecastInfo.year) == actualsEndYear && parseInt(forecastInfo.month) <= actualsEndMonth) {
                count = count + 1;
            }
        });

        console.log("Count: ", count);

        return count;

    } 

    static async getActualsStartDateFromUFM(request, endpoint) {
        const endpointURL = `${process.env.apiBaseURLUFM}${endpoint}`;
        console.log("Endpoint URL for getActualsStartDateFromUFM: ", endpointURL);

        // API Request
        let token = await Utility.getNexusFakeToken(process.env.ufmUser + "", request);

        token = token.replace("\"","");
        token = token.replace("\"","");

        let UFMHeaders = {
            "Authorization": `Bearer ${token}`
        }

        const response = await request.post(
            endpointURL,
            {
                data: testDataFile.payloadForReportsMyKPI,
                headers: UFMHeaders
            }
        );

        return response;
    }

    static calculateNumberOfMonths(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear) {
        var numberOfMonths = 0;

        // Subtracting from 14 because 
        // 1. Need to include current month
        // 2. In CDF, 202108 is equivalent to 202109 in UFM
        numberOfMonths += 14-actualsStartMonth;

        var actualsStartYearTemp = actualsStartYear + 1;

        while(actualsStartYearTemp < actualsEndYear) {
            numberOfMonths += 12;
            actualsStartYearTemp += 1;
        }

        numberOfMonths += actualsEndMonth;

        return numberOfMonths;
    }

    static getMinYear(rowData) {
        let keys = Object.keys(rowData).filter(key => !isNaN(Number(key)));
        let smallestKey = Math.min(...keys.map(Number));

        return smallestKey;
    }

}