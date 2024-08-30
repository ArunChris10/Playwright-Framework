import { test, expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import { CdfUtility } from "../fixtures/cdf-utils";
import { LockUnlockUtility } from "../fixtures/lock-unlock-utils";
import { AdjustmentUtility } from "../fixtures/adjustment-utils";
import testDataEMTLayer from "../testdata/create-emt-layer.json";

test.describe(
  "Verify User can create EMT Adjustment layer at SBU and result grid is updated on prorated ratio of other dimension",
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
    let allocation = testDataEMTLayer.emtGMV11Allocation;
    let deAllocation = testDataEMTLayer.emtGMV11DeAllocation;

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
      forecastVersion =
        CdfUtility.createScenarioPayload.forecastInfoDTO.forecastInfo.version;
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify EMT layer updates at SBU dimension", async ({ request }) => {
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
              sbu: [allocation.name, deAllocation.name],
              sbuIds: [allocation.id, deAllocation.id],
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
              .find((f) => f.sbuId === allocation.id)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        initialValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .filter((f) => f.sbuId === allocation.id)
              .reduce(
                (a, b) => a + b.forecast.reduce((c, d) => c + d.amount, 0),
                0
              )
          )
        );
        initialValues.push(
          Utility.roundToDecimals(
            forecastResponses[0].forecast
              .find((f) => f.sbuId === deAllocation.id)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        initialValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .filter((f) => f.sbuId === deAllocation.id)
              .reduce(
                (a, b) => a + b.forecast.reduce((c, d) => c + d.amount, 0),
                0
              )
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
        testDataEMTLayer.payload.layers[0].allocationSbus = [allocation] as any;
        testDataEMTLayer.payload.layers[0].deAllocationSbus = [
          deAllocation,
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
              sbu: [allocation.name, deAllocation.name],
              sbuIds: [allocation.id, deAllocation.id],
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
              .find((f) => f.sbuId === allocation.id)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        endValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .filter((f) => f.sbuId === allocation.id)
              .reduce(
                (a, b) => a + b.forecast.reduce((c, d) => c + d.amount, 0),
                0
              )
          )
        );
        endValues.push(
          Utility.roundToDecimals(
            forecastResponses[0].forecast
              .find((f) => f.sbuId === deAllocation.id)
              .forecast.reduce((a, b) => a + b.amount, 0)
          )
        );
        endValues.push(
          Utility.roundToDecimals(
            forecastResponses[1].forecast
              .filter((f) => f.sbuId === deAllocation.id)
              .reduce(
                (a, b) => a + b.forecast.reduce((c, d) => c + d.amount, 0),
                0
              )
          )
        );

        // dimension sums should be same
        expect(initialValues[0]).toBe(initialValues[1]);
        expect(initialValues[2]).toBe(initialValues[3]);
        expect(endValues[0]).toBe(endValues[1]);
        expect(endValues[2]).toBe(endValues[3]);

        // assert allocation
        expect(endValues[0] - initialValues[0]).toBe(allocation.value);
        expect(endValues[2] - initialValues[2]).toBe(deAllocation.value);
      });
    });
  }
);
