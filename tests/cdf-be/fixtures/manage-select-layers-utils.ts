import debug from "debug";
import allocationsData from "../testdata/allocation-layer-data.json";
import { expect } from "@playwright/test";
import { DemandBaseClass } from "./demand-common-utils";
import { payload_base_forecast, baseChannelNames, year, month } from "../testdata/manage-select-layers.json";
import commonEndpoints from "../testdata/common-demand-endpoints.json";

export class ManageSelectLayersUtil extends DemandBaseClass {

  static async getDemandScenarioForecast(
    request,
    demandStackId,
    forecastVersion,
    layerIds
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.getDemandScenarioForecastEndpoint}${demandStackId}`;
    
    const payload = payload_base_forecast;
    payload.layerIds = layerIds;
    payload.version = forecastVersion;

    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });

    return await response.json();
  }

  static async createLayer(request, demandId, createLayerpayload, forecastVersion, baseChannelsForecastData, amount) {
    const endpointURL = `${process.env.apiBaseURLCDF}${createLayerpayload.endpoint}${demandId}`;

    // API Request
    const response = await request.put(
        endpointURL,
        { 
            data: this.populateCreateLayerPayload(createLayerpayload, forecastVersion, baseChannelsForecastData, amount),
            headers: this.headers
        }
    );

    return await response.json();
  }

  static async getDemandScenarioLayers(request, demandStackId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}`;

    // API Request
    const response = await request.get(endpointURL, {
      headers: this.headers,
    });
    return await response.json();
  }

  static populateBaseChannelsData(forecastData) {
    let data: any[] = [];
    for (let i = 0; i < forecastData.length; i++) {
      if(baseChannelNames.includes(forecastData[i]['baseChannel'].toUpperCase())) {
        let forecastValues = forecastData[i].forecast.filter(
          (forecast) => forecast.year === year && forecast.month === month
        );

        data[forecastData[i]['baseChannel'].toUpperCase()] = forecastValues[0];
      }
    }

    return data;
  }

  static populateCreateLayerPayload(payload, forecastVersion, baseChannelsData, amount) {
    payload.layers[0]["forecastVersion"] = forecastVersion;
    payload.layers[0]["lastUpdated"] = new Date();

    payload.layers[0].monthlySplitsRequest[year+"-"+month][0]["amount"] = baseChannelsData[baseChannelNames[0]]["amount"] + amount;
    payload.layers[0].monthlySplitsRequest[year+"-"+month][1]["amount"] = baseChannelsData[baseChannelNames[1]]["amount"] - amount;
    payload.layers[0].monthlySplitsRequest[year+"-"+month][2]["amount"] = baseChannelsData[baseChannelNames[2]]["amount"];
    payload.layers[0].monthlySplitsRequest[year+"-"+month][3]["amount"] = baseChannelsData[baseChannelNames[3]]["amount"];

    return payload;
  }

}
