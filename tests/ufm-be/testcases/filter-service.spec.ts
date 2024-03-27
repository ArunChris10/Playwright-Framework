import testdata from "../testdata/filter-service.json";
import { test, expect } from "../../common/fixtures/test-hook";
import debug from "debug";



test.describe("Verify the @Filter API @Regression", () => {
  test.describe.configure({ mode: "serial" });

  // variable used to store the filter id and use it across the tests under this describe
  let filter_id : string;
  let apiResponse, apiResponseBody;
  // API endpoint URL
  const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`;
  debug.log(endpointURL);
  const queryParams = {
    screen_id: testdata.filter_selection.screen_id,
    type_id: testdata.filter_selection.filter_type,
    dim_id: testdata.filter_selection.dim_id,
    dim_val_id: testdata.filter_selection.dim_val_id,
  };


  test('Verify if the user is able to @saveFilter', async ({ context }) => {
    //post request for saving the filter
    await test.step('Make a Post Request for Saving the Filter', async () => {
      debug.log('Make a Post Request for Saving the Filter');
      apiResponse = await context.request.post(endpointURL, {
        data: testdata.filter_selection
      })
      apiResponseBody = await apiResponse.json();
      debug.log(JSON.stringify(apiResponseBody));
    })

    //Assertion
    await test.step('Check if the response message is success', async () => {
      expect(apiResponse).toBeOK();
      expect(apiResponseBody).toEqual(testdata.success_message)
    })

  });

  test("Verify if the user is not able to save a @duplicateFilter", async ({
    context,
  }) => {
    //post request for saving the filter
    await test.step("Make a Post Request for Saving the Filter", async () => {
      apiResponse = await context.request.post(endpointURL, {
        data: testdata.filter_selection,
      });
      apiResponseBody = await apiResponse.json();
      debug.log(JSON.stringify(apiResponseBody));
    });

    //Assertion
    await test.step("Check the response message for duplicate filter", async () => {
      expect(apiResponse).toBeOK();
      expect(apiResponseBody).toEqual(testdata.duplicate_filter_name_response);
    });
  });

  test("Verify if the user is able to see the saved filter from @getFilter", async ({
    request,
  }) => {
    //get request to fetch the available filters
    await test.step("Fetch the filters available for the screen", async () => {
      apiResponse = await request.get(endpointURL, {
        params: queryParams,
      });
      apiResponseBody = await apiResponse.json();
      debug.log("Filter Response : ");
      debug.log(JSON.stringify(apiResponseBody));
      expect(apiResponse).toBeOK();
    });

    await test.step("Check if the created Filter is available in the results", async () => {
      //extracting the filter names from the response into an Array
      const filterNames: String[] = apiResponseBody.map(
        (obj: any) => obj.filter_name
      );
      //Assertion
      expect(filterNames).toContain(testdata.filter_selection.filter_name);
    });

    //Extracting the Filter ID that has been created and storing it in the filter_id to use it in other testcases
    await test.step("Save the Filter ID of the created filter", async () => {
      apiResponseBody.forEach((filterJson) => {
        if (filterJson.filter_name === testdata.filter_selection.filter_name) {
          filter_id = filterJson.filter_id;
        }
      });
      debug.log(`Filter Id : ${filter_id}`);
    });
  });
  test("Verify if the user is able to see the saved filter by filterid @getFilterbyfilterid", async ({
    request,
  }) => {
    //get request to fetch the filter by filter id

    const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}${filter_id}`;
    debug.log(endpointURL);

    await test.step("Fetch the filter by filter id for the screen", async () => {
      apiResponse = await request.get(`${endpointURL}`,{
        params: queryParams,
      });
      apiResponseBody = await apiResponse.json();
      debug.log("Filter Response : ");
      debug.log(JSON.stringify(apiResponseBody));
      expect(apiResponse).toBeOK();
    });

    await test.step("Check if the searched Filter is available in the results", async () => {
      //Assertion
      expect(apiResponseBody.filter_name).toContain(
        testdata.filter_selection.filter_name
      );
      expect(apiResponseBody.filter_id.toLowerCase()).toEqual(`${filter_id.toLowerCase()}`); // check there is only 1 record in results
    });
  });

  test("Verify if the user is able to delete the saved filter @deleteFilter", async ({
    request,
  }) => {
    // delete request to delete the filter
    await test.step("Delete the created filter", async () => {
      apiResponse = await request.delete(endpointURL, {
        params: { filter_id: filter_id },
        data:{
          ...testdata.filter_selection,
        }
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
      debug.log("Available Filters after delete : ");
      debug.log(JSON.stringify(apiResponseBody));
    });
    // Checking the filterId is not present in the filters
    await test.step("Check if the deleted filter is not available", async () => {
      const filter_ids: String[] = apiResponseBody.map(
        (obj: any) => obj.filter_id.toLowerCase()
      );
      expect(filter_ids).not.toContain(filter_id.toLowerCase());
    });
  });

  test.afterAll('Remove the filters created',async ({request})=>{
    apiResponse = await request.delete(endpointURL, {
      params: { filter_id: filter_id },
      data:{
        ...testdata.filter_selection,
      }
    });
    apiResponseBody = await apiResponse.json();
    debug.log(JSON.stringify(apiResponseBody));
  })
});
