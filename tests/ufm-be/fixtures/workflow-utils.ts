import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import endpoints from "../testdata/statusendpoints.json";
import { ForecastUtility } from "./forecast-utils";
import { UfmUtility } from "./ufm-utils";
import { expect } from "playwright/test";
export class WorkflowUtility {

    /**
     * This method changes the status of a scenario to a specified status.
     *
     * @param {string} lobName - The name of the line of business (LOB) associated with the scenario.
     * @param {string} scenario_id - The unique identifier of the scenario to be updated.
     * @param {string} scenario_version - The version of the scenario to be updated.
     * @param {string} status - The new status to be assigned to the scenario.
     * @param {string} dim_id - The dimension ID associated with the scenario.
     * @param {string} dim_val_id - The dimension value ID associated with the scenario.
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    public static async changeToStatus(
        lobName,
        scenario_id,
        scenario_version,
        status,
        dim_id,
        dim_val_id,
        request
    ) {
        Utility.logIt(`Sending scenario id : ${scenario_id} to status: ${status}`);
        const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.review_endpoint}`;
        const queryParams = {
            scenario_id: scenario_id,
            scenario_version: scenario_version,
            status: status,
        };
        let response = await request.put(endpointURL, {
            params: queryParams,
            data: {
                dim_id: dim_id,
                dim_val_id: dim_val_id,
            },
        })

        let responseBody = await Utility.assertAndLog(response);
        await expect(responseBody.status).toEqual(status);
        expect(response.status()).toBe(200);
        let statusTrackingResponse;
        //Polling to get the scenario status to accomodate async changes
        await expect
            .poll(
                async () => {
                    Utility.logIt("Polling Status update for.." + lobName + " for scenario "+scenario_id);
                    if (lobName == "Segment_Finance") {
                        const response = await this.getProgresstracker(
                            "Segment_Finance",
                            request
                        );
                        statusTrackingResponse = response.rowData;
                    } else {
                        statusTrackingResponse = await UfmUtility.getCurrentForecastList(
                            lobName,
                            request
                        );
                    }
                    let new_scenario = statusTrackingResponse.find(
                        (record) => record["scenarioId"] == responseBody.scenario_id
                    );
                    return new_scenario["forecastStatus"]["statusCode"];
                },
                {
                    intervals: [
                        60_000, 60_000, 60_000, 60_000, 60_000, 30_000, 30_000, 30_000,
                    ],
                    timeout: 600_000,
                }
            )
            .toBe(status);
    }

    /**
     * This method performs prerequisite checks and actions to ensure scenarios are in a default state.
     *
     * @param {string} org - The organization name.
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if actions were performed.
     */
    static async stateChangePreRequisite(org, request) {
        let outputActionToDefaultState;
        let response = await UfmUtility.getCurrentForecastList(org, request);
        // Above response will fetch all records for given Org eg- Demand
        for (let currRow = 0; currRow < response.length; currRow++) {
            let dim_val_id = response[currRow].lineOfBusiness;
            //checking if status is Not started & draft & Change Requested; 
            if (
                response[currRow].forecastStatus.statusCode != commonData.Draft &&
                response[currRow].forecastStatus.statusCode != commonData.Not_Started &&
                response[currRow].forecastStatus.statusCode != commonData.Change_Requested
            ) {
                outputActionToDefaultState = true;
                response = await UfmUtility.getCurrentForecastList(org, request);
                if (response[currRow].forecastStatus.statusCode === commonData.Segment_Review) {
                    Utility.logIt("Found Segment Review, performing Change Request")
                    await this.sendForChangeRequest(org, request);
                    await this.validateBAAndForecastStatus(org, request, 'All', commonData.Change_Requested);
                    Utility.logIt("Change request status validated for Segment_Finance")
                    await this.validateBAAndForecastStatus(org, request, dim_val_id, commonData.Change_Requested);
                    Utility.logIt("Change request status validated for BA & Forecast")
                }
            }
        }
        return outputActionToDefaultState;
    }

    /**
     * This method sends a scenario for a change request by updating its status.
     *
     * @param {string} orgName - The organization name.
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    static async sendForChangeRequest(orgName, request) {
        let response = await this.getProgresstracker("Segment_Finance", request);
        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id", "PBA");
        for (let currRow = 0; currRow < response.rowData.length; currRow++) {
            if ((response.rowData[currRow].organization) === segmentReviewDimValId) {
                await this.changeToStatus(
                    "Segment_Finance",
                    response.rowData[currRow].scenarioId,
                    response.rowData[currRow].scenarioVersion,
                    commonData.Change_Requested,
                    commonData.Segment_Finance.dim_id,
                    commonData.Segment_Finance.dim_val_id,
                    request,
                )
            }
        }
    }

    /**
     * Creates and sends a forecast to BA review for each line of business (LOB)
     * of a given organization. Later performs a Org level assertion on status chnage for BA & forecast
     *
     * @param {string} orgName - The organization name.
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    static async CreateAndSendToBAReview(orgName, request) {
        let response, lobName, scenario_details, isNewCreated;
        //Getting Status of all LOB of an Org by progress tracker
        response = await this.getProgresstracker(orgName, request);
        Utility.logIt("LOB number for given Org " + orgName + " are -" + response.rowData.length);
        // Create Scenario for each LoB of the given Org
        for (let currRow = 0; currRow < response.rowData.length; currRow++) {
            let dim_val_id = response.rowData[currRow].lineOfBusiness;
            lobName = await UfmUtility.getMapping(dim_val_id, "childName");
            Utility.logIt("Current LOB underscan is- " + lobName);
            if (
                (await ForecastUtility.countOfScenario(
                    lobName,
                    process.env.ufmUser,
                    request
                )) >= commonData.MAX_SCENARIO_COUNT
            ) {
                //Deleting forecast created by logged in user
                await ForecastUtility.deleteAllforecastofUser(
                    request,
                    lobName,
                    process.env.ufmUser
                );
            }
            [scenario_details, isNewCreated] =
                await ForecastUtility.getOrCreateForecastIfNotExists(
                    lobName,
                    request
                );

            // Send to BA Review for all LOB of given Org
            await this.changeToStatus(
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
                commonData.BA_Review,
                commonData.lob_dim_id,
                await UfmUtility.getMapping(lobName, "dim_val_id"),
                request
              );
            // Assert status at forecast & BA level
            await this.validateBAAndForecastStatus(orgName, request, dim_val_id, commonData.BA_Review)
        }
    }

    /**
     * This method checks and sends scenarios for Segment review.
     *
     * @param {string} orgName - The organization name.
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    static async checkAndSendForSegmentReview(orgName, request) {
        let response = await this.getProgresstracker("Segment_Finance", request);
        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id", "PBA");
        for (let currRow = 0; currRow < response.rowData.length; currRow++) {
            if ((response.rowData[currRow].organization) == (segmentReviewDimValId)) {
                Utility.logIt("Sending to Segment Review")
                await this.changeToStatus(
                    "Segment_Finance",
                    response.rowData[currRow].scenarioId,
                    response.rowData[currRow].scenarioVersion,
                    commonData.Segment_Review,
                    commonData.ba_dim_id,
                    segmentReviewDimValId,
                    request
                );
                Utility.logIt(
                    `Segment review submitted for ${response.rowData[currRow].scenarioId}`
                );
            }
        }
        await this.validateBAAndForecastStatus(orgName, request, 'All', commonData.Segment_Review)
    }

    
    /**
     * This method validates the status of BA and forecast scenarios.
     *
     * @param {string} orgName - The organization name.
     * @param {Request} request - The request object used for the operation.
     * @param {string} dim_val_id - The dimension value ID to validate.
     * @param {string} expectedStatus - The expected status to validate against.
     * @returns {Promise<void>} - A promise that resolves when the validation is complete.
     */
    static async validateBAAndForecastStatus(orgName, request, dim_val_id, expectedStatus) {
        let scenario_id, scenario_version, lobName;
        let baProgressTrackerResponse = await this.getProgresstracker(orgName, request);
        for (let currRow = 0; currRow < baProgressTrackerResponse.rowData.length; currRow++) {
            if (baProgressTrackerResponse.rowData[currRow].lineOfBusiness == (dim_val_id) || (dim_val_id == 'All')) {
                expect(baProgressTrackerResponse.rowData[currRow].forecastStatus.statusCode).toBe(expectedStatus)
                scenario_id = baProgressTrackerResponse.rowData[currRow].scenarioId;
                scenario_version = baProgressTrackerResponse.rowData[currRow].scenarioVersion;
                let getLoBId = baProgressTrackerResponse.rowData[currRow].lineOfBusiness;
                lobName = await UfmUtility.getMapping(getLoBId, "childName")
                // Assert Forecast status should be as expected
                let getForecastResponse = await UfmUtility.getCurrentForecastList(lobName, request);
                for (let forecastRow = 0; forecastRow < getForecastResponse.length; forecastRow++) {
                    if ((getForecastResponse[forecastRow].scenarioId) == scenario_id) {
                        expect((getForecastResponse[forecastRow].forecastStatus.statusCode)).toBe(expectedStatus)
                    }
                }
            }
        }
    }

    /**
    * This method will list the progress tracker and give you status of LOB or BA based on which screen is passed in argument
    * Technically screen is BA screen or Segment finance screen
     *
     * @param {string} screen - The screen name (e.g., "Segment_Finance").
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<object>} - A promise that resolves to the progress tracker data.
     */
    public static async getProgresstracker(screen, request) {
        let template_id, dim_id, dim_val_id;
        Utility.logIt(`Getting progress tracker for screen : ${screen}`);
        if (screen == "Segment_Finance") {
            template_id = commonData.Segment_Finance.template_id;
            dim_id = commonData.Segment_Finance.dim_id;
            dim_val_id = commonData.Segment_Finance.dim_val_id;
        } else {
            template_id = commonData.ba_template_id;
            dim_id = commonData.ba_dim_id;
            dim_val_id = await UfmUtility.getMapping(screen, "parent_id", "PBA");
        }
        const endpointURL = `${process.env.apiBaseURLUFM}${endpoints.get_report_endpoint}`;
        const response = await request.post(endpointURL, {
            data: {
                dim_id: dim_id,
                dim_val_id: dim_val_id,
                template_id: template_id,
                classification_id: commonData.classification_id,
            },
        });
        return await Utility.assertAndLog(response);
    }
/* This method will do change request for the given organization
*    @param {string} org - The organization name.
*    @param {Request} request - The request object used for the operation.
*/

static async sendToChangeRequestFromBA(orgName, request) {
    let lobName;
    let response = await this.getProgresstracker(orgName, request);

    for (let k = 0; k < response.rowData.length; k++) {
        let dim_val_id = await UfmUtility.getMapping(orgName, "parent_id");

        lobName = await UfmUtility.getMapping(dim_val_id, "childName");

        console.log(`Submit ${lobName} LOB to Change Request from BA screen`);
            await this.changeToStatus( lobName,
                response.rowData[k].scenarioId,
                response.rowData[k].scenarioVersion,
                commonData.Change_Requested,
                commonData.ba_dim_id,
                dim_val_id,
                request
              );

    }
}

 /* This method performs prerequisite checks and actions to ensure LOBs are in a BA review state before change request.
     *
     * @param {string} org - The organization name.
     * @param {Request} request - The request object used for the operation.
     * 
     */
 static async ChangeRequestFromBAPreRequisite(orgName, request) {
    let scenario_details,scenario_details2,lobName, isNewCreated;
    // Array to collect results
    let result = [];
    let response = await this.getProgresstracker(orgName, request);

    Utility.logIt("LOB number for given Org " + orgName + " are :" + response.rowData.length);
    // Create Scenario for each LoB of the given Org
    for (let j = 0; j < response.rowData.length; j++) {
        let dim_val_id = response.rowData[j].lineOfBusiness;
        lobName = await UfmUtility.getMapping(dim_val_id, "childName");
        console.log("Current LOB underscan is- " + lobName);
        // Above response will fetch all records for given Org eg- Demand

        console.log("LOB status-" +(response.rowData[j].forecastStatus.statusCode));
        //checking if status is Not started or draft or Change Requested; 
        if (response.rowData[j].forecastStatus.statusCode === commonData.Not_Started 
        ) {
            console.log("I am inside of status" + response.rowData[j].forecastStatus.statusCode)
            response = await UfmUtility.getCurrentForecastList(orgName, request);
            [scenario_details, isNewCreated] =
            await ForecastUtility.getOrCreateForecastIfNotExists(
                lobName,
                request
            );
            // Send to BA Review for all LOB of given Org
        await this.changeToStatus(
            lobName,
            scenario_details["scenarioId"],
            scenario_details["scenarioVersion"],
            commonData.BA_Review,
            commonData.lob_dim_id,
            await UfmUtility.getMapping(lobName, "dim_val_id"),
            request
          );
        }
        else if (response.rowData[j].forecastStatus.statusCode === commonData.Draft ||
            response.rowData[j].forecastStatus.statusCode === commonData.Change_Requested
        ) 
        {
            console.log("I am inside of status" +response.rowData[j].forecastStatus.statusCode);
            [scenario_details2, isNewCreated] =
            await ForecastUtility.getOrCreateForecastIfNotExists(
                lobName,
                request
            );
            await this.changeToStatus(
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
                commonData.BA_Review,
                commonData.lob_dim_id,
                await UfmUtility.getMapping(lobName, "dim_val_id"),
                request
              );

        }

        // Assert status at forecast & BA level
        await this.validateBAAndForecastStatus(orgName, request, dim_val_id, commonData.BA_Review)

    }


}



}