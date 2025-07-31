import debug from "debug";
import { expect, test } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdata from "../testdata/filter-service.json";
import usersData from "../constants/ufm_users.json";
import { UfmUtility } from "../fixtures/ufm-utils";
import commonData from "../constants/common.json";

let defaultDriverSets = ['MERCHOPS']

defaultDriverSets.forEach((org) => {
  test.describe.configure({ mode: "serial" });
  test.describe(
    "Verify the default driver set behaviour for organization: " + org,
    { tag: "@Smoke @defaultDriverSet @Regression ibg-ufm-metadata-service ibg-ufm-core-service" },
    async () => {
      // variable used to store the filter id and use it across the tests under this describe
      let filter_id: string;
      let apiResponse, apiResponseBody;
      let filter;
      let dim_val_id;
      let queryParams;
      // API endpoint URL
      const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
      Utility.logIt(endpointURL);
      test.beforeAll(async () => {
        dim_val_id = await UfmUtility.getMapping(org, "dim_val_id")
        queryParams = {
          screen_id: testdata.common_data.Node_Selection.screen_id,
          type_id: testdata.common_data.Node_Selection.filter_type,
          dim_id: testdata.common_data.Node_Selection.dim_id,
          dim_val_id: dim_val_id
        };
      })




      //   test(`Verify user has a default driver set readily available for ${org}`, { tag: "@Smoke @filters @Regression" },
      //     async ({ request }) => {
      //       await test.step("Fetch the driverSet available for the screen", async () => {
      //         apiResponse = await request.get(endpointURL, {
      //           params: queryParams
      //         });
      //         apiResponseBody = await apiResponse.json();
      //         Utility.logIt(
      //           `Filter Response : ${JSON.stringify(apiResponseBody)}`
      //         );
      //         expect(apiResponse).toBeOK();
      //       });

      //       await test.step("Check if only one default driver set is present", async () => {
      //         //extracting the filter names from the response into an Array
      //         const defaultCount: number = apiResponseBody.filter(
      //           (obj: any) => obj.is_default == true).length;
      //         //Assertion
      //         expect(defaultCount).toEqual(1)
      //       });

      //       await test.step(`Check if default driver set name for ${org} org is ${commonData.defaultDriverSetNames[org]}`, async () => {
      //         filter = apiResponseBody.find(filter => filter.filter_name === commonData.defaultDriverSetNames[org] && filter.is_default === true);
      //         expect(filter).not.toBeUndefined
      //         //Extracting the Filter ID that has been created and storing it in the filter_id to use it in other testcases
      //         filter_id = filter.filter_id;
      //       })

      //     }
      //   );

      //   test(`Verify user should not be able to delete default driver set in ${org}`, { tag: "@Smoke @filters @Regression" },
      //     async ({ request }) => {
      //       // delete request to delete the filter
      //       await test.step("Delete the default filter", async () => {
      //         apiResponse = await request.delete(endpointURL, {
      //           params: { filter_id: filter_id },
      //           data: {
      //             dim_id: testdata.common_data.Node_Selection.dim_id,
      //             dim_val_id: dim_val_id
      //           },
      //         });
      //       });
      //       // Validate the delete message for default scenarios
      //       await test.step("Check the response status and message for deleting default filter", async () => {
      //         expect.soft(apiResponse.status()).toEqual(testdata.defaul_filter_set.error_code);
      //         expect.soft(JSON.parse(await apiResponse.text()).message).toEqual(testdata.defaul_filter_set.exception_message);
      //       });

      //       // Make sure the filter deleted successfully by checking the get filters call
      //       await test.step("Get the Filters available for the screen", async () => {
      //         apiResponse = await request.get(endpointURL, {
      //           params: queryParams,
      //         });
      //         apiResponseBody = await apiResponse.json();
      //         Utility.logIt(
      //           `Available Filters after deleting default filter : ${JSON.stringify(
      //             apiResponseBody
      //           )}`
      //         );
      //       });
      //       // Checking the filterId of default filter and it is not deleted
      //       await test.step("Check if the default filter is not deleted and available", async () => {
      //         const filter_ids: String[] = apiResponseBody.map((obj: any) =>
      //           obj.filter_id.toLowerCase()
      //         );
      //         expect(filter_ids).toContain(filter_id.toLowerCase());
      //       });
      //     }
      //   );
      // });

      test(`Verify error on invalid filter id for ${org}`, { tag: "@Smoke @filters @Regression" },
        async ({ request }) => {
          let apiResponse, responseBody;
          // API endpoint URL
          const endpointURL = `${process.env.apiBaseURLUFM}/filter/`;
          let filter_id = testdata.invalid_filterset.filter_id
          let dim_val_id = await UfmUtility.getMapping(org, "parent_id")
          apiResponse = await request.delete(endpointURL, {
            params: { filter_id: filter_id },
            data: {
              "dim_id": 12, "dim_val_id": 120010
            }
          });
          expect.soft(apiResponse.status()).toEqual(testdata.invalid_filterset.status_code);
          expect.soft(JSON.parse(await apiResponse.text()).message).toEqual(testdata.invalid_filterset.message);
        })
    })
  testdata.payloads.forEach((payload) => {
    test.describe(
      "Verify the Filter API for " + payload.filter_name,
      { tag: "@Smoke @filters @Regression" },
      () => {
        test.describe.configure({ mode: "serial" });

        // variable used to store the filter id and use it across the tests under this describe
        let filter_id: string;
        let apiResponse, apiResponseBody, responseBody;
        // API endpoint URL
        const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
        Utility.logIt(endpointURL);

        const queryParams = {
          screen_id: payload.screen_id,
          type_id: payload.filter_type,
          dim_id: payload.dim_id,
          dim_val_id: payload.dim_val_id,
        };
        let userList = usersData.users;
        userList.forEach(async (user) => {
          test(
            `Verify if the user is able to @saveFilter with for ${user}` +
            payload.filter_name,
            async ({ request }) => {
              //post request for saving the filter
              await test.step("Make a Post Request for Saving the Filter", async () => {
                Utility.logIt("Make a Post Request for Saving the Filter");
                payload.filter_name =
                  payload.filter_name + new Date().toLocaleString();
                Utility.logIt(payload);
                apiResponse = await request.post(endpointURL, {
                  data: payload,
                });
                responseBody = await Utility.assertAndLog(apiResponse);
              });

              //Assertion
              await test.step("Check if the response message is success", async () => {
                expect(apiResponse).toBeOK();
                expect(responseBody).toEqual(testdata.success_message);
              });
            }
          );



          test(
            `Verify if the user is able to see the saved filter from @getFilter with ${user}` +
            payload.filter_name,
            async ({ request }) => {
              //get request to fetch the available filters
              await test.step("Fetch the filters available for the screen", async () => {
                apiResponse = await request.get(endpointURL, {
                  params: queryParams,
                });
                apiResponseBody = await apiResponse.json();
                Utility.logIt(
                  `Filter Response : ${JSON.stringify(apiResponseBody)}`
                );
                expect(apiResponse).toBeOK();
              });

              await test.step("Check if the created Filter is available in the results", async () => {
                //extracting the filter names from the response into an Array
                const filterNames: String[] = apiResponseBody.map(
                  (obj: any) => obj.filter_name
                );
                //Assertion
                expect(filterNames).toContain(payload.filter_name);
              });

              //Extracting the Filter ID that has been created and storing it in the filter_id to use it in other testcases
              await test.step("Save the Filter ID of the created filter", async () => {
                apiResponseBody.forEach((filterJson) => {
                  if (filterJson.filter_name === payload.filter_name) {
                    filter_id = filterJson.filter_id;
                  }
                });
                Utility.logIt(`Filter Id : ${filter_id}`);
              });
            }
          );
          test(
            `Verify if the user is able to see the saved filter by filterid @getFilterbyfilterid with ${user}` +
            payload.filter_name,
            async ({ request }) => {
              //get request to fetch the filter by filter id

              const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}${filter_id}`;
              Utility.logIt(endpointURL);

              await test.step("Fetch the filter by filter id for the screen", async () => {
                apiResponse = await request.get(`${endpointURL}`, {
                  params: queryParams,
                });
                apiResponseBody = await apiResponse.json();
                Utility.logIt(
                  `Filter Response : ${JSON.stringify(apiResponseBody)}`
                );
                expect(apiResponse).toBeOK();
              });

              await test.step("Check if the searched Filter is available in the results", async () => {
                //Assertion
                expect(apiResponseBody.filter_name).toContain(
                  payload.filter_name
                );
                expect(apiResponseBody.filter_id.toLowerCase()).toEqual(
                  `${filter_id.toLowerCase()}`
                ); // check there is only 1 record in results
              });
            }
          );

          test(
            `Verify if the user is not able to save a @duplicateFilter with ${user}` +
            payload.filter_name,
            async ({ request }) => {
              //post request for saving the filter
              await test.step("Make a Post Request for Saving the Filter", async () => {
                apiResponse = await request.post(endpointURL, {
                  data: payload,
                });
                apiResponseBody = await apiResponse.json();
                Utility.logIt(JSON.stringify(apiResponseBody));
              });

              //Assertion
              await test.step("Check the response message for duplicate filter", async () => {
                expect(apiResponse).toBeOK();
                expect(apiResponseBody).toEqual(
                  testdata.duplicate_filter_name_response
                );
              });
            }
          );

          test(
            `Verify if the user is able to @deleteFilter with ${user}` +
            payload.filter_name,
            async ({ request }) => {
              // delete request to delete the filter
              await test.step("Delete the created filter", async () => {
                apiResponse = await request.delete(endpointURL, {
                  params: { filter_id: filter_id },
                  data: {
                    ...payload,
                  },
                });
                apiResponseBody = await apiResponse.json();
                debug.log(JSON.stringify(apiResponseBody));
              });
              // request assertion
              await test.step("Check the response message for delete filter", async () => {
                expect(apiResponse).toBeOK();
                apiResponseBody = await apiResponse.json();
                expect(apiResponseBody).toEqual(testdata.delete_message);
              });

              // Make sure the filter deleted successfully by checking the get filters call
              await test.step("Get the Filters available for the screen", async () => {
                apiResponse = await request.get(endpointURL, {
                  params: queryParams,
                });
                apiResponseBody = await apiResponse.json();
                Utility.logIt(
                  `Available Filters after delete : ${JSON.stringify(
                    apiResponseBody
                  )}`
                );
              });
              // Checking the filterId is not present in the filters
              await test.step("Check if the deleted filter is not available", async () => {
                const filter_ids: String[] = apiResponseBody.map((obj: any) =>
                  obj.filter_id.toLowerCase()
                );
                expect(filter_ids).not.toContain(filter_id.toLowerCase());
              });
            }
          );

          test.afterAll("Remove the filters created", async ({ request }) => {
            apiResponse = await request.delete(endpointURL, {
              params: { filter_id: filter_id },
              data: {
                ...payload,
              },
            });
            apiResponseBody = await apiResponse.json();
            debug.log(JSON.stringify(apiResponseBody));
          });
        });
      }
    );
  });
});
