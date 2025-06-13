import { expect } from "playwright/test";
import mapping from "../testdata/ufm-currentdemand-metrics-mapping.json";
import { Utility } from "../../common/fixtures/utils";

/**
 * Extracts and rounds forecast months from Current Demand data for a given metric key.
 * @param slotPublishedData - The forecastTotals object from Current Demand response.
 * @param metricKey - The key in the mapping file (e.g., 'grossGmv').
 * @param mapping - The mapping object from the JSON mapping file.
 * @returns Array of { month: string, forecast: number }
 */
export function extractMonthsDataFromCurrentDemand(
  currentDemandGetResponse: any,
  metricKey: string,
  mappingArg?: any
) {
  const usedMapping = mappingArg || mapping;
  const slotPublishedData = currentDemandGetResponse.forecastTotals;
  const displayName = usedMapping[metricKey]?.currentDemandDisplayName;
  if (!displayName)
    throw new Error(`Display name not found for metricKey: ${metricKey}`);
  const forecastRows = slotPublishedData.grandTotal.forecast;
  return forecastRows.map((row: any) => {
    const month = `${row.year}${row.month.toString().padStart(2, "0")}`;
    return {
      month,
      forecast:
        Number(row[metricKey]) ||
        Number(row[displayName]),
    };
  });
}

/**
 * Extracts and rounds forecast months from KPI data for a given nodevarname.
 * @param kpiRowData - The rowData array from KPI response.
 * @param nodevarname - The nodevarname from the mapping file.
 * @returns Array of { month: string, forecast: number }
 */
export function extractMonthsDataFromKPI(
  ufmGetKPIResponse: any,
  nodevarname: string,
  mappingArg?: any
) {
  const getKpiSourcedData = ufmGetKPIResponse.rowData;
  const kpiRow = getKpiSourcedData.find(
    (row: any) => row.driver === nodevarname
  );
  if (!kpiRow)
    throw new Error(`KPI row not found for nodevarname: ${nodevarname}`);
  return Object.entries(kpiRow)
    .filter(
      ([key, value]: [string, any]) =>
        /^\d{6}$/.test(key) &&
        value &&
        value.month_alias === "forecast" &&
        value.forecast !== ""
    )
    .map(([key, value]: [string, any]) => ({
      month: key,
      forecast: Number(value.forecast),
    }));
}

/**
 * Extracts and rounds forecast months from KPI data for a given nodevarname.
 * @param data - KPI response.
 * @param monthKey - Month for which the data needs to be retrieved.
 * @returns Array of { drivername: string, forecast: number }
 */
export function extractDriverForecastFromKpi(
  data: { rowData: any[] },
  monthKey: string
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const row of data.rowData) {
    if (
      row.driver &&
      row[monthKey] &&
      typeof row[monthKey].baseline === "number"
    ) {
      result[row.driver] = row[monthKey].forecast;
    }
  }
  return result;
}

/**
 * Compares two arrays of forecast months, filtering to only shared months and asserting equality.
 * @param currentDemandForecastMonths - Array from Current Demand.
 * @param kpiForecastMonths - Array from KPI.
 */
export function compareFilteredForecastMonthsForCurrentDemandAndKPI(
  currentDemandForecastMonths: any[],
  kpiForecastMonths: any[],
  tolerance: number = 0.5,
  metricKey?: string // Optional: pass metricKey for better error context
) {
  const kpiMonthsSet = new Set(kpiForecastMonths.map((k) => k.month));
  const filteredCurrentDemandForecastMonths =
    currentDemandForecastMonths.filter((cd) => kpiMonthsSet.has(cd.month));

  console.log(`Comparing the data :`, {
    filteredCurrentDemandForecastMonths,
    kpiForecastMonths,
  });

  try {
    expect(filteredCurrentDemandForecastMonths.length).toEqual(
      kpiForecastMonths.length
    );
    Utility.expectArraysToBeClose(
      filteredCurrentDemandForecastMonths,
      kpiForecastMonths,
      tolerance
    );
  } catch (error) {
    throw new Error(
      `Comparison failed for metric${metricKey ? ` '${metricKey}'` : ""}.\n` +
      `Current Demand: ${JSON.stringify(filteredCurrentDemandForecastMonths, null, 2)}\n` +
      `KPI: ${JSON.stringify(kpiForecastMonths, null, 2)}\n` +
      `Error: ${error instanceof Error ? error.message : error}`
    );
  }
}

/**
 * Compares the published data from current demand with KPI sourced data for all mapped metrics.
 * @param ufmGetKPIResponse - KPI API response object.
 * @param currentDemandGetResponse - Current Demand API response object.
 * @param mappingArg - (Optional) mapping object to use for metric mapping. If not provided, uses default mapping from testdata.
 */
export async function compareUFMDataToCurrentDemand(
  ufmGetKPIResponse: any,
  currentDemandGetResponse: any,
  mappingArg?: any,
  tolerance: number = 0.5
) {
  const usedMapping = mappingArg || mapping;
  for (const metricKey of Object.keys(usedMapping)) {
    const { nodevarname, currentDemandDisplayName } = usedMapping[metricKey];
    const currentDemandForecastMonths =
      extractMonthsDataFromCurrentDemand(
        currentDemandGetResponse,
        metricKey,
        usedMapping
      );
    const kpiForecastMonths = extractMonthsDataFromKPI(
      ufmGetKPIResponse,
      nodevarname,
      usedMapping
    );
     console.log(`Comparing the data for metric '${currentDemandDisplayName}':`);
      compareFilteredForecastMonthsForCurrentDemandAndKPI(
        currentDemandForecastMonths,
        kpiForecastMonths,
        tolerance,
        metricKey
      );
    
  }
}
