interface forecast {
    year: number
    quarter: number
    month: number
    amount: number
    units: number
    aur: number
    sales: number
    uomValue: number
    grossGmv: number
    grossUnit: number
}

interface sbu {
    sbu: string
    sbuDisplayName: string
    forecast: forecast[]
    displayOrder: number
    displayName: string
    sbuId: number
}

interface channel {
    baseChannel: string,
    forecast: forecast[],
    displayOrder: number
    displayName: string,
    baseChannelId: string,
}

interface forecastTotals {
    sbu: 'Total'
    forecast: forecast[]
}

interface totalAfterExcludingDepartments {
    sbu: 'Total Ex Photo'
    forecast: forecast[]
}

interface totalOfExcludingDepartments {
    sbu: 'ETS Ex Photo'
    forecast: forecast[]
}

// forecastTotals exists if the request body's filterLevel is 'MONTH'
export interface GetDemandScenarioForecastResponse {
    forecastTotals?: forecastTotals
    totalAfterExcludingDepartments: totalAfterExcludingDepartments
    totalOfExcludingDepartments: totalOfExcludingDepartments
    forecast: channel[] | sbu[]
}

export type organizationalLevel = 'SBU' | 'BASE_CHANNEL'