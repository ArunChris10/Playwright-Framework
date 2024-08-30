import { test } from "../../common/fixtures/test-hook"
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils"

test.describe("Adjustment Layer - Upload Monthly", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer-upload @AdjustmentLayerUploadMonthly" }, () => {
    test("Verify that user can edit data on a monthly level using upload and verify Demand Output matches data in the new layer", async ({ request }) => {
        await AdjustmentUploadLayer.testExcelUploadAndAssertResponse(request, 'month')
    })
})