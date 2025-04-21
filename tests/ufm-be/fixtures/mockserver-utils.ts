// utils/mockServer.ts

import { Page, APIRequestContext } from '@playwright/test';
import { UfmUtility } from "../fixtures/ufm-utils";
import { promises } from 'dns';
let response;

export async function mockableApiResponse(
  apiToMatch:string,
  useMock: boolean
):Promise<any> {
  if (useMock) {
    console.log('Mocking APIRequestContext call for ' + apiToMatch);
    if (apiToMatch.includes("/reports/get-report")){
        response = {
            ok: true,
            status: 200,
            json: ({
              "columnDefs": [
                  {
                      "headerName": "Organization",
                      "field": "organization"
                  },
                  {
                      "headerName": "Forecast status",
                      "field": "forecastStatus"
                  },
                  {
                      "headerName": "Owner",
                      "field": "owner"
                  }
              ],
              "rowData": [
                  {
                      "organization": 120005,
                      "forecastStatus": {
                          "statusCode": 22
                      },
                      "owner": "s0g0fhn",
                      "scenarioId": 12261739359034,
                      "scenarioVersion": 1744174139
                  },
                  {
                      "organization": 120006,
                      "forecastStatus": {
                          "statusCode": 22
                      },
                      "owner": "LB-ibg-ufm-auto",
                      "scenarioId": 12271739359080,
                      "scenarioVersion": 1744177706
                  },
                  {
                      "organization": 120011,
                      "forecastStatus": {
                          "statusCode": 23
                      },
                      "owner": "s0g0fhn",
                      "scenarioId": 12311739359312,
                      "scenarioVersion": 1744174144
                  },
                  {
                      "organization": 120003,
                      "forecastStatus": {
                          "statusCode": 22
                      },
                      "owner": "LB-ibg-ufm-auto",
                      "scenarioId": 12241739358907,
                      "scenarioVersion": 1744177741
                  },
                  {
                      "organization": 120007,
                      "forecastStatus": {
                          "statusCode": 21
                      },
                      "owner": "s0g0fhn",
                      "scenarioId": 12281739359137,
                      "scenarioVersion": 1744174142
                  },
                  {
                      "organization": 120001,
                      "forecastStatus": {
                          "statusCode": 21
                      },
                      "owner": "s0g0fhn",
                      "scenarioId": 12221739358822,
                      "scenarioVersion": 1744174135
                  },
                  {
                      "organization": 120009,
                      "forecastStatus": {
                          "statusCode": 21
                      },
                      "owner": "s0g0fhn",
                      "scenarioId": 12291739359169,
                      "scenarioVersion": 1744174142
                  },
                  {
                      "organization": 120002,
                      "forecastStatus": {
                          "statusCode": 25
                      },
                      "owner": "LB-ibg-ufm-auto",
                      "scenarioId": 12231739358864,
                      "scenarioVersion": 1744180280
                  },
                  {
                      "organization": 120010,
                      "forecastStatus": {
                          "statusCode": 22
                      },
                      "owner": "s0g0fhn",
                      "scenarioId": 12301739359273,
                      "scenarioVersion": 1744174143
                  }
              ]
          }),
      };return response
    }
    
  }
}
