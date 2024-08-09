import debug from "debug";
import allocationsData from "../testdata/allocation-layer-data.json";
import { expect } from "@playwright/test";
import { DemandBaseClass } from "./demand-common-utils";
import commonEndpoints from "../testdata/common-demand-endpoints.json";
import allocationLayer from '../testdata/allocation-layer.json'

export class AllocationUtils extends DemandBaseClass {
  static async getDemandScenarioSplits(
    request,
    demandStackId,
    demandScenarioDetails
  ) {
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

  static async getDemandScenarioForecast(
    request,
    demandStackId,
    demandScenarioDetails,
    layerIds
  ) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.getDemandScenarioForecastEndpoint}${demandStackId}`;
    const payload = {
      sbu: [],
      sbuIds: [],
      department: [],
      departmentIds: [],
      baseChannel: [allocationsData?.targetChannel],
      baseChannelIds: [allocationsData?.targetChannelId],
      channelGroup: [],
      channelGroupIds: [],
      demandChannel: [],
      layerIds: layerIds,
      clearAll: false,
      includeDerivedMetrics: false,
      includeTotals: true,
      organizationalLevel: "SBU",
      loadHeirarchyParams: null,
      timeFilter: {
        filterLevel: allocationsData.filterLevel,
        isYearSelected: false,
        isMonthSelected: false,
        isQuarterSelected: false,
        yearMonths: [],
        yearQuarters: [],
        years: [],
        yearList: [],
      },
      filtersChanged: true,
      filterLoadComplete: true,
      version: demandScenarioDetails?.forecastInfoDTO?.forecastInfo?.version,
      departmentName: [],
      isUfmSyncCache: false,
      latestSyncScenario: false,
    };
    // API Request
    const response = await request.post(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async getDemandScenarioLayers(request, demandStackId) {
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}?layerType=CHANNEL_SPLIT`;
    // API Request
    const response = await request.get(endpointURL, {
      headers: this.headers,
    });
    debug.log(response);
    return await response.json();
  }

  static async updateDemandScenarioSplit(
    request,
    sellerFulfilled,
    mrktplaceFullfilled,
    isConfirmed,
    layerId,
    demandStackId,
    demandScenarioDetails
  ) {
    const dateFormat = `${sellerFulfilled.forecast[0].year}-${
      sellerFulfilled.forecast[0].month < 10
        ? "0" + sellerFulfilled.forecast[0].month
        : sellerFulfilled.forecast[0].month
    }`;
    const endpointURL = `${process.env.apiBaseURLCDF}${commonEndpoints.demandScenarioStacksEndpoint}${demandStackId}`;
    let payload = {
      layers: [
        {
          allocationType: "DOLLAR",
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
            amount: sellerFulfilled.forecast[0].amount + allocationsData?.differenceAmount,
          },
          {
            baseChannel: mrktplaceFullfilled.baseChannel,
            baseChannelId: mrktplaceFullfilled.baseChannelId,
            amount: mrktplaceFullfilled.forecast[0].amount - allocationsData?.differenceAmount,
          },
        ],
      };
    }
    // API Request
    const response = await request.put(endpointURL, {
      data: payload,
      headers: this.headers,
    });
    debug.log(response);
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
      demandScenarioDetails,
      layerIds
    );
    let totalForecasts = response.forecastTotals.grandTotal.forecast;
    totalForecasts = totalForecasts.filter(
      (forecast) => forecast.year === year && forecast.month === month
    );
    return Math.abs(totalForecasts[0].amount - initialAmount);
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
      let aftereEditamount = getScenarioSplitAfter.forecast.filter(c =>c.baseChannelId==basechannelId)[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)[0]
      expect(aftereEditamount).toEqual(amountvalueEdited)
      
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
    let aftereEditamount = getScenarioSplitAfter.forecast.filter(c =>c.baseChannelId==basechannelId)[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)[0]
    expect(aftereEditamount).toEqual(amountvalueEdited)
    
    payloadSbuLevelData.layerIds = [splitData[0].layerId]
    response  = await request.post(endpointURL3,  { data: payloadSbuLevelData, headers: AllocationUtils.headers });  
    const getsbuleveldataAfter = await response.json();
    const sbuleveldataAfter = getsbuleveldataAfter.forecast[0].forecast.filter(c=>c.year == yearvalue && c.month == monthdata).map(c=>c.amount)
    
    expect(sbuleveldataBefore).not.toEqual(sbuleveldataAfter);
    expect((sbuleveldataAfter/sbuleveldataBefore).toFixed(8)).toEqual((amountvalueEdited/beforeamountvalueEdited).toFixed(8));
   
    return getsbuleveldataAfter;
}

}
