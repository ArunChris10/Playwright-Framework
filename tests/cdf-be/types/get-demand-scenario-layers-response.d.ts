// Incomplete definition. Add props if needed.
export interface Layer {
    layerId: string,
    layerName: string,
    layerType: string,
}

export interface GetDemandScenarioLayersResponse {
    layers: Layer[]
    splittableDemandChannels: string[]
    splittableDemandChannelsDto: {
        id: string,
        name: string,
    }[]
}