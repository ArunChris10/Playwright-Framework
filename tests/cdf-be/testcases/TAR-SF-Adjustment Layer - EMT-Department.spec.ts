import { test, expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { CdfUtility } from "../fixtures/cdf-utils";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import testDataEMTLayer from "../testdata/create-emt-layer.json";

test.describe(
  "Verify User can create EMT Adjustment layer at Department and result grid is updated on prorated ratio of other dimension",
  {
    tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer - EMT",
  },
  () => {
    let demandId;
    let layerId;
    let forecastVersion;
    let payloadExtension;
    let initialValues: number[] = [];
    let endValues: number[] = [];
    let allocation = testDataEMTLayer.emtGMV11AllocationDepartment;
    let deAllocation = testDataEMTLayer.emtGMV11DeAllocationDepartment;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
      forecastVersion =
        CdfUtility.createScenarioPayload.forecastInfoDTO.forecastInfo.version;
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify EMT layer updates at Department dimension", async ({
      request,
    }) => {
      await test.step("Fetch the get-demand-scenario-forecast initially", async () => {
        // need SBU forcasts and SBU's departments forecasts
        payloadExtension = [
          {
            version: forecastVersion,
          },
          {
            version: forecastVersion,
            organizationalLevel: "DEPARTMENT",
            loadHeirarchyParams: {
              baseChannel: [],
              baseChannelIds: [],
              sbu: [allocation.sbu, deAllocation.sbu],
              sbuIds: [allocation.sbuId, deAllocation.sbuId],
              organizationalLevel: "DEPARTMENT",
            },
          },
        ];
        const forecastResponses = await Promise.all(
          payloadExtension.map((p) =>
            CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
              request,
              demandId,
              p
            )
          )
        );
        initialValues.push(
          Utility.roundToDecimals(
            forecastResponses[0].forecast
              .find((f) => f.sbuId === allocation.sbuId)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        initialValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .find(
                (f) =>
                  f.sbuId === allocation.sbuId &&
                  f.departmentId === allocation.department.id
              )
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        initialValues.push(
          Utility.roundToDecimals(
            forecastResponses[0].forecast
              .find((f) => f.sbuId === deAllocation.sbuId)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        initialValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .find(
                (f) =>
                  f.sbuId === deAllocation.sbuId &&
                  f.departmentId === deAllocation.department.id
              )
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
      });

      await test.step("Lock DSS", async () => {
        const lockResponse = await LockUnlockUtility.lockDSSData(
          request,
          demandId
        );
        expect(lockResponse).toBeOK();
      });

      await test.step("Create the EMT Layer", async () => {
        testDataEMTLayer.payload.layers[0].forecastVersion = forecastVersion;
        testDataEMTLayer.payload.layers[0].totalBudget = 0;
        testDataEMTLayer.payload.layers[0].allocationSbus = [];
        testDataEMTLayer.payload.layers[0].deAllocationSbus = [];
        testDataEMTLayer.payload.layers[0].allocationDepartments = [
          allocation.department,
        ] as any;
        testDataEMTLayer.payload.layers[0].deAllocationDepartments = [
          deAllocation.department,
        ] as any;

        const createEMTLayerResponse = await AdjustmentUtility.createEMTLayer(
          request,
          demandId,
          testDataEMTLayer
        );
        expect(createEMTLayerResponse).toBeOK();

        const createEMTLayerResponseBody = await createEMTLayerResponse.json();
        layerId = createEMTLayerResponseBody[0].layerId;
      });

      await test.step("Verify forecast was updated with EMT layer", async () => {
        // need SBU forcasts and SBU's departments forecasts
        payloadExtension = [
          {
            version: forecastVersion,
            layerId: [layerId],
          },
          {
            version: forecastVersion,
            layerId: [layerId],
            organizationalLevel: "DEPARTMENT",
            loadHeirarchyParams: {
              baseChannel: [],
              baseChannelIds: [],
              sbu: [allocation.sbu, deAllocation.sbu],
              sbuIds: [allocation.sbuId, deAllocation.sbuId],
              organizationalLevel: "DEPARTMENT",
            },
          },
        ];
        const forecastResponses = await Promise.all(
          payloadExtension.map((p) =>
            CdfUtility.getDemandScenarioByIdWithMinimumDataPayload(
              request,
              demandId,
              p
            )
          )
        );
        endValues.push(
          Utility.roundToDecimals(
            forecastResponses[0].forecast
              .find((f) => f.sbuId === allocation.sbuId)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        endValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .find(
                (f) =>
                  f.sbuId === allocation.sbuId &&
                  f.departmentId === allocation.department.id
              )
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        endValues.push(
          Utility.roundToDecimals(
            forecastResponses[0].forecast
              .find((f) => f.sbuId === deAllocation.sbuId)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        endValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .find(
                (f) =>
                  f.sbuId === deAllocation.sbuId &&
                  f.departmentId === deAllocation.department.id
              )
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );

        // assert allocation
        expect(endValues[0] - initialValues[0]).toBe(
          allocation.department.value
        );
        expect(endValues[1] - initialValues[1]).toBe(
          allocation.department.value
        );
        expect(endValues[2] - initialValues[2]).toBe(
          deAllocation.department.value
        );
        expect(endValues[3] - initialValues[3]).toBe(
          deAllocation.department.value
        );
      });
    });
  }
);
