// Note: Many of these records modeling the API response are incomplete.
// If something is missing, and you need to access it, you can add the property/type
interface Forecast {
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

interface SBU {
    sbu: string
    sbuDisplayName: string
    forecast: Forecast[]
    displayOrder: number
    displayName: string
    sbuId: number
}

export interface Department {
    sbu: string,
    department: string,
    departmentId: number
    forecast: Forecast[]
}

export interface Channel {
    baseChannel: string,
    forecast: Forecast[],
    displayOrder: number
    displayName: string,
    baseChannelId: string,
}

interface ForecastTotals {
    sbu: 'Total'
    forecast: Forecast[]
}

interface TotalAfterExcludingDepartments {
    sbu: 'Total Ex Photo'
    forecast: Forecast[]
}

interface TotalOfExcludingDepartments {
    sbu: 'ETS Ex Photo'
    forecast: Forecast[]
}

// forecastTotals exists if the request body's filterLevel is 'MONTH'
export interface GetDemandScenarioForecastResponse<forecastType> {
    forecastTotals?: ForecastTotals
    totalAfterExcludingDepartments: TotalAfterExcludingDepartments
    totalOfExcludingDepartments: TotalOfExcludingDepartments
    forecast: forecastType[]
}


export type organizationalLevel = 'SBU' | 'BASE_CHANNEL'