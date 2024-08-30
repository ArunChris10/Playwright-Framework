interface ForecastInfo {
    "id": string
    "version": string
    "activeStartDate": string
    "name": string,
    "locked": boolean,
    "langType": number,
    "forecastFdfId": string,
    "dateCreated": string
    "lastModified": string
    "createdBy": string,
    "updatedBy": string,
    "status": string,
    "forecastLayerId": string
    "finalized": boolean
}

interface LayerInfo {
    "layerType": string
    "lastUpdatedBy": string
    "lastUpdatedTime": string
    "lastUpdatedByUserName": string | null
}

export interface DemandScenarioDetails {
    demandStackScenarioId: string
    title: string,
    description: string
    "isSystemGenerated": boolean,
    "createdBy": string,
    "createdByUserName": string,
    "dateCreated": string,
    "lastUpdatedBy": string,
    "lastUpdatedByUserName": string,
    "lastUpdatedTime": string,
    "forecastInfoDTO": {
        "forecastInfo": ForecastInfo
        "layerUpdatedInfos": LayerInfo[]
        "primaryScenarioOwner": string
    },
    "isFrozen": boolean,
    "isArchive": boolean,
    "isArchiveBySuperUser": string | null,
    "syncDate": string | null,
    "isAop": boolean | null,
    "isLrp": boolean | null,
    "isCurrent": boolean | null,
    "isUnderConstruction": boolean | null
}
export interface GetDemandScenarioDetailsResponse extends DemandScenarioDetails {}