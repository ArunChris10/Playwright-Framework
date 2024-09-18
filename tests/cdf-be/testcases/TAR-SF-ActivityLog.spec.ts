import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import testdatafileCreateManualAdjustment from "../testdata/create-manual-adjustment-layer.json";
import testdatafileDeleteManualAdjustment from "../testdata/delete-manual-adjustment-layer.json";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import { AllocationUtils } from "../fixtures/allocation-utils";
import activityLogData from "../testdata/activity-log-data.json";

test.describe(
  "Verify Activity can update",
  {
    tag: "@Regression @ActivityLogActions @ibg-service-scenario-financials @ActivityLog",
  },
  () => {
    let demandId;
    let demandScenarioDetails;
    let getCreateManualAdjustmentLayerDataResponseBody;
    let layerId;
    let createAdjustmentLayerDataResponse;
    let activityLogsResponse;
    let layerIdForComment;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
      demandScenarioDetails = await AllocationUtils.getDemandStackDetails(
        request,
        demandId
      );
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify user can be able to track all DSS change details in the Activity log", async ({
      request,
    }) => {

        await test.step("Create allocation layer", async () => {
            layerId =
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
        });

        await test.step("Delete allocation layer", async () => {
            await AllocationUtils.deleteAllocationLayer(request, demandId, layerId);
        });
        await test.step("Create adjustment layer", async () => {
          
        await LockUnlockUtility.lockDSSData(request, demandId);
        testdatafileCreateManualAdjustment.payload.layers[0].forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version
            createAdjustmentLayerDataResponse =
            await AdjustmentUtility.createManualAdjustmentLayer(
                request,
                demandId,
                testdatafileCreateManualAdjustment
            );

            getCreateManualAdjustmentLayerDataResponseBody =
            await createAdjustmentLayerDataResponse.json();

            layerId = getCreateManualAdjustmentLayerDataResponseBody[0].layerId;
        });
        await test.step("Delete adjustment layer", async () => {
            await AdjustmentUtility.deleteManualAdjustmentLayer(
                request,
                layerId,
                demandId,
                testdatafileDeleteManualAdjustment
            );
        });
        await test.step("Archive dss", async () => {
            await CdfUtility.archiveScenario(request, demandId);
        });
        await test.step("Unarchive dss", async () => {
            await CdfUtility.unarchiveScenario(
                request,
                demandId
            );
        });

        await test.step("Verify actions in activity log", async () => {
            await CdfUtility.delay(100000);

            
            activityLogsResponse = await CdfUtility.getActivityLogs(
                request,
                demandId
            );
            for (let i = 0; i < activityLogsResponse.length; i++) {
                let action = activityLogsResponse[i].action;
                if (action){
                    layerIdForComment = activityLogsResponse[i].id;
                } 

                switch (action) {
                    case activityLogsResponse.action_allocation:
                        expect(action).toEqual(activityLogsResponse.action_allocation);
                        break;
                    case activityLogsResponse.delete_action_allocation:
                        expect(action).toEqual(activityLogsResponse.delete_action_allocation);
                        break;
                    case activityLogData.action_archived:
                        expect(action).toEqual(activityLogData.action_archived);
                        break;
                    case activityLogData.action_unarchived:
                        expect(action).toEqual(activityLogData.action_unarchived);
                        break;
                    case createAdjustmentLayerDataResponse.action_adjustment:
                        expect(action).toEqual(createAdjustmentLayerDataResponse.action_adjustment);
                        break;
                    case activityLogData.delete_action_adjustment:
                        expect(action).toEqual(activityLogData.delete_action_adjustment);
                        break;
                    default:
                        break;
                }
            }
        });
    });

    test("Verify user can add comment by clicking on three dots against each activity", async ({
      request,
    }) => {
        let getComment;

        CdfUtility.updateActivityLogsComment(
          request,
          layerIdForComment,
          activityLogData.comment
        );

        await CdfUtility.delay(50000);

        activityLogsResponse = await CdfUtility.getActivityLogs(
            request,
            demandId
        );

        for (let i = 0; i < activityLogsResponse.length; i++) {
            let isId = activityLogsResponse[i].id;
            if (isId === layerIdForComment) {
                getComment = activityLogsResponse[i].comment;
                expect(getComment).toEqual(activityLogData.comment);
            } 
        }

    });
  }
);