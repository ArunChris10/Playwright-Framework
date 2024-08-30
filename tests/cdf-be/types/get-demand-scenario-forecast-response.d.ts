// Note: Many of these records modeling the API response are incomplete.
// If something is missing, and you need to access it, you can add the property/type
export interface Forecast {
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
    departmentIdAndNameConcat: string,
    departmentDisplayName: string,
    sbuDisplayName: string,
    forecast: Forecast[]
}

export interface Channel {
    baseChannel: string,
    forecast: Forecast[],
    displayOrder: number
    displayName: string,
    baseChannelId: string,
}

interface ForecastTotal {
    sbu: 'Total' | 'Total Ex Photo' | 'ETS Ex Photo'
    forecast: Forecast[]
}

interface ForecastTotals {
    grandTotal: ForecastTotal
    totalAfterExcludingDepartments: ForecastTotal
    TotalOfExcludingDepartments: ForecastTotal
}

interface TotalAfterExcludingDepartments {
    sbu: string
    forecast: Forecast[]
}

interface TotalOfExcludingDepartments {
    sbu: string
    forecast: Forecast[]
}

interface ForecastTotals {
    grandTotal: ForecastTotal
    totalAfterExcludingDepartments: TotalAfterExcludingDepartments
    totalOfExcludingDepartments: TotalOfExcludingDepartments[]
}

export interface GetDemandScenarioForecastResponse<forecastType> {
    forecast: forecastType[]
    forecastTotals?: ForecastTotals
}


export type organizationalLevel = 'SBU' | 'BASE_CHANNEL'