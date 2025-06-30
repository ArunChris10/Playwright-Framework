import { MonthData, MonthValue, RowData, DiffResult } from '../type/types';

export function comparePreviousAndNext(
  previousMap: Map<string, MonthValue>,
  nextMap: Map<string, MonthValue>,
  driver :string
): DiffResult[] {
  const diffs: DiffResult[] = [];

  const prevKeys = Array.from(previousMap.keys());
  const nextKeys = Array.from(nextMap.keys());

  const length = Math.min(prevKeys.length, nextKeys.length);

  for (let i = 0; i < length; i++) {
    const prevKey = prevKeys[i];
    const nextKey = nextKeys[i];

    const prevData = previousMap.get(prevKey)!;
    const nextData = nextMap.get(nextKey)!;

    if (prevData.value !== nextData.value) {
      diffs.push({
      prevKey,
      prevValue: prevData.value,
      prevType: prevData.type,
      nextKey,
      nextValue: nextData.value,
      nextType: nextData.type,
      });

      // Soft assert for logging differences
      if (prevData.value !== nextData.value) {
        console.warn(
          `Soft Assert: Value mismatch for keys ${prevKey} and ${nextKey}. Driver: ${driver}. Previous Value: ${prevData.value}, Next Value: ${nextData.value}`
        );
      }
    }
  }

  return diffs;
}


export function getPreviousAndNextData(
  row: RowData,
  currentKey: string
): {
  previousMap: Map<string, MonthValue>;
  nextMap: Map<string, MonthValue>;
} {
  const allKeys = Object.keys(row)
    .filter(k => /^\d{6}$/.test(k))
    .sort();

  const currentIndex = allKeys.indexOf(currentKey);
  const previousMap = new Map<string, MonthValue>();
  const nextMap = new Map<string, MonthValue>();

  for (let i = currentIndex - 12; i < currentIndex; i++) {
    if (i >= 0) {
      const key = allKeys[i];
      const data = row[key] as MonthData;
      const alias = data?.month_alias;
      const value = data?.[alias] ?? null;
      previousMap.set(key, { type: alias, value });
      console.log(`Previous Key: ${key}, Alias: ${alias}, Value: ${value}`);
    }
  }

  for (let i = currentIndex + 1; i <= currentIndex + 12; i++) {
    if (i < allKeys.length) {
      const key = allKeys[i];
      const data = row[key] as MonthData;
      const alias = data?.month_alias;
      const value = data?.[alias] ?? null;
      nextMap.set(key, { type: alias, value });
      console.log(`Next Key: ${key}, Alias: ${alias}, Value: ${value}`);
    }
  }
  console.log('Previous Map:', Array.from(previousMap.entries()));
  console.log('Next Map:', Array.from(nextMap.entries()));
  return { previousMap, nextMap };
}
