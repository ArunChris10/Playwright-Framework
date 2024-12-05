import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { test } from "../tests/common/fixtures/test-hook";
import { Utility } from "../tests/common/fixtures/utils";
import commonData from "../tests/ufm-be/constants/common.json";
import { SOTUtility } from "../tests/ufm-be/fixtures/SOTUtility";
import { ForecastUtility } from "../tests/ufm-be/fixtures/forecast-utils";
import { UfmUtility } from "../tests/ufm-be/fixtures/ufm-utils";
import mappingApi from "../tests/ufm-be/testdata/mapping-api.json";

test.describe(
  "Validating SOT values with IBG Values",
  { tag: "@sot_validation" },
  () => {
    test.describe.configure({ timeout: 3_300_000, mode: "parallel" });
    const directoryPath = "./tests/ufm-be/validation-files/";
    let filePath: any = [];

    fs.readdirSync(directoryPath).forEach((file) => {
      if (file.endsWith(".xlsx")) {
        filePath.push(path.join(directoryPath, file));
      }
    });
    filePath.forEach((file) => {
      let lobName = file.substring(
        file.lastIndexOf("/") + 1,
        file.lastIndexOf(".")
      );
      test(`SOT Validation for ${lobName}`, async ({ request }) => {
        let monthToValidate, mappingResponse, yearMonthKey: any;
        let scenario_details, isNewCreated;
        let finalData: any = [];

        const dimensions = commonData.DIMENSIONS;

        const endpointURL = `${process.env.apiBaseURLUFM}${mappingApi.endpoint}`;

        const data = xlsx.readFile(file, { type: "binary" });
        let sotDatas: any = await Utility.readExcelreturnJson(
          file,
          data.SheetNames[1]
        );

        const dynamicSheetName = data.SheetNames[1];
        [yearMonthKey, monthToValidate] = await SOTUtility.getMonthYearfromKey(
          sotDatas[dynamicSheetName]
        );

        const responseData = await request.get(endpointURL, {
          params: {
            dim_val_id: await UfmUtility.getMapping(lobName, "dim_val_id"),
            dim_id: commonData.lob_dim_id,
            classification_id: commonData.classification_id,
          },
        });

        mappingResponse = await responseData.json();

        //Getting forecast details
        [scenario_details, isNewCreated] =
          await ForecastUtility.getOrCreateForecastIfNotExists(
            lobName,
            request
          );

        let AlldriversList = await SOTUtility.getDrivers(
          lobName,
          commonData.All_Driver_Type,
          request
        );
        let inputdriversList = await SOTUtility.getDrivers(
          lobName,
          commonData.Input_Driver_Type,
          request
        );

        //Reading JSON for each node id defined in SOT file and creating payload and report
        for (const sotData in sotDatas[dynamicSheetName]) {
          const finalPayload: any[] = [];

          const processDimensions = dimensions.reduce(
            async (acc, dimension) => {
              await SOTUtility.processDimension(
                sotDatas[dynamicSheetName][sotData],
                finalPayload,
                dimension,
                mappingResponse
              );
              return acc;
            },
            Promise.resolve()
          );

          await processDimensions;

          let dimensionfilter = await UfmUtility.filterPayload(finalPayload);
          let driversList: any;
          if (
            sotDatas[dynamicSheetName][sotData]["Calc/Input"]
              .toLowerCase()
              .startsWith("calc")
          ) {
            driversList = AlldriversList;
          } else {
            driversList = inputdriversList;
          }

          let response = await SOTUtility.getKpiPayloads(
            lobName,
            scenario_details,
            sotDatas[dynamicSheetName][sotData]["Node ID"].split(" "),
            monthToValidate.toString(),
            dimensionfilter,
            driversList,
            request
          );
          let ibgValue, sotValue, variance, diff;
          sotValue = sotDatas[dynamicSheetName][sotData][yearMonthKey];
          let NodeName = sotDatas[dynamicSheetName][sotData]["Node Name"];
          if (response.length == 0) {
            ibgValue =
              "No node with node id " +
              sotDatas[dynamicSheetName][sotData]["Node ID"] +
              " found";
            variance = "N/A";
          } else if (response.rowData.length == 0) {
            ibgValue = "No data found";
            variance = "N/A";
          } else {
            ibgValue = response.rowData[0][monthToValidate].actuals.value;
          }
          if (sotValue == undefined) {
            sotValue = "";
            variance = "N/A";
          } else {
            variance = (ibgValue - sotValue).toFixed(2);
            diff = (1 - Math.abs(sotValue / ibgValue)) * 100;
          }
          console.log(
            `\nNODE NAME - ${NodeName}\nSOT VALUES -> ${sotValue} \nIBG VALUES -> ${ibgValue}\nVARIANCE -> ${variance}\nDIFF% -> ${diff}`
          );
          finalData.push({
            "Node Nbr": sotDatas[dynamicSheetName][sotData]["Node Nbr"],
            "Node ID": sotDatas[dynamicSheetName][sotData]["Node ID"],
            "Node Name": sotDatas[dynamicSheetName][sotData]["Node Name"],
            "Calc/Input": sotDatas[dynamicSheetName][sotData]["Calc/Input"],
            Granularity: sotDatas[dynamicSheetName][sotData]["Granularity"],
            "GL (if applicable)":
              sotDatas[dynamicSheetName][sotData]["GL (if applicable)"],
            Entity: sotDatas[dynamicSheetName][sotData]["Entity"],
            Channel: sotDatas[dynamicSheetName][sotData]["Channel"],
            SBU: sotDatas[dynamicSheetName][sotData]["SBU"],
            Department: sotDatas[dynamicSheetName][sotData]["Department"],
            [yearMonthKey]: sotValue,
            "IBG Values": ibgValue,
            Variance: variance,
            "Diff%": diff,
          });
          //tabledata += `<tr><td>${sotDatas[dynamicSheetName][sotData]["Node ID"]}</td><td>${NodeName}</td><td>${sotValue}</td><td>${ibgValue}</td><td>${variance}</td></tr>`;
        }

        //Creating End HTML Report
        // SOTUtility.createReport(tabledata, lobName);

        //Creating Validation Excel file from json data
        SOTUtility.jsonToExcel(
          finalData,
          `./tests/ufm-be/validation-output/${lobName}_validation.xlsx`
        );
      });
    });
  }
);
