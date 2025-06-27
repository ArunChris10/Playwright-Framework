export type MonthAlias = "actuals" | "forecast" | "";

export interface MonthData {
  month_alias: MonthAlias;
  actuals?: number | string;
  forecast?: number | string;
  baseline?: number | string;
  isImpacted?: boolean | string;
}

export interface RowData {
  [key: string]: any;
  nodeName: string;
  allocationMethod: string;
}

export interface MonthValue {
  type: MonthAlias;
  value: number | string | null;
}

export interface DiffResult {
  prevKey: string;
  prevValue: number | string | null;
  prevType: MonthAlias;
  nextKey: string;
  nextValue: number | string | null;
  nextType: MonthAlias;
}



