import debug from "debug";
import allocationsData from "../testdata/allocation-layer-data.json";
import { APIRequestContext, APIResponse, expect } from "@playwright/test";
import { DemandBaseClass } from "./demand-common-utils";
import commonEndpoints from "../testdata/common-demand-endpoints.json";
import highlighterlayer from "../testdata/highlighter-layer-allocation-data.json";
import allocationLayer from '../testdata/allocation-layer.json'

import type { GetDemandScenarioLayersResponse } from "../types/get-demand-scenario-layers-response";
import { DemandScenarioDetails } from "../types/get-demand-scenario-details-response";
import { BaseChannel, GetDemandScenarioSplitResponse} from "../types/get-demand-scenario-splits-response";

export class AllocationUtils extends DemandBaseClass {
  static async getDemandScenarioSplits(
    request: APIRequestContext,
    demandStackId: string,
    demandScenarioDetails: DemandScenarioDetails
  ): Promise<GetDemandScenarioSplitResponse> {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioSplitsEndpoint}`;
    const payload = {
      demandStackScenarioId: demandStackId,
      forecastFilter: {
        version: demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
        sbu: [],
        department: [],
        baseChannel: [],
        demandChannel: [allocationsData?.sourceChannel],
        layerIds: [],
        timeFilter: {
          filterLevel: allocationsData?.filterLevel,
          yearMonths: [],
          quarters: {},
        },
        demandChannelIds: [allocationsData?.sourceChannelId],
      },
    };
    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async getDemandScenarioLayers(request: APIRequestContext, demandStackId: string): Promise<GetDemandScenarioLayersResponse> {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}?layerType=CHANNEL_SPLIT`;
    // API Request
    const response = await request.get(endpointURL, {
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async deleteAllocationLayer(request, demandStackId, layerId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioEndpoint}${demandStackId}${allocationsData.layerEndpoint}${layerId}`;
    debug.log(endpointURL);
    
    const response = await request.delete(endpointURL, {
      headers: this.headers,
    });
    return response;
  }

  static async updateDemandScenarioSplit(
    request: APIRequestContext,
    sellerFulfilled: BaseChannel,
    marketplaceFulfilled: BaseChannel,
    isConfirmed: boolean,
    layerId: string | null,
    demandStackId: string,
    demandScenarioDetails: DemandScenarioDetails,
    allocationType: 'DOLLAR' | 'CONVERTED_SALE' = 'DOLLAR',
    modificationAmount?: [ number, number ]
  ): Promise<APIResponse> {
    const dateFormat = `${sellerFulfilled.forecast[0].year}-${
      sellerFulfilled.forecast[0].month < 10
        ? "0" + sellerFulfilled.forecast[0].month
        : sellerFulfilled.forecast[0].month
    }`;
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}`;
    let payload = {
      layers: [
        {
          allocationType,
          layerType: "CHANNEL_SPLIT",
          isConfirmed: isConfirmed,
          isPreview: !isConfirmed,
          layerName: allocationsData?.sourceChannel,
          layerDescription: "",
          forecastVersion:
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
          demandChannel: sellerFulfilled.demandChannel,
          demandChannelId: sellerFulfilled.demandChannelId,
          lastUpdated:
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.lastModified,
          monthlySplitsRequest: undefined,
          layerId: undefined,
        },
      ],
    };
    if (layerId) {
      payload.layers[0].layerId = layerId;
    } else {
      payload.layers[0].monthlySplitsRequest = {
        [dateFormat]: [
          {
            baseChannel: sellerFulfilled.baseChannel,
            baseChannelId: sellerFulfilled.baseChannelId,
            amount: modificationAmount
                ? modificationAmount[0]
                : sellerFulfilled.forecast[0][allocationsData.allocationType[allocationType]] + allocationsData?.differenceAmount,
          },
          {
            baseChannel: marketplaceFulfilled.baseChannel,
            baseChannelId: marketplaceFulfilled.baseChannelId,
            amount:  modificationAmount
                ? modificationAmount[1]
                : marketplaceFulfilled.forecast[0][allocationsData.allocationType[allocationType]] - allocationsData?.differenceAmount,
          },
        ],
      };
    }
    // API Request
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });

    debug.log(JSON.stringify(response));
    expect(response.status()).toEqual(200)

    return await response.json();
  }

  static async verifyGeneratePreviewAllocationSplitLayer(
    request,
    demandStackId,
    demandScenarioDetails
  ) {
    const getScenarioSplit = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    const sellerFulfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[0];
    const mrktplaceFullfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[1];
    const putScenarioSplit = await this.updateDemandScenarioSplit(
      request,
      sellerFulfilled,
      mrktplaceFullfilled,
      false,
      null,
      demandStackId,
      demandScenarioDetails
    );
    const getScenarioSplitPostUpdate = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    expect(
      getScenarioSplitPostUpdate.overrideForecast[0].baseChannelForecast[0]
        .forecast[0].amount ===
        getScenarioSplit.overrideForecast[0].baseChannelForecast[0].forecast[0]
          .amount &&
        getScenarioSplit.overrideForecast[0].baseChannelForecast[1].forecast[0]
          .amount ===
          getScenarioSplitPostUpdate.overrideForecast[0].baseChannelForecast[1]
            .forecast[0].amount
    ).toBe(true);
    return putScenarioSplit[0].layerId;
  }

  static async verifySaveAllocationSplitLayer(
    request,
    layerId,
    demandStackId,
    demandScenarioDetails
  ) {
    const getScenarioSplit = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    const sellerFulfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[0];
    const mrktplaceFullfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[1];
    const lockDemandScenarioResponse = await this.lockUnlockDemandScenario(
      request,
      "lock",
      demandStackId
    );
    expect(lockDemandScenarioResponse).toBeOK();
    const putScenarioSplitConfirmed = await this.updateDemandScenarioSplit(
      request,
      sellerFulfilled,
      mrktplaceFullfilled,
      true,
      layerId,
      demandStackId,
      demandScenarioDetails
    );
    return putScenarioSplitConfirmed;
  }

  static async verifySelectedLayer(request, demandStackId) {
    const layersData = await this.getDemandScenarioLayers(
      request,
      demandStackId
    );
    const layerIds = layersData.layers.map((layer) => layer.layerId);

    return layerIds;
  }

  static async verifyDataOnRemovingLayer(
    request,
    demandStackId,
    demandScenarioDetails,
    layerId
  ) {
    const getScenarioSplit = await this.getDemandScenarioSplits(
      request,
      demandStackId,
      demandScenarioDetails
    );
    const sellerFulfilled =
      getScenarioSplit.overrideForecast[0].baseChannelForecast[0];
    const month = sellerFulfilled.forecast[0].month;
    const year = sellerFulfilled.forecast[0].year;
    const initialAmount = sellerFulfilled.forecast[0].amount;

    const layersData = await this.getDemandScenarioLayers(
      request,
      demandStackId
    );
    let layerIds = layersData.layers.map((layer) => layer.layerId);
    layerIds = layerIds.filter((layer) => layer !== layerId);
    const response = await this.getDemandScenarioForecast(
      request,
      demandStackId,
      demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
      allocationsData.filterLevel,
      "SBU",
      layerIds,
      [allocationsData?.targetChannel],
      [allocationsData?.targetChannelId]
    );
    let totalForecasts = response.forecastTotals.grandTotal.forecast;
    totalForecasts = totalForecasts.filter(
      (forecast) => forecast.year === year && forecast.month === month
    );
    return Math.abs(totalForecasts[0].amount - initialAmount);
  }

  static async allocationdeallocation(request, demandStackId, demandScenarioDetails){
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationsData.demandStacksEndpoint}${demandStackId}`;
    const payload = {
      layers: [
        {
          layerType: "HIGHLIGHTER",
          forecastVersion:
            demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
          isConfirmed: true,
          layerName: allocationsData.layerName,
          layerDescription: allocationsData.layerName,
          allocationType: "DOLLAR",
          isPreview: false,
          highlighterAllocationsList: [highlighterlayer]
        },
      ],
    };
    this.headers["Connection"] = "keep-alive";
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    console.log(await response.json());
    return await response.json();
  }

  static async getDemandScenarioStack(request, demandStackId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationsData.demandStacksEndpoint}${demandStackId}`;
    // API Request
    const response = await request.get(endpointURL, {
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }
  static async getDemandSplitsData(request, demandScenarioID, type,forecastVersion){
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationLayer[type].baseURL}`;
    console.log("getDemandSplitsData: " + endpointURL);
    let data = allocationLayer[type]
    data.forecastFilter.verision = forecastVersion
    data.demandStackScenarioId = demandScenarioID;
    let response = await request.post(
        endpointURL,
        { data: data, headers: AllocationUtils.headers }
      );
      let responseBody = await response.json();
      return responseBody
   }

   static async createAllocationLayerUnscheduledDeliverySplitPreview(request, demandScenarioID,demandScenarioDetails){
      const endpointURL = `${process.env.apiBaseURLCDF}${allocationLayer.allocationLayerUnscheduledDeliverySplit.baseURL}${demandScenarioID}`
      console.log("allocationLayerUnscheduledDeliverySplitData: " + endpointURL);
      const forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version
      const DemandSplitsData = await AllocationUtils.getDemandSplitsData(request, demandScenarioID, "allocationLayerUnscheduledDeliverySplitData",forecastVersion)
      const endpointURL2 = `${process.env.apiBaseURLCDF}${allocationLayer.forecastScenarios.baseURL}${demandScenarioID}`
      let i =0 
      let monthlySplitsRequestkey = ''
      let yearvalue
      let monthvalue
      let monthdata
      let amountvalueEdited
      let beforeamountvalueEdited
      let channelId
      let channelname
      const monthlySplitsRequestkeyData = DemandSplitsData?.forecast[0].baseChannelForecast.map(channel => {
          if(i==0){
            beforeamountvalueEdited = channel.forecast[0].amount
            amountvalueEdited = channel.forecast[0].amount+100000
            channelId = channel.baseChannelId
            channelname = channel.baseChannel
          }
          i=i+1
          monthvalue = channel.forecast[0].month.length>1 ? channel.forecast[0].month : "-0"+channel.forecast[0].month
          monthdata = channel.forecast[0].month
          yearvalue = channel.forecast[0].year
          monthlySplitsRequestkey = yearvalue + monthvalue
          return {amount : i%2==1 ?channel.forecast[0].amount+100000 :channel.forecast[0].amount-100000 , baseChannelId: channel.baseChannelId , baseChannel: channel.baseChannel}
        })
    
      const endpointURL3 = `${process.env.apiBaseURLCDF}${allocationLayer.sbuleveldata.baseURL}${demandScenarioID}`
      let payloadSbuLevelData = allocationLayer.sbuleveldata
      payloadSbuLevelData.version = forecastVersion
      payloadSbuLevelData.baseChannel = [channelname]
      payloadSbuLevelData.baseChannelIds = [channelId]
      payloadSbuLevelData.loadHeirarchyParams.baseChannel=[channelname]
      payloadSbuLevelData.loadHeirarchyParams.baseChannelIds = [channelId]
      let response  = await request.post(endpointURL3,  { data: payloadSbuLevelData, headers: AllocationUtils.headers });  
      const getsbuleveldataBefore = await response.json();
      
      let sbuleveldataBefore = getsbuleveldataBefore.forecast[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)
     
      let payloadAllocationLayerSplit  = allocationLayer.allocationLayerUnscheduledDeliverySplit  
      payloadAllocationLayerSplit.layers[0].monthlySplitsRequest[monthlySplitsRequestkey] =  monthlySplitsRequestkeyData  
      payloadAllocationLayerSplit.layers[0].forecastVersion = forecastVersion         
      await AllocationUtils.lockScenario(request, demandScenarioID);                 
      response = await request.put(endpointURL,  { data: payloadAllocationLayerSplit, headers: AllocationUtils.headers });
      expect(response).toBeOK();
      let splitData = await response.json();
      debug.log(JSON.stringify(splitData));
  
      let payloadForecastScenarios =  allocationLayer.forecastScenarios
      payloadForecastScenarios.version = forecastVersion
      payloadForecastScenarios.layerIds = [splitData[0].layerId]
  
      response = await request.post(endpointURL2,  { data: payloadForecastScenarios, headers: AllocationUtils.headers });
      const getScenarioSplitAfter  = await response.json()
      let basechannelId=  DemandSplitsData?.forecast[0].baseChannelForecast[0].baseChannelId
      getScenarioSplitAfter.forecast.filter(c =>c.baseChannelId==basechannelId)[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount).forEach(c=>expect(c).toEqual(amountvalueEdited))
      payloadSbuLevelData.layerIds = [splitData[0].layerId]
      response  = await request.post(endpointURL3,  { data: payloadSbuLevelData, headers: AllocationUtils.headers });  
      const getsbuleveldataAfter = await response.json();
      const sbuleveldataAfter = getsbuleveldataAfter.forecast[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)
      
      expect(sbuleveldataBefore).not.toEqual(sbuleveldataAfter);
      expect((sbuleveldataAfter/sbuleveldataBefore).toFixed(8)).toEqual((amountvalueEdited/beforeamountvalueEdited).toFixed(8));
     
      return getsbuleveldataAfter;
  }

  static async createAllocationLayerMarketSplitPreview(request, demandScenarioID,demandScenarioDetails){
    const endpointURL = `${process.env.apiBaseURLCDF}${allocationLayer.allocationLayerMarketSplit.baseURL}${demandScenarioID}`
    console.log("allocationLayerMarketSplitData: " + endpointURL);
    const forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version

    const endpointURL2 = `${process.env.apiBaseURLCDF}${allocationLayer.forecastScenarios.baseURL}${demandScenarioID}`
    
    const DemandSplitsData = await AllocationUtils.getDemandSplitsData(request, demandScenarioID,"allocationLayerMarketSplitData",forecastVersion)
    let i =0 
    let monthlySplitsRequestkey = ''
    let yearvalue
    let monthvalue
    let monthdata
    let amountvalueEdited
    let beforeamountvalueEdited
    let channelId
    let channelname
    const monthlySplitsRequestkeyData = DemandSplitsData?.forecast[0].baseChannelForecast.map(channel => {
        if(i==0){
          beforeamountvalueEdited = channel.forecast[0].amount
          amountvalueEdited = channel.forecast[0].amount+100000
          channelId = channel.baseChannelId
          channelname = channel.baseChannel
        }
        i=i+1
        monthvalue = channel.forecast[0].month.length>1 ? channel.forecast[0].month : "-0"+channel.forecast[0].month
        monthdata = channel.forecast[0].month
        yearvalue = channel.forecast[0].year
        monthlySplitsRequestkey = yearvalue + monthvalue
        return {amount : i%2==1 ?channel.forecast[0].amount+100000 :channel.forecast[0].amount-100000 , baseChannelId: channel.baseChannelId , baseChannel: channel.baseChannel}
      })
  
    const endpointURL3 = `${process.env.apiBaseURLCDF}${allocationLayer.sbuleveldata.baseURL}${demandScenarioID}`
    let payloadSbuLevelData = allocationLayer.sbuleveldata
    payloadSbuLevelData.version = forecastVersion
    payloadSbuLevelData.baseChannel = [channelname]
    payloadSbuLevelData.baseChannelIds = [channelId]
    payloadSbuLevelData.loadHeirarchyParams.baseChannel=[channelname]
    payloadSbuLevelData.loadHeirarchyParams.baseChannelIds = [channelId]
    let response  = await request.post(endpointURL3,  { data: payloadSbuLevelData, headers: AllocationUtils.headers });  
    const getsbuleveldataBefore = await response.json();
    
    let sbuleveldataBefore = getsbuleveldataBefore.forecast[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)
   
   
    let payloadAllocationLayerSplit  = allocationLayer.allocationLayerMarketSplit  
    payloadAllocationLayerSplit.layers[0].monthlySplitsRequest[monthlySplitsRequestkey] =  monthlySplitsRequestkeyData  
    payloadAllocationLayerSplit.layers[0].forecastVersion = forecastVersion        
    await AllocationUtils.lockScenario(request, demandScenarioID);                  
    response = await request.put(endpointURL,  { data: payloadAllocationLayerSplit, headers: AllocationUtils.headers });
    expect(response).toBeOK();
    let splitData = await response.json();
    debug.log(JSON.stringify(splitData));

    let payloadForecastScenarios =  allocationLayer.forecastScenarios
    payloadForecastScenarios.version = forecastVersion
    payloadForecastScenarios.layerIds = [splitData[0].layerId]

    response = await request.post(endpointURL2,  { data: payloadForecastScenarios, headers: AllocationUtils.headers });
    const getScenarioSplitAfter  = await response.json()
    let basechannelId=  DemandSplitsData?.forecast[0].baseChannelForecast[0].baseChannelId
    getScenarioSplitAfter.forecast.filter(c =>c.baseChannelId==basechannelId)[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount).forEach(c=>expect(c).toEqual(amountvalueEdited))
    
    payloadSbuLevelData.layerIds = [splitData[0].layerId]
    response  = await request.post(endpointURL3,  { data: payloadSbuLevelData, headers: AllocationUtils.headers });  
    const getsbuleveldataAfter = await response.json();
    const sbuleveldataAfter = getsbuleveldataAfter.forecast[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)
    
    expect(sbuleveldataBefore).not.toEqual(sbuleveldataAfter);
    expect((sbuleveldataAfter/sbuleveldataBefore).toFixed(8)).toEqual((amountvalueEdited/beforeamountvalueEdited).toFixed(8));
   
    return getsbuleveldataAfter;
}

static async marketSplitAurConstant(request, demandScenarioID,demandScenarioDetails){
  const endpointURL = `${process.env.apiBaseURLCDF}${allocationLayer.allocationLayerMarketSplit.baseURL}${demandScenarioID}`
  console.log("allocationLayerMarketSplitData: " + endpointURL);
  const forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version

  const endpointURL2 = `${process.env.apiBaseURLCDF}${allocationLayer.forecastScenarios.baseURL}${demandScenarioID}`
  
  const DemandSplitsData = await AllocationUtils.getDemandSplitsData(request, demandScenarioID,"allocationLayerMarketSplitData",forecastVersion)
  let i =0 
  let monthlySplitsRequestkey = ''
  let yearvalue
  let monthvalue
  let monthdata
  let amountvalueEdited
  let beforeamountvalueEditedAur
  let beforeamountvalueEditedScannedUnits
  let channelId
  let channelname
  const monthlySplitsRequestkeyData = DemandSplitsData?.forecast[0].baseChannelForecast.map(channel => {
      if(i==0){
        beforeamountvalueEditedAur = channel.forecast[0].aur
        beforeamountvalueEditedScannedUnits = channel.forecast[0].units
        amountvalueEdited = channel.forecast[0].amount+100000
        channelId = channel.baseChannelId
        channelname = channel.baseChannel
      }
      i=i+1
      monthvalue = channel.forecast[0].month.length>1 ? channel.forecast[0].month : "-0"+channel.forecast[0].month
      monthdata = channel.forecast[0].month
      yearvalue = channel.forecast[0].year
      monthlySplitsRequestkey = yearvalue + monthvalue
      return {amount : i%2==1 ?channel.forecast[0].amount+100000 :channel.forecast[0].amount-100000 , baseChannelId: channel.baseChannelId , baseChannel: channel.baseChannel}
    })

  let payloadAllocationLayerSplit  = allocationLayer.allocationLayerMarketSplit  
  payloadAllocationLayerSplit.layers[0].monthlySplitsRequest[monthlySplitsRequestkey] =  monthlySplitsRequestkeyData  
  payloadAllocationLayerSplit.layers[0].forecastVersion = forecastVersion       
  payloadAllocationLayerSplit.layers[0].isConfirmed = true
  payloadAllocationLayerSplit.layers[0].isPreview = false
  const lockDemandScenarioResponse = await this.lockUnlockDemandScenario(
    request,
    "lock",
    demandScenarioID
  );
  expect(lockDemandScenarioResponse).toBeOK();
  let response = await request.put(endpointURL,  { data: payloadAllocationLayerSplit, headers: AllocationUtils.headers });
  expect(response).toBeOK();
  let splitData = await response.json();
  debug.log(JSON.stringify(splitData));

  let payloadForecastScenarios =  allocationLayer.forecastScenarios
  payloadForecastScenarios.version = forecastVersion
  payloadForecastScenarios.layerIds = [splitData[0].layerId]

  response = await request.post(endpointURL2,  { data: payloadForecastScenarios, headers: AllocationUtils.headers });
  const getScenarioSplitAfter  = await response.json()
  let basechannelId=  DemandSplitsData?.forecast[0].baseChannelForecast[0].baseChannelId
  getScenarioSplitAfter.forecast.filter(c =>c.baseChannelId==basechannelId)[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.aur).forEach(c=>expect(c).toEqual(beforeamountvalueEditedAur))
  getScenarioSplitAfter.forecast.filter(c =>c.baseChannelId==basechannelId)[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.units).forEach(c=>expect(c).not.toEqual(beforeamountvalueEditedScannedUnits))

  
  return getScenarioSplitAfter;
}

static async demandChannelConstCheck(request, demandScenarioID,demandScenarioDetails){
  const endpointURL = `${process.env.apiBaseURLCDF}${allocationLayer.allocationLayerMarketSplit.baseURL}${demandScenarioID}`
  console.log("allocationLayerMarketSplitData: " + endpointURL);
  const forecastVersion = demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version

  const endpointURL2 = `${process.env.apiBaseURLCDF}${allocationLayer.forecastScenarios.baseURL}${demandScenarioID}`

  const DemandSplitsData = await AllocationUtils.getDemandSplitsData(request, demandScenarioID,"allocationLayerMarketSplitData",forecastVersion)

  let amountvalueEdited

  let monthlySplitsData = await AllocationUtils.getDyanamicMonthlySplitsRequestkeyData(DemandSplitsData)
  let monthlySplitsRequestkeyData  = monthlySplitsData[0]
  let yearvalue =  monthlySplitsData[1]
  let monthdata = monthlySplitsData[2]
  let monthlySplitsRequestkey =  monthlySplitsData[3]

  amountvalueEdited =  DemandSplitsData.forecast[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)[0]

  await AllocationUtils.lockScenario(request, demandScenarioID);
  
  let layerID = await AllocationUtils.createMarketSplitLayer(request, demandScenarioID,monthlySplitsRequestkeyData, forecastVersion,monthlySplitsRequestkey)

  let payloadForecastScenarios =  allocationLayer.forecastScenarios
  payloadForecastScenarios.version = forecastVersion
  payloadForecastScenarios.layerIds = [layerID]

  const getScenarioSplitAfter = await AllocationUtils.getDemandSplitsData(request, demandScenarioID,"allocationLayerMarketSplitData",forecastVersion)
  getScenarioSplitAfter.forecast[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount).forEach(c=>expect(c).toEqual(amountvalueEdited))

  return getScenarioSplitAfter;
}

static async getDyanamicMonthlySplitsRequestkeyData (DemandSplitsData){
  let i =0 
  let monthlySplitsRequestkey = ''
  let yearvalue
  let monthvalue
  let monthdata
  const monthlySplitsRequestkeyData = DemandSplitsData?.forecast[0].baseChannelForecast.map(channel => {
      i=i+1
      monthvalue = channel.forecast[0].month.length>1 ? channel.forecast[0].month : "-0"+channel.forecast[0].month
      monthdata = channel.forecast[0].month
      yearvalue = channel.forecast[0].year
      monthlySplitsRequestkey = yearvalue + monthvalue
      return {amount : i%2==1 ?channel.forecast[0].amount+100000 :channel.forecast[0].amount-100000 , baseChannelId: channel.baseChannelId , baseChannel: channel.baseChannel}
    })
    return [monthlySplitsRequestkeyData , yearvalue, monthdata, monthlySplitsRequestkey]
}

static async lockScenario(request, demandScenarioID) {
  const lockDemandScenarioResponse = await this.lockUnlockDemandScenario(
    request,
    "lock",
    demandScenarioID
  );
  expect(lockDemandScenarioResponse).toBeOK();
}

static async createMarketSplitLayer(request, demandScenarioID,monthlySplitsRequestkeyData, forecastVersion,monthlySplitsRequestkey) {
  const endpointURL = `${process.env.apiBaseURLCDF}${allocationLayer.allocationLayerMarketSplit.baseURL}${demandScenarioID}`
  
  let payloadAllocationLayerSplit  = allocationLayer.allocationLayerMarketSplit  
  payloadAllocationLayerSplit.layers[0].monthlySplitsRequest[monthlySplitsRequestkey] =  monthlySplitsRequestkeyData  
  payloadAllocationLayerSplit.layers[0].forecastVersion = forecastVersion       
  payloadAllocationLayerSplit.layers[0].isConfirmed = true
  payloadAllocationLayerSplit.layers[0].isPreview = false
  
  let response = await request.put(endpointURL,  { data: payloadAllocationLayerSplit, headers: AllocationUtils.headers });
  expect(response).toBeOK();
  let splitData = await response.json();
  return splitData[0].layerId
}
}
