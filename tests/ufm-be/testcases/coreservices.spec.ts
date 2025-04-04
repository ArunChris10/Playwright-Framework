import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import commonData from "../constants/common.json";
import { ForecastUtility } from "../fixtures/forecast-utils";
import { UfmUtility } from "../fixtures/ufm-utils";
import { CoreServicesUtility } from "../fixtures/coreServices-utils";
import { request } from "http";

const org = ["ECOMMERCE"];
const lob = ["SEGMENT", "HOME OFFICE"];
let lobName, dim_val_id, scenario_details;
let isDefaulted = false;

lob.forEach((lobName) => {
    test.describe(
        "Verify Core Services scenarios",
        { tag: "@Smoke @Regression" },
        async () => {
            test.describe.configure({ timeout: 600_000, mode: "parallel" });

            test(`IBGROW-36379_Validate multiple LOB forecast creation ${lobName}`, async ({ request }) => {
                await ForecastUtility.createForecast(
                    lobName,
                    request
                );
            });
        }
    );
});

org.forEach((orgName) => {
    test.describe("Verify Scenario Workflow",
        { tag: "@Smoke @Regression @nidhi" },
        async () => {
            test.describe.configure({ timeout: 3000_000, mode: "serial" });

            test(`IBGROW-36378_IBGROW-36374_Validate User send LOB to BA review and then to Segment Review ${orgName}`, async ({ request }) => {
                isDefaulted = await CoreServicesUtility.stateChangePreRequisite(
                    orgName,
                    request
                );

                await CoreServicesUtility.CreateAndSendToBA(orgName, request);
                await CoreServicesUtility.checkAndSendForSegmentReview(orgName, request);
            });
            

        });
});