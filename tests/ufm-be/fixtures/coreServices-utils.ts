import debug from "debug";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import endpoints from "../testdata/statusendpoints.json";
import { ForecastUtility } from "./forecast-utils";
import { UfmUtility } from "./ufm-utils";
import { expect } from "playwright/test";
import { fail } from "assert";

export class CoreServicesUtility {

    public static async SendToBAReview(request, lobName, scenario_id, scenario_version) {
        //Sending created forecast to Segment review
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

    public static async SendToSegmentReview(request, scenario_id, scenario_version, dim_val_id) {
        //Sending created forecast to Segment review
        await this.changeToStatusInSegmentFinance(
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
        console.log("FLOW COMPLETED TILL SEGMENT REVIEW")
    }

    public static async changeToStatus(
        lobName,
        scenario_id,
        scenario_version,
        status,
        dim_id,
        dim_val_id,
        request,
        isError = false
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

        let responseBody = await Utility.assertAndLog(response, isError);
        await expect(responseBody.status).toEqual(status);
        if (!isError) {
            expect(response.status()).toBe(200);
            //Polling to get the scenario status to accomodate async changes
            await expect
                .poll(
                    async () => {
                        console.log("Polling Status update..");
                        const response = await UfmUtility.getCurrentForecastList(
                            lobName,
                            request
                        );
                        let new_scenario = response.find(
                            (i) => i["scenarioId"] == responseBody.scenario_id
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
    }

    public static async changeToStatusInSegmentFinance(
        scenario_id,
        scenario_version,
        status,
        dim_id,
        dim_val_id,
        request,
        isError = false
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

        let responseBody = await Utility.assertAndLog(response, isError);
        await expect(responseBody.status).toEqual(status);
        if (!isError) {
            expect(response.status()).toBe(200);
            //Polling to get the scenario status to accomodate async changes
            await expect
                .poll(
                    async () => {
                        console.log("Polling Status update in Segment Finance Screen..");
                        const response = await this.getProgresstracker(
                            "Segment_Finance",
                            request
                        );
                        let new_scenario = response.rowData.find(
                            (i) => i["scenarioId"] == responseBody.scenario_id
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
    }

    static async stateChangePreRequisite(org, request) {
        let outputActionToDefaultState;
        let response = await UfmUtility.getCurrentForecastList(org, request);
        // Above response will fetch all records for given Org eg- Demand
        for (let j = 0; j < response.length; j++) {
            let dim_val_id = response[j].lineOfBusiness;
            //console.log("DIM VAL ID--"+response[j].lineOfBusiness)
            let lobName = await UfmUtility.getMapping(dim_val_id, "childName");
            //console.log("LOB-" +lobName)

            //checking if status is Not started & draft & Change Requested; 
            if (
                response[j].forecastStatus.statusCode != commonData.Draft &&
                response[j].forecastStatus.statusCode != commonData.Not_Started &&
                response[j].forecastStatus.statusCode != commonData.Change_Requested
            ) {
                outputActionToDefaultState = true;
                console.log("I am inside of status" + response[j].forecastStatus.statusCode)
                response = await UfmUtility.getCurrentForecastList(org, request);
                /* if (response[j].forecastStatus.statusCode === commonData.BA_Review) {
                    console.log("Found BA review record, Recalling to Draft state");
                    await this.changeToStatus(
                        lobName,
                        response[j].scenarioId,
                        response[j].scenarioVersion,
                        commonData.Draft,
                        commonData.lob_dim_id,
                        dim_val_id,
                        request
                    );
                    console.log("BA review sent to draft for -" + lobName)
                } */

                if (response[j].forecastStatus.statusCode === commonData.Segment_Review) {
                    console.log("Found Segment Review, performing Change Request")
                    await this.sendForChangeRequest(org, request);
                    await CoreServicesUtility.validateBAAndForecastStatus(org, request, 'All', commonData.Change_Requested);
                    console.log("Change request status validated for Segment_Finance")
                    await CoreServicesUtility.validateBAAndForecastStatus(org, request, 'All', commonData.Change_Requested);
                    console.log("Change request status validated for BA & Forecast")
                }
            }
        }
        return outputActionToDefaultState;
    }

    static async sendForChangeRequest(orgName, request) {
        let response = await this.getProgresstracker("Segment_Finance", request);
        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id");
        for (let k = 0; k < response.rowData.length; k++) {
            if ((response.rowData[k].organization) === segmentReviewDimValId) {
                await this.changeToStatusInSegmentFinance(
                    response.rowData[k].scenarioId,
                    response.rowData[k].scenarioVersion,
                    commonData.Change_Requested,
                    commonData.Segment_Finance.dim_id,
                    commonData.Segment_Finance.dim_val_id,
                    request,
                )
            }
        }
    }

    static async CreateAndSendToBA(orgName, request) {
        let response, lobName, scenario_details, isNewCreated;
        //Getting Status of all LOB of an Org by progress tracker
        response = await this.getProgresstracker(orgName, request);
        Utility.logIt("LOB number for given Org " + orgName + " are -" + response.rowData.length);
        // Create Scenario for each LoB of the given Org
        for (let j = 0; j < response.rowData.length; j++) {
            let dim_val_id = response.rowData[j].lineOfBusiness;
            lobName = await UfmUtility.getMapping(dim_val_id, "childName");
            console.log("Current LOB underscan is- " + lobName);
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
        /* response = await this.getProgresstracker("Segment_Finance", request);
        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id");
        console.log("SegmentReviewDimValId " + segmentReviewDimValId);
        for (let k = 0; k < response.rowData.length; k++) {
            console.log("Checking for Org --" + response.rowData[k].organization)
            if ((response.rowData[k].organization) == (segmentReviewDimValId)) {
                console.log("Sending to Segment Review")
                await this.SendToSegmentReview(
                    request,
                    response.rowData[k].scenarioId,
                    response.rowData[k].scenarioVersion,
                    segmentReviewDimValId
                )
            }
        }
        await this.validateBAAndForecastStatus(orgName, request, 'All',commonData.Segment_Review) */
    }

    static async checkAndSendForSegmentReview(orgName, request) {
        let response = await this.getProgresstracker("Segment_Finance", request);
        let segmentReviewDimValId = await UfmUtility.getMapping(orgName, "parent_id");
        console.log("SegmentReviewDimValId " + segmentReviewDimValId);
        for (let k = 0; k < response.rowData.length; k++) {
            console.log("Checking for Org --" + response.rowData[k].organization)
            if ((response.rowData[k].organization) == (segmentReviewDimValId)) {
                console.log("Sending to Segment Review")
                await this.SendToSegmentReview(
                    request,
                    response.rowData[k].scenarioId,
                    response.rowData[k].scenarioVersion,
                    segmentReviewDimValId
                )
            }
        }
        await this.validateBAAndForecastStatus(orgName, request, 'All', commonData.Segment_Review)
    }

    static async validateBAAndForecastStatus(orgName, request, dim_val_id, expectedStatus) {
        let scenario_id, scenario_version, lobName;
        let baProgressTrackerResponse = await CoreServicesUtility.getProgresstracker(orgName, request);
        for (let k = 0; k < baProgressTrackerResponse.rowData.length; k++) {
            console.log("The current LOB for status validation is - " + dim_val_id)
            if (baProgressTrackerResponse.rowData[k].lineOfBusiness == (dim_val_id) || (dim_val_id == 'All')) {
                expect(baProgressTrackerResponse.rowData[k].forecastStatus.statusCode).toBe(expectedStatus)
                scenario_id = baProgressTrackerResponse.rowData[k].scenarioId;
                scenario_version = baProgressTrackerResponse.rowData[k].scenarioVersion;
                let getLoBId = baProgressTrackerResponse.rowData[k].lineOfBusiness;
                lobName = await UfmUtility.getMapping(getLoBId, "childName")
                // Assert Forecast status should be as expected
                let getForecastResponse = await UfmUtility.getCurrentForecastList(lobName, request);
                for (let j = 0; j < getForecastResponse.length; j++) {
                    if ((getForecastResponse[j].scenarioId) == scenario_id) {
                        console.log("Scenario id -" + j + " " + scenario_id)
                        expect((getForecastResponse[j].forecastStatus.statusCode)).toBe(expectedStatus)
                    }
                }
            }
        }
    }

    static async sendBAReviewforSamelob(orgName, request) {
        let scenario_details, isNewCreated, currentBAReviewScenarioId, dim_val_id, lobName, existingScenarioId;
        let isExisting = false;
        let responseProgTracker = await this.getProgresstracker(orgName, request);
        let response = responseProgTracker.rowData;
        for (let k = 0; k < response.length; k++) {
            if ((response[k].forecastStatus.statusCode) == commonData.BA_Review) {
                // BA review record exists
                dim_val_id = response[k].lineOfBusiness;
                lobName = await UfmUtility.getMapping(dim_val_id, "childName");
                existingScenarioId = response[k].scenarioId;
                isExisting = true;
            }
        }
        if (isExisting == true) {
            console.log("ISEXISTING BA REVIEW----" + isExisting);
            [scenario_details, isNewCreated] =
            await ForecastUtility.getOrCreateForecastIfNotExists(lobName, request);
            await CoreServicesUtility.SendToBAReview(
                request,
                lobName,
                scenario_details["scenarioId"],
                scenario_details["scenarioVersion"],
            )
            console.log("Passing---same LoB sent for BA review, given already present")
            let refreshResponse = await UfmUtility.getCurrentForecastList(lobName, request);
            for (let i = 0; i < refreshResponse.length; i++) {
                if ((refreshResponse[i].scenarioId) == existingScenarioId) {
                    expect(refreshResponse[i].forecastStatus.statusCode).toBe(commonData.Draft)
                    console.log("Assertion passed for old BA review record defaulting to Draft")
                    break;
                }
            }
        }
        else {
            console.log("ISEXISTING BA REVIEW in ELSE----" + isExisting);
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
            for (let i = 0; i < refreshResponse.length; i++) {
                if ((refreshResponse[i].scenarioId) == existingScenarioId) {
                    expect(refreshResponse[i].forecastStatus.statusCode).toBe(commonData.Draft)
                    console.log("Assertion passed for old BA review record defaulting to Draft- no BA existing earlier")
                    break;
                }
            }
        }
        return [scenario_details, dim_val_id, lobName];
    }

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
            console.log(template_id, dim_id, dim_val_id)
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

    static async createAndSendToBAReview(request, orgName) {
        let response, lobName, scenario_details, isNewCreated;
        //Getting Status of all LOB of an Org by progress tracker
        response = await UfmUtility.getProgresstracker(orgName, request);
        Utility.logIt(response.rowData.length);

        response.rowData.forEach(async curRow => {
            let dim_val_id = curRow.lineOfBusiness; 
            lobName = await UfmUtility.getMapping(dim_val_id, "childName");

            //checking if status is Not started or draft , then deleting all other and creating new forecast
          if (
            curRow.forecastStatus != commonData.Segment_Review &&
            curRow.forecastStatus != commonData.BA_Review
          ) {
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

            
                
            
        }});
        for (let j = 0; j < response.rowData.length; j++) {
          let dim_val_id = response.rowData[j].lineOfBusiness;
          lobName = await UfmUtility.getMapping(dim_val_id, "childName");
          Utility.logIt(lobName);
    
          //checking if status is Not started or draft , then deleting all other and creating new forecast
          if (
            response.rowData[j].forecastStatus != commonData.Segment_Review &&
            response.rowData[j].forecastStatus != commonData.BA_Review
          ) {
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
    
            //Sending created forecast to BA review
            await UfmUtility.changeToStatus(
              scenario_details["scenarioId"],
              scenario_details["scenarioVersion"],
              commonData.BA_Review,
              commonData.lob_dim_id,
              await UfmUtility.getMapping(lobName, "dim_val_id"),
              request
            );
            Utility.logIt(`Sent ${lobName} to BA Review`);
          }
        }
      }
}