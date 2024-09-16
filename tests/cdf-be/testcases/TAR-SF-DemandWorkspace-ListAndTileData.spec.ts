import { test } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { expect } from '../../common/fixtures/test-hook';
import currentDemandData from '../testdata/current-demand.json'


test.describe("Verify List and tile view should show below mentioned fields last updated date (last saved) last updated by DS date Sync date", { tag: "@Regression @verifylisttitleview @ibg-service-scenario-financials @DemandWorkSpace" }, () => {
let publishDssResponse;

  test("Verify the list and title view show have the fields such as last update data, last updated by DS date", async ({
    request
  }) => {
    await test.step("Verify the list and title view show have the fields such as last update data, last updated by DS date", async () => {
        let forecastinfolist = await CdfUtility.forecastInfoList(request);
        let demandworkspaceResponse = await CdfUtility.fetchallForecast(request);
        for(let j=0;j<forecastinfolist.length;j++){
            const datecreated = new Date(forecastinfolist[j].dateCreated).getTime();
            const updatedbyactual = demandworkspaceResponse[j].forecastInfoDTO.forecastInfo.updatedBy;
            for (let i = 0; i < forecastinfolist.length; i++) {
                const forecastId = demandworkspaceResponse[i].forecastInfoDTO.forecastInfo.id;
                if(forecastId == forecastinfolist[j].id){
                    const currDate = new Date(demandworkspaceResponse[i].forecastInfoDTO.forecastInfo.dateCreated).getTime();
                    const updatedbyexpected = demandworkspaceResponse[i].forecastInfoDTO.forecastInfo.updatedBy;
                    const lastupdatedate = new Date(demandworkspaceResponse[i].lastUpdatedTime).getTime();
                    const currentUTCDate = new Date();
                    const currentUTC = currentUTCDate.getTime() + (currentUTCDate.getTimezoneOffset() * 60000);
                    expect(lastupdatedate).toBeLessThanOrEqual(currentUTC);
                    expect(updatedbyactual).toEqual(updatedbyexpected);
                    expect(datecreated).toEqual(currDate);
                    break;
                }
            }
        }
    });
    await test.step("Publish to current demand and verify sync date ", async () => {
        let forecastinfolist = await CdfUtility.forecastInfoList(request);
        let demandworkspaceResponse = await CdfUtility.fetchallForecast(request);
        for(let j=0;j<forecastinfolist.length;j++){
            const datecreated = new Date(forecastinfolist[j].dateCreated).getTime();
            const updatedbyactual = demandworkspaceResponse[j].createdByUserName;
            for (let i = 0; i < demandworkspaceResponse.length; i++) {
                const forecastId = demandworkspaceResponse[i].forecastInfoDTO.forecastInfo.id;
                if(forecastId == forecastinfolist[j].id){
                    publishDssResponse = await CdfUtility.publishDSS(request, demandworkspaceResponse[i].demandStackScenarioId, currentDemandData.slotId);
                    await CdfUtility.delay(30000);
                    let scenarioList = await CdfUtility.fetchallForecast(request);
                    let scenario = scenarioList.filter(item => item.demandStackScenarioId === forecastinfolist[j].demandStackScenarioId);
                    expect(scenario.syncDate).not.toBeNull();
                    return;
                }
            }
        }
    });
})
})