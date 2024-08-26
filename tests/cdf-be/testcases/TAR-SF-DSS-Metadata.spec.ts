import { test, expect } from "../../common/fixtures/test-hook";
import { CdfUtility } from "../fixtures/cdf-utils";
import { DemandBaseClass } from "../fixtures/demand-common-utils";

test.describe(
  "Verify DSS displays metadata and user can edit it",
  {
    tag: "@Regression @ibg-service-scenario-financials @DSS",
  },
  () => {
    let demandId;
    let dssTitle;
    let dssTimeStamp;
    let demandScenarioDetails;
    let editedDemandStackDetails;
    const currDate = new Date().getDate();
    const currTime = new Date().getTime();
    const editedTitle = "Edited Title";
    const editedDescription = "Edited Description";

    test.beforeAll(async ({ request }) => {
      demandId = await CdfUtility.createScenario(request);
    });

    test.afterAll(async ({ request }) => {
      await CdfUtility.deleteScenario(request, demandId);
    });

    test("Verify Page where they can see information and metadata on the demand stack", async ({
      request,
    }) => {
      demandScenarioDetails = await DemandBaseClass.getDemandStackDetails(
        request,
        demandId
      );
      dssTitle = demandScenarioDetails.title;
      expect(dssTitle).not.toBeEmpty;
      expect(dssTitle).toContain("Reg - AutoTest - ");

      const dateCreated = new Date(
        demandScenarioDetails.forecastInfoDTO.forecastInfo.dateCreated
      ).getDate();
      expect(dateCreated).toBeLessThanOrEqual(currDate);

      dssTimeStamp = new Date(
        demandScenarioDetails.forecastInfoDTO.forecastInfo.dateCreated
      ).getTime();
      expect(dssTimeStamp).not.toBeEmpty;
      expect(dssTimeStamp).toBeLessThanOrEqual(currTime);
    });

    test("Verify the Ability to Edit and save DSS name and Description fields", async ({
      request,
    }) => {
      await test.step("Get initial DSS info", async () => {
        demandScenarioDetails = await DemandBaseClass.getDemandStackDetails(
          request,
          demandId
        );
      });

      await test.step("Edit DSS and verify", async () => {
        editedDemandStackDetails = (
          await DemandBaseClass.editDemandStackDetails(
            request,
            demandId,
            demandScenarioDetails.forecastInfoDTO.forecastInfo.version,
            editedTitle,
            editedDescription
          )
        ).demandStackDTO;

        // assert edits have been made
        const response = await DemandBaseClass.getDemandStackDetails(
          request,
          demandId
        );
        expect(response).toEqual(editedDemandStackDetails);

        expect(editedDemandStackDetails.title).toEqual(editedTitle);
        expect(editedDemandStackDetails.description).toEqual(editedDescription);
        expect(
          new Date(editedDemandStackDetails.lastUpdatedTime).getTime()
        ).toBeGreaterThan(
          new Date(demandScenarioDetails.lastUpdatedTime).getTime()
        );
      });
    });
  }
);
