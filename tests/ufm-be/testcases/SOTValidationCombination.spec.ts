import { fail } from "assert";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { Dimensioncombination, SOTUtility } from "../fixtures/SOTUtility";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import mappingApi from "../testdata/mapping-api.json";

test.describe(
  "Validating SOT values with IBG Values",
  { tag: "@sotvalidation_combination" },
  () => {
    test.describe.configure({ timeout: 3_300_000, mode: "parallel" });
    const directoryPath = "./tests/ufm-be/validation-files/";
    let filePath: any = [];

    fs.readdirSync(directoryPath).forEach((file) => {
      if (file.endsWith(".xlsx") && !file.includes("$")) {
        filePath.push(path.join(directoryPath, file));
      }
    });

    //Getting LOB Name from Excel Validation File Name and then running script for all Files in parallel
    filePath.forEach((file) => {
      let lobName = file.substring(
        file.lastIndexOf("/") + 1,
        file.lastIndexOf(".")
      );
      try {
        test(`SOT Validation for ${lobName}`, async ({ request }) => {
          let monthsToValidate, mappingResponse, yearMonthKeys: any;
          let scenario_details, isNewCreated;
          let finalData: any = [];

          const dimensions = commonData.DIMENSIONS;

          const endpointURL = `${process.env.apiBaseURLUFM}${mappingApi.endpoint}`;

          const data = xlsx.readFile(file, { type: "binary" });

          //Getting First Sheet from Validation Workbook
          const dynamicSheetName = data.SheetNames[1];

          //Reading Excel Sheet and converting to JSON
          let sotDatas: any = await Utility.readExcelreturnJson(
            file,
            data.SheetNames[1]
          );

          //Getting Month and Year as defined in excel it is as FY25 M1 - Making it 202501
          [yearMonthKeys, monthsToValidate] =
            await SOTUtility.getMonthYearfromKey(sotDatas[dynamicSheetName]);

          //Getting mapping response from API to get dimension values
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
          Utility.logIt(
            `Using Scenario Name - ${scenario_details["name"]}, Scenario Id - ${scenario_details["scenarioId"]}, Scenario Version - ${scenario_details["scenarioVersion"]}`
          );
          //Getting all drivers details
          let AlldriversList = await SOTUtility.getDrivers(
            lobName,
            commonData.All_Driver_Type,
            request
          );

          //Getting same set combination from excel sheet
          let combined_set = await Dimensioncombination.getCombination(
            sotDatas[dynamicSheetName]
          );

          //Reading JSON for each node id defined in SOT file and creating payload and report
          for (const sotData in combined_set) {
            const finalPayload: any[] = [];

            const processDimensions = dimensions.reduce(
              async (acc, dimension) => {
                await SOTUtility.processDimension(
                  combined_set[sotData][0],
                  finalPayload,
                  dimension,
                  mappingResponse
                );
                return acc;
              },
              Promise.resolve()
            );

            await processDimensions;
            let dimensionfilter;

            //Filtering payload based on if dimensions mapping has error or not
            if (Array.isArray(finalPayload) && finalPayload.length > 0) {
              if (
                Array.isArray(finalPayload[0]) &&
                finalPayload[0][0].includes("Error")
              ) {
                dimensionfilter = finalPayload
                  .map((error) => error[0])
                  .toString();
              } else {
                dimensionfilter = await UfmUtility.filterPayload(finalPayload);
              }
            } else {
              dimensionfilter = await UfmUtility.filterPayload(finalPayload);
            }

            let nodeIDList: any = [];
            for (const index in combined_set[sotData]) {
              nodeIDList.push(combined_set[sotData][index]["Node ID"]);
            }

            let response;
            if (!dimensionfilter.includes("Error")) {
              response = await SOTUtility.getKpiPayloads(
                lobName,
                scenario_details,
                nodeIDList,
                monthsToValidate,
                dimensionfilter,
                AlldriversList,
                request
              );
            }

            //Creating FInal Json for Each Node ID in Excel Sheet
            for (const nodeKey in combined_set[sotData]) {
              let node_row = {
                "Node Nbr": combined_set[sotData][nodeKey]["Node Nbr"],
                "Node ID": combined_set[sotData][nodeKey]["Node ID"],
                "Node Name": combined_set[sotData][nodeKey]["Node Name"],
                "Calc/Input": combined_set[sotData][nodeKey]["Calc/Input"],
                Granularity: combined_set[sotData][nodeKey]["Granularity"],
                "GL (if applicable)":
                  combined_set[sotData][nodeKey]["GL (if applicable)"],
                Entity: combined_set[sotData][nodeKey]["Entity"],
                Location: combined_set[sotData][nodeKey]["Location"],
                Channel: combined_set[sotData][nodeKey]["Channel"],
                SBU: combined_set[sotData][nodeKey]["SBU"],
                Department: combined_set[sotData][nodeKey]["Department"],
              };
              for (const year of yearMonthKeys) {
                if (combined_set[sotData][nodeKey][year] != undefined)
                  node_row[year] = combined_set[sotData][nodeKey][year];
                else node_row[year] = "";
              }

              //If no issue in dimension mapping then get data from IBG
              if (!dimensionfilter.includes("Error")) {
                let specificNode = response.rowData.filter(
                  (i) =>
                    i["nodeName"] == combined_set[sotData][nodeKey]["Node Name"]
                );

                for (const year of monthsToValidate) {
                  if (specificNode.length > 0) {
                    node_row["IBG_" + year] =
                      specificNode[0][year].actuals.value;
                  } else node_row["IBG_" + year] = "";
                }
              } else {
                node_row["IBG_" + monthsToValidate[0]] = dimensionfilter;
              }

              //Setting Map based on FY and Month Year conversion
              const keyValueMap = new Map();
              yearMonthKeys.forEach((key, index) => {
                const value = "IBG_" + monthsToValidate[index];
                keyValueMap.set(key, value);
              });

              // Creating Variance and Diff % based on IBG and SOT Values
              for (const [key, value] of keyValueMap) {
                if (
                  node_row.hasOwnProperty(key) &&
                  node_row.hasOwnProperty(value)
                ) {
                  node_row["Variance_" + key] = (
                    node_row[value] - node_row[key]
                  ).toFixed(2);
                  node_row["Variance_" + key] == "NaN"
                    ? (node_row["Variance_" + key] = "")
                    : (node_row["Variance_" + key] =
                        node_row["Variance_" + key]);
                  if (node_row[value] == "") node_row["Diff%_" + key] = "";
                  else {
                    node_row["Diff%_" + key] = (
                      (1 - Math.abs(node_row[key] / node_row[value])) *
                      100
                    ).toFixed(2);
                    node_row["Diff%_" + key] == "NaN"
                      ? (node_row["Diff%_" + key] = "")
                      : (node_row["Diff%_" + key] =
                          node_row["Diff%_" + key] + "%");
                  }
                } else {
                  node_row["Variance_" + key] = "";
                  node_row["Diff%_" + key] = "";
                }
              }
              finalData.push(node_row);
            }
            //tabledata += `<tr><td>${sotDatas[dynamicSheetName][sotData]["Node ID"]}</td><td>${NodeName}</td><td>${sotValue}</td><td>${ibgValue}</td><td>${variance}</td></tr>`;
          }

          //Creating End HTML Report
          // SOTUtility.createReport(tabledata, lobName);

          //Creating Validation Excel file from json data
          SOTUtility.jsonToExcel(
            finalData,
            `./tests/ufm-be/validation-output/${process.env.envName}_${lobName}_validation.xlsx`
          );
        });
      } catch {
        fail("Failed to get data - Issue In Validation file");
      }
    });
  }
);
