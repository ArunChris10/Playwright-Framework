import { test } from "../../common/fixtures/test-hook"
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils"

test.describe("Adjustment Layer - Upload Quarterly", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer-upload @AdjustmentLayerUploadQuarterly" }, () => {
    test("Verify that user can edit data on a quarterly level using upload and verify Demand Output matches data in the new layer", async ({ request }) => {
        await AdjustmentUploadLayer.testExcelUploadAndAssertResponse(request, 'quarter')
    })
})