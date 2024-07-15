export type figure = {
    name: 'absolute' | 'millions' | 'billions'
    unit: 'M' | 'B' | 'absolute'
}

export type metric = {
    name: string,
    unit: '$' | '%' | ''
}

export type filterKey = keyof filterCategories
export type filterCategories = {
    channelGroups: string[];
    channels: string[];
    sbus: string[];
    departments: string[]
    years: string[]
    quarters: string[]
    months: string[]
}

export type view = 'year' | 'quarter' | 'month' | figure["name"]

export type testData = {
    filterCategories: filterCategories,
    excludedCategories: filterCategories,
    metrics: metric[],
    figures: figure[],
}