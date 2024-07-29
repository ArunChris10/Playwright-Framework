import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';


test.describe("Verify we need to sort forecast on the basis of createdDate in descending order", { tag: "@Regression @verifysortforecast @ibg-service-scenario-financials @DemandWorkSpace" }, () => {


  test("Verify that forecast is on the basis of createdDate in descending order", async ({
    request
  }) => {
    await test.step("Get all demand stack and verify date created in descending order", async () => {
        let demandworkspaceResponse = await CdfUtility.fetchallForecast(request);
        for (let i = 1; i < demandworkspaceResponse.length; i++) {
            const prevDate = new Date(demandworkspaceResponse[i - 1].dateCreated).getTime();
            const currDate = new Date(demandworkspaceResponse[i].dateCreated).getTime();
            expect(prevDate).toBeGreaterThanOrEqual(currDate);
        }
    })
  });

})
