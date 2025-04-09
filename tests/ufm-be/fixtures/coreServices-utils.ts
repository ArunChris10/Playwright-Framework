import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import endpoints from "../testdata/statusendpoints.json";
import { ForecastUtility } from "./forecast-utils";
import { UfmUtility } from "./ufm-utils";
import { expect } from "playwright/test";
export class CoreServicesUtility {

    /**
     * This method submits a scenario for BA review by changing its status.
     *
     * @param {Request} request - The request object used for the operation.
     * @param {string} lobName - The name of the line of business (LOB) associated with the scenario.
     * @param {string} scenario_id - The unique identifier of the scenario to be reviewed.
     * @param {string} scenario_version - The version of the scenario to be reviewed.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    public static async SendToBAReview(request, lobName, scenario_id, scenario_version) {
        await this.changeToStatus(
            lobName,
            scenario_id,
            scenario_version,
            commonData.BA_Review,
            commonData.lob_dim_id,
            await UfmUtility.getMapping(lobName, "dim_val_id"),
            request
        );
        Utility.logIt(
            `BA review submitted for ${scenario_id}`
        );
    }

    /**
     * This method submits a scenario for Segment review by changing its status.
     *
     * @param {Request} request - The request object used for the operation.
     * @param {string} scenario_id - The unique identifier of the scenario to be reviewed.
     * @param {string} scenario_version - The version of the scenario to be reviewed.
     * @param {string} dim_val_id - The dimension value ID associated with the scenario.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    public static async SendToSegmentReview(request, scenario_id, scenario_version, dim_val_id) {
        await this.changeToStatus(
            "Segment_Finance",
            scenario_id,
            scenario_version,
            commonData.Segment_Review,
            commonData.ba_dim_id,
            dim_val_id,
            request
        );
        Utility.logIt(
            `Segment review submitted for ${scenario_id}`
        );
    }

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
                    Utility.logIt("Polling Status update for.."+lobName);
                    if (lobName == "Segment_Finance") {
                        const response = await this.getProgresstracker(
                            "Segment_Finance",
                            request
                        );
                        statusTrackingResponse =  response.rowData;
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
                    await CoreServicesUtility.validateBAAndForecastStatus(org, request, 'All', commonData.Change_Requested);
                    Utility.logIt("Change request status validated for Segment_Finance")
                    await CoreServicesUtility.validateBAAndForecastStatus(org, request, dim_val_id, commonData.Change_Requested);
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
        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id");
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
     * This method creates a new scenario if not existingand sends it for BA review.
     *
     * @param {string} orgName - The organization name.
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<void>} - A promise that resolves when the operation is complete.
     */
    static async CreateAndSendToBA(orgName, request) {
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
            await this.SendToBAReview(
                request,
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
            )
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
        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id");
        for (let currRow = 0; currRow < response.rowData.length; currRow++) {
            if ((response.rowData[currRow].organization) == (segmentReviewDimValId)) {
                Utility.logIt("Sending to Segment Review")
                await this.SendToSegmentReview(
                    request,
                    response.rowData[currRow].scenarioId,
                    response.rowData[currRow].scenarioVersion,
                    segmentReviewDimValId
                )
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
        let baProgressTrackerResponse = await CoreServicesUtility.getProgresstracker(orgName, request);
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
     * This method sends a scenario for BA review for the same line of business (LOB).
     *
     * @param {string} orgName - The organization name.
     * @param {Request} request - The request object used for the operation.
     * @returns {Promise<[object, string, string]>} - A promise that resolves to an array containing scenario details, dimension value ID, and LOB name.
     */
    static async sendBAReviewforSamelob(orgName, request) {
        let scenario_details, isNewCreated, currentBAReviewScenarioId, dim_val_id, lobName, existingScenarioId;
        let isExisting = false;
        let responseProgTracker = await this.getProgresstracker(orgName, request);
        let response = responseProgTracker.rowData;
        for (let lobRecord = 0; lobRecord < response.length; lobRecord++) {
            if ((response[lobRecord].forecastStatus.statusCode) == commonData.BA_Review) {
                // BA review record exists
                dim_val_id = response[lobRecord].lineOfBusiness;
                lobName = await UfmUtility.getMapping(dim_val_id, "childName");
                existingScenarioId = response[lobRecord].scenarioId;
                isExisting = true;
            }
        }
        if (isExisting == true) {
            Utility.logIt("ISEXISTING BA REVIEW status is----" + isExisting);
            [scenario_details, isNewCreated] =
                await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
            await CoreServicesUtility.SendToBAReview(
                request,
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
            )
            Utility.logIt("Passing---same LoB sent for BA review, given already present")
            let refreshResponse = await UfmUtility.getCurrentForecastList(lobName, request);
            for (let refreshResponseRow = 0; refreshResponseRow < refreshResponse.length; refreshResponseRow++) {
                if ((refreshResponse[refreshResponseRow].scenarioId) == existingScenarioId) {
                    expect(refreshResponse[refreshResponseRow].forecastStatus.statusCode).toBe(commonData.Draft)
                    Utility.logIt("Assertion passed for old BA review record defaulting to Draft")
                    break;
                }
            }
        }
        else {
            Utility.logIt("ISEXISTING BA REVIEW in ELSE----" + isExisting);
            dim_val_id = response[0].lineOfBusiness;
            lobName = await UfmUtility.getMapping(dim_val_id, "childName");
            [scenario_details, isNewCreated] =
                await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
            let existingScenarioId = scenario_details["scenarioId"];
            await CoreServicesUtility.SendToBAReview(
                request,
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
            );
            //again create a new if not existing forecast of same Lob and send for BA review
            [scenario_details, isNewCreated] =
                await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
            await CoreServicesUtility.SendToBAReview(
                request,
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
            )

            let refreshResponse = await UfmUtility.getCurrentForecastList(lobName, request);
            for (let refreshResponseRow = 0; refreshResponseRow < refreshResponse.length; refreshResponseRow++) {
                if ((refreshResponse[refreshResponseRow].scenarioId) == existingScenarioId) {
                    expect(refreshResponse[refreshResponseRow].forecastStatus.statusCode).toBe(commonData.Draft)
                    Utility.logIt("Assertion passed for old BA review record defaulting to Draft")
                    break;
                }
            }
        }
        return [scenario_details, dim_val_id, lobName];
    }

    /**
     * This method retrieves the progress tracker for a specific screen.
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
            dim_val_id = await UfmUtility.getMapping(screen, "parent_id");
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


}