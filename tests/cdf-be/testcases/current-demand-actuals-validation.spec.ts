import { test, expect } from '../../common/fixtures/test-hook';
import { CurrentDemandActualsValidation } from '../fixtures/current-demand-actuals-validation';
import testDataFile from '../testdata/current-demand-actuals-validation.json';
import debug from 'debug'; 

test.describe("Verify if the current demand actuals data for non Yoy metrics are present", { tag: "@Regression @currentDemandActualsValidation @ibg-service-scenario-financials @CurrentDemand" }, () => {
    
    let monthsInFiveYears = 60;

    test.beforeAll(async ({request}) => {
        await CurrentDemandActualsValidation.uploadGrossGmvUnits(request);
    });

    let slotIds = testDataFile.slotIds;

    slotIds.forEach(function(slotId) {
        test("Verifying current demand actuals data for non Yoy metrics for slot " + slotId + " SBU View", async ({ request }) => {
            let currentDemandDataSBUViewResponse;
            
            testDataFile.payloadForCurrentDemandActualsValidation.organizationalLevel = "SBU";
            currentDemandDataSBUViewResponse = await CurrentDemandActualsValidation.getDemandScenarioForecastBySlot(request, testDataFile.endpointForCurrentDemandActualsValidation, testDataFile.payloadForCurrentDemandActualsValidation, slotId);
    
            let currentDemandDataSBUViewResponseBody;
            currentDemandDataSBUViewResponseBody = await currentDemandDataSBUViewResponse.json();
            
            let actualsEndDate = currentDemandDataSBUViewResponseBody.cutOffDate;
            debug.log("Actuals end Date SBU View Slot " + slotId + ": ", actualsEndDate);
    
            let actualsEndYear = parseInt(actualsEndDate.substring(0, 4));
            debug.log("Acutals End Year SBU View Slot " + slotId + ": ", actualsEndYear);
    
            let actualsEndMonth = parseInt(actualsEndDate.substring(5, 7))
            debug.log("Actuals End Month SBU View Slot " + slotId + ": ", actualsEndMonth);
    
            let actualsStartMonth;
            let actualsStartYear;
    
            if(actualsEndMonth == 12) {
                actualsStartMonth = 1;
                actualsStartYear = actualsEndYear-4;
            } else if(actualsEndMonth == 1) {
                actualsStartMonth = 12;
                actualsStartYear = actualsEndYear-5;
            } else {
                actualsStartMonth = actualsEndMonth + 1;
                actualsStartYear = actualsEndYear-5;
            }
    
            debug.log("Actuals start year SBU View Slot " + slotId + ": ", actualsStartYear);
            debug.log("Actuals start month SBU View Slot " + slotId + ": ", actualsStartMonth);
    
            // VALIDATION OF ALL THE METRICS EXCEPT GROSS GMV AND GROSS UNITS
    
            let countForecastOfForecast = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecast[0].forecast);
            expect(countForecastOfForecast).toEqual(monthsInFiveYears);
    
            // Validation for forecast inside grandTotal inside forecastTotals
            let countForecastOfGrandTotalOfForecastTotals = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.grandTotal.forecast);
            expect(countForecastOfGrandTotalOfForecastTotals).toEqual(monthsInFiveYears);
    
            let countForecastOfTotalAfterExcludingDepartmentsOfForecastTotals = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.totalAfterExcludingDepartments.forecast);
            expect(countForecastOfTotalAfterExcludingDepartmentsOfForecastTotals).toEqual(monthsInFiveYears);
    
            let countForecastOfTotalOfExcludingDepartmentsOfForecastTotals = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.totalOfExcludingDepartments[0].forecast);
            expect(countForecastOfTotalOfExcludingDepartmentsOfForecastTotals).toEqual(monthsInFiveYears);
    
            let reportsKpiResponse;
            reportsKpiResponse = await CurrentDemandActualsValidation.getActualsStartDateFromUFM(request, testDataFile.endpointForReportsMyKPI)
    
            let reportsKpiResponseBody;
            reportsKpiResponseBody = await reportsKpiResponse.json();
    
            let rowData = reportsKpiResponseBody.rowData;
            let startDateForGrossGMV = String(CurrentDemandActualsValidation.getMinYear(rowData[0]));
            let startDateForGrossUnits = String(CurrentDemandActualsValidation.getMinYear(rowData[1]));
    
            // VALIDATION OF GROSS GMV
            debug.log("Start Date For Gross GMV SBU View Slot " + slotId + ": ", String(startDateForGrossGMV));
    
            let actualsStartYearForGrossGMV = parseInt(startDateForGrossGMV.substring(0, 4));
            let actualsStartMonthForGrossGMV = parseInt(startDateForGrossGMV.substring(4, 7));
    
            debug.log("Actuals Start Year for Gross GMV SBU View Slot " + slotId + ": ", actualsStartYearForGrossGMV);
            debug.log("Actuals Start Month for Gross GMV SBU View Slot " + slotId + ": ", actualsStartMonthForGrossGMV);
    
            let monthsForActualsForGrossGMV = CurrentDemandActualsValidation.calculateNumberOfMonths(actualsStartMonthForGrossGMV, actualsStartYearForGrossGMV, actualsEndMonth, actualsEndYear);
    
            debug.log("Number of Months SBU View Slot " + slotId + ": ", monthsForActualsForGrossGMV);
    
            let countForecastOfForecastGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecast[0].forecast);
            expect(countForecastOfForecastGrossGMV).toEqual(monthsForActualsForGrossGMV);
    
            let countForecastOfGrandTotalOfForecastTotalsGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.grandTotal.forecast);
            expect(countForecastOfGrandTotalOfForecastTotalsGrossGMV).toEqual(monthsForActualsForGrossGMV)
    
            let countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.totalAfterExcludingDepartments.forecast);
            expect(countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossGMV).toEqual(monthsForActualsForGrossGMV);
    
            let countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.totalOfExcludingDepartments[0].forecast);
            expect(countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossGMV).toEqual(monthsForActualsForGrossGMV);
    
            // VALIDATION OF GROSS UNITS
            debug.log("Start Date For Gross Units SBU View Slot " + slotId + ": ", String(startDateForGrossUnits));
    
            let actualsStartYearForGrossUnits = parseInt(startDateForGrossGMV.substring(0, 4));
            let actualsStartMonthForGrossUnits = parseInt(startDateForGrossGMV.substring(4, 7));
    
            debug.log("Actuals Start Year for Gross Units SBU View Slot " + slotId + ": ", actualsStartYearForGrossUnits);
            debug.log("Actuals Start Month for Gross Units SBU View Slot " + slotId + ": ", actualsStartMonthForGrossUnits);
    
            let monthsForActualsForGrossUnits = CurrentDemandActualsValidation.calculateNumberOfMonths(actualsStartMonthForGrossUnits, actualsStartYearForGrossUnits, actualsEndMonth, actualsEndYear);
    
            debug.log("Number of Months Gross Units SBU View Slot " + slotId + ": ", monthsForActualsForGrossUnits);
    
            let countForecastOfForecastGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecast[0].forecast);
            expect(countForecastOfForecastGrossUnits).toEqual(monthsForActualsForGrossUnits);
    
            let countForecastOfGrandTotalOfForecastTotalsGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.grandTotal.forecast);
            expect(countForecastOfGrandTotalOfForecastTotalsGrossUnits).toEqual(monthsForActualsForGrossUnits)
    
            let countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.totalAfterExcludingDepartments.forecast);
            expect(countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossUnits).toEqual(monthsForActualsForGrossUnits);
    
            let countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataSBUViewResponseBody.forecastTotals.totalOfExcludingDepartments[0].forecast);
            expect(countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossUnits).toEqual(monthsForActualsForGrossUnits);
    
        });

        test("Verifying current demand actuals data for non Yoy metrics for slot " + slotId + " Channel View", async ({ request }) => {
            let currentDemandDataChannelViewResponse;
            
            testDataFile.payloadForCurrentDemandActualsValidation.organizationalLevel = "BASE_CHANNEL";
            currentDemandDataChannelViewResponse = await CurrentDemandActualsValidation.getDemandScenarioForecastBySlot(request, testDataFile.endpointForCurrentDemandActualsValidation, testDataFile.payloadForCurrentDemandActualsValidation, slotId);
    
            let currentDemandDataChannelViewResponseBody;
            currentDemandDataChannelViewResponseBody = await currentDemandDataChannelViewResponse.json();
            
            let actualsEndDate = currentDemandDataChannelViewResponseBody.cutOffDate;
            debug.log("Actuals end Date Channel View Slot " + slotId + ": ", actualsEndDate);
    
            let actualsEndYear = parseInt(actualsEndDate.substring(0, 4));
            debug.log("Acutals End Year Channel View Slot " + slotId + ": ", actualsEndYear);
    
            let actualsEndMonth = parseInt(actualsEndDate.substring(5, 7))
            debug.log("Actuals End Month Channel View Slot " + slotId + ": ", actualsEndMonth);
    
            let actualsStartMonth;
            let actualsStartYear;
    
            if(actualsEndMonth == 12) {
                actualsStartMonth = 1;
                actualsStartYear = actualsEndYear-4;
            } else if(actualsEndMonth == 1) {
                actualsStartMonth = 12;
                actualsStartYear = actualsEndYear-5;
            } else {
                actualsStartMonth = actualsEndMonth + 1;
                actualsStartYear = actualsEndYear-5;
            }
    
            debug.log("Actuals start year Channel View Slot " + slotId + ": ", actualsStartYear);
            debug.log("Actuals start month Channel View Slot " + slotId + ": ", actualsStartMonth);
    
            // VALIDATION OF ALL THE METRICS EXCEPT GROSS GMV AND GROSS UNITS
    
            // Validation for forecast inside forecast of response 
            let countForecastOfForecast = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecast[0].forecast);
            expect(countForecastOfForecast).toEqual(monthsInFiveYears);
    
            // Validation for forecast inside grandTotal inside forecastTotals
            let countForecastOfGrandTotalOfForecastTotals = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.grandTotal.forecast);
            expect(countForecastOfGrandTotalOfForecastTotals).toEqual(monthsInFiveYears);
    
            let countForecastOfTotalAfterExcludingDepartmentsOfForecastTotals = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.totalAfterExcludingDepartments.forecast);
            expect(countForecastOfTotalAfterExcludingDepartmentsOfForecastTotals).toEqual(monthsInFiveYears);
    
            let countForecastOfTotalOfExcludingDepartmentsOfForecastTotals = CurrentDemandActualsValidation.validateActualsData(actualsStartMonth, actualsStartYear, actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.totalOfExcludingDepartments[0].forecast);
            expect(countForecastOfTotalOfExcludingDepartmentsOfForecastTotals).toEqual(monthsInFiveYears);
    
    
            // VALIDATION OF GROSS GMV
    
            let reportsKpiResponse;
            reportsKpiResponse = await CurrentDemandActualsValidation.getActualsStartDateFromUFM(request, testDataFile.endpointForReportsMyKPI)
    
            let reportsKpiResponseBody;
            reportsKpiResponseBody = await reportsKpiResponse.json();
    
            let rowData = reportsKpiResponseBody.rowData;
            let startDateForGrossGMV = String(CurrentDemandActualsValidation.getMinYear(rowData[0]));
            let startDateForGrossUnits = String(CurrentDemandActualsValidation.getMinYear(rowData[1]));
    
            debug.log("Start Date For Gross GMV Channel View Slot " + slotId + ": ", String(startDateForGrossGMV));
    
            let actualsStartYearForGrossGMV = parseInt(startDateForGrossGMV.substring(0, 4));
            let actualsStartMonthForGrossGMV = parseInt(startDateForGrossGMV.substring(4, 7));
    
            debug.log("Actuals Start Year for Gross GMV Channel View Slot " + slotId + ": ", actualsStartYearForGrossGMV);
            debug.log("Actuals Start Month for Gross GMV Channel View Slot " + slotId + ": ", actualsStartMonthForGrossGMV);
    
            let monthsForActualsForGrossGMV = CurrentDemandActualsValidation.calculateNumberOfMonths(actualsStartMonthForGrossGMV, actualsStartYearForGrossGMV, actualsEndMonth, actualsEndYear);
    
            debug.log("Number of Months Channel View Slot " + slotId + ": ", monthsForActualsForGrossGMV);
    
            let countForecastOfForecastGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecast[0].forecast);
            expect(countForecastOfForecastGrossGMV).toEqual(monthsForActualsForGrossGMV);
    
            let countForecastOfGrandTotalOfForecastTotalsGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.grandTotal.forecast);
            expect(countForecastOfGrandTotalOfForecastTotalsGrossGMV).toEqual(monthsForActualsForGrossGMV)
    
            let countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.totalAfterExcludingDepartments.forecast);
            expect(countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossGMV).toEqual(monthsForActualsForGrossGMV);
    
            let countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossGMV = CurrentDemandActualsValidation.validateActualsDataForGrossGmv(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.totalOfExcludingDepartments[0].forecast);
            expect(countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossGMV).toEqual(monthsForActualsForGrossGMV);
    
            // VALIDATION OF GROSS UNITS
            debug.log("Start Date For Gross Units Channel View Slot " + slotId + ": ", String(startDateForGrossUnits));
    
            let actualsStartYearForGrossUnits = parseInt(startDateForGrossGMV.substring(0, 4));
            let actualsStartMonthForGrossUnits = parseInt(startDateForGrossGMV.substring(4, 7));
    
            debug.log("Actuals Start Year for Gross Units Channel View Slot " + slotId + ": ", actualsStartYearForGrossUnits);
            debug.log("Actuals Start Month for Gross Units Channel View Slot " + slotId + ": ", actualsStartMonthForGrossUnits);
    
            let monthsForActualsForGrossUnits = CurrentDemandActualsValidation.calculateNumberOfMonths(actualsStartMonthForGrossUnits, actualsStartYearForGrossUnits, actualsEndMonth, actualsEndYear);
    
            debug.log("Number of Months Gross Units Channel View Slot " + slotId + ": ", monthsForActualsForGrossUnits);
    
            let countForecastOfForecastGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecast[0].forecast);
            expect(countForecastOfForecastGrossUnits).toEqual(monthsForActualsForGrossUnits);
    
            let countForecastOfGrandTotalOfForecastTotalsGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.grandTotal.forecast);
            expect(countForecastOfGrandTotalOfForecastTotalsGrossUnits).toEqual(monthsForActualsForGrossUnits)
    
            let countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.totalAfterExcludingDepartments.forecast);
            expect(countForecastOfTotalAfterExcludingDepartmentsOfForecastTotalsGrossUnits).toEqual(monthsForActualsForGrossUnits);
    
            let countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossUnits = CurrentDemandActualsValidation.validateActualsDataForGrossUnits(actualsEndMonth, actualsEndYear, currentDemandDataChannelViewResponseBody.forecastTotals.totalOfExcludingDepartments[0].forecast);
            expect(countForecastOfTotalOfExcludingDepartmentsOfForecastTotalsGrossUnits).toEqual(monthsForActualsForGrossUnits);
        });
        
    });

});