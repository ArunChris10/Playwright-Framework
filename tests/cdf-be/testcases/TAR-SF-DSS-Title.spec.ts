import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import testdatafileCreateManualAdjustment from "../testdata/create-manual-adjustment-layer.json";
import testdatafileCreateEMT from "../testdata/create-emt-layer.json";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";

test.describe(
    "Verify DSS displays title name, timestamp and time on layers",
    {
        tag: "@Regression @TitleAndTimeStamp @ibg-service-scenario-financials @DSS",
    },
    () => {
        let demandId;
        let dssTitle;
        let dssTimeStamp;
        let demandScenarioDetails;
        const currDate = new Date().getDate();
        const currTime = new Date().getTime();


        test.beforeAll(async ({ request }) => {
            demandId = await CdfUtility.createScenario(
              request
            );

            demandScenarioDetails = await AllocationUtils.getDemandStackDetails(
              request,
              demandId
            );
        });

        test.afterAll(async ({ request }) => {
            await CdfUtility.deleteScenario(request, demandId);
        });

        test("Verify it should show current title name and created date and last updated time stamp", async ({
            request,
        }) => {
            let demandScenarioResponse;
            
            await test.step("get dss info", async () => {
                demandScenarioResponse = await CdfUtility.getDssInfo(
                  request,
                  demandId
                );
            });
            dssTitle = demandScenarioResponse.title;
            expect(dssTitle).not.toBeEmpty;
            expect(dssTitle).toContain("Reg - AutoTest - ");

            const dateCreated = new Date(demandScenarioResponse.forecastInfoDTO.forecastInfo.dateCreated).getDate();
            expect(dateCreated).toBeLessThanOrEqual(currDate);
            
            dssTimeStamp = new Date(demandScenarioResponse.forecastInfoDTO.forecastInfo.dateCreated).getTime();
            expect(dssTimeStamp).not.toBeEmpty;
            expect(dssTimeStamp).toBeLessThanOrEqual(currTime);
        });

        test("Verify Time in the Last Updated field on Split, Intel and LP Forecast view.", async ({
          request,
        }) => {
            let layerUpdatedInfoList;
            let demandScenarioResponse;
            let createEmtLayerDataResponse;
            let createAdjustmentLayerDataResponse;

            const layerId =
              await AllocationUtils.verifyGeneratePreviewAllocationSplitLayer(
                request,
                demandId,
                demandScenarioDetails
              );

            await AllocationUtils.verifySaveAllocationSplitLayer(
                request,
                layerId,
                demandId,
                demandScenarioDetails
            );
              
            await LockUnlockUtility.lockDSSData(request, demandId);

            createAdjustmentLayerDataResponse = await AdjustmentUtility.createManualAdjustmentLayer(
              request,
              demandId,
              testdatafileCreateManualAdjustment
            );

            expect(createAdjustmentLayerDataResponse).toBeOK();

            await LockUnlockUtility.lockDSSData(request, demandId);


            createEmtLayerDataResponse = await AdjustmentUtility.createEMTLayer(
              request,
              demandId,
              testdatafileCreateEMT
            );

            await test.step("get dss info", async () => {
                demandScenarioResponse = await CdfUtility.getDssInfo(
                  request,
                  demandId
                );
            });

            layerUpdatedInfoList =
              demandScenarioResponse.forecastInfoDTO.layerUpdatedInfos;

            for (let j = 0; j < layerUpdatedInfoList.length; j++) {
                const layerTypeList = [
                  "FORECAST",
                  "CHANNEL_SPLIT",
                  "HIGHLIGHTER",
                  "INTEL",
                ];

                if (layerTypeList.includes(layerUpdatedInfoList[j].layerType)) {
                  let getLastUpdatedTime = new Date(
                    layerUpdatedInfoList[j].lastUpdatedTime
                  ).getDate();

                  expect(getLastUpdatedTime).not.toBeNull;
                  expect(getLastUpdatedTime).toBeLessThanOrEqual(currDate);
                }
            }
        });
});
