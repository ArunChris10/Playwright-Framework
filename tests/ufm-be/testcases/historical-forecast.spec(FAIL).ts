import testdatafile from '../testdata/historical-forecast.json';
import { test, expect } from '../../common/fixtures/test-hook';
import debug from 'debug';

testdatafile.sba_datas.forEach(sba_date => {
    test.describe('Validation of @Historical_Forecast @Regression', { tag: "@Regression @Smoke @Historical_Forecas" }, () => {

        //declaring test data
        let testdata = testdatafile;

        //declaring the variables globally
        let responseData, responseBody, forcastNames, hist_forecast_count;

        // API endpoint URL
        const endpointURL = `${process.env.apiBaseURLUFM}${testdata.endpoint}`
        debug.log(endpointURL);

        test.beforeAll(async ({
            request
        }) => {
            responseData = await request.get(endpointURL, {
                params: {
                    "dim_id": sba_date.queryParams.dim_id,
                    "classification_id": sba_date.queryParams.classification_id,
                    "dim_val_id": sba_date.queryParams.dim_val_id
                }
            })
            responseBody = await responseData.json();
        });

        //Fetch the historical forecasts and verify the SBA type
        test('Check the list of historical forecast for ' + sba_date.forecastname, async ({ }) => {

            //Make a get call and verify the historical forecast names contain the SBA name  
            await test.step('Check if all the Historical forecast name contains ' + sba_date.forecastname, async () => {
                debug.log('Check the SBA Name ' + sba_date.forecastname + ' in Historical forecast')

                //identify the historical forecast names using the key 'name' from the list of object array
                forcastNames = responseBody.row_data.map((obj: any) => obj.name);
                console.log('Forecast names is : ' + forcastNames)

                //Using ForeEach loop iterating all the forecasts available in Historical forecast list
                forcastNames.forEach((forecast: string) => {
                    debug.log('Previously Submitted Forecast name is :' + forecast)

                    //Validating the expected sba name contains in historical forecast
                    expect(forecast).toContain(sba_date.forecastname);
                    debug.log('Historical forecast is of ' + sba_date.forecastname + ' SBA type')
                })
            })
        });

        test('validate the list @count for ' + sba_date.forecastname, async ({ }) => {
            //Fetching the count of Historical forecasts
            await test.step('Verify the count of historical forecast of ' + sba_date.forecastname, async () => {

                hist_forecast_count = responseBody.row_data.length;
                debug.log('Number of Forecasts already submitted and showing in Historical forecast section is :' + hist_forecast_count);
            });

            //Verifying the count of total historical forecast to be 12
            await test.step('Verify the count of historical forecast', async () => {
                if ((hist_forecast_count) == testdata.forecast_count) {
                    debug.log('The historical forecast count is ' + testdata.forecast_count)
                } else {
                    expect(hist_forecast_count).toEqual(testdata.forecast_count);
                    debug.log('The historical forecast count is not ' + testdata.forecast_count)
                }
            })

        })

    })

})