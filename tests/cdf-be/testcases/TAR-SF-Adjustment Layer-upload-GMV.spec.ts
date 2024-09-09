import { test } from "../../common/fixtures/test-hook"
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils"

test.describe("Adjustment Layer - Upload - GMV Shipped", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer-upload @AdjustmentLayerUploadGMV" }, () => {
    test("Verify that user can edit GMV Shipped data and verify Demand Output matches data in the new layer", async ({ request }) => {
        await AdjustmentUploadLayer.testExcelUploadAndAssertResponse(request, 'month', 'GMV Shipped')
    })
})