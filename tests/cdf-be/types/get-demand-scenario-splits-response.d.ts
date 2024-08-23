import type { Forecast } from "./get-demand-scenario-forecast-response";

export interface BaseChannel {
    baseChannel: string
    demandChannel: string
    forecast: Forecast[]
    displayOrder: number
    displayName: string
    sbuId: number
    baseChannelId: number
    demandChannelId: number
}

export interface DemandChannel {
    demandChannel: string
    forecast: Forecast[]
    baseChannelForecast: BaseChannel[]
    sbuId: number
    demandChannelId: number
}

export interface GetDemandScenarioSplitResponse {
    forecast: DemandChannel[],
    overrideForecast: DemandChannel[]
}