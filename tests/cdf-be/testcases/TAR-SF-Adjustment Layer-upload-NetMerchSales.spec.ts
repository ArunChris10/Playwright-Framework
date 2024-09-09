import { test } from "../../common/fixtures/test-hook"
import { AdjustmentUploadLayer } from "../fixtures/adjustment-upload-layer-utils"

test.describe("Adjustment Layer - Upload - Net Merch Sales", { tag: "@Regression @ibg-service-scenario-financials @Adjustment Layer-upload @AdjustmentLayerUploadNetMerchSales" }, () => {
    test("Verify that user can edit Net Merch Sales data and verify Demand Output matches data in the new layer", async ({ request }) => {
        await AdjustmentUploadLayer.testExcelUploadAndAssertResponse(request, 'month', 'Net Merch Sales', 'gmv')
    })
})