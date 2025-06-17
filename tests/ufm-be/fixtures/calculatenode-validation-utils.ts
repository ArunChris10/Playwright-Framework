import * as ExcelJS from 'exceljs';
import { nodeFormulas } from '../testdata/node-formulas';


export class CalculatenodeValidationUtils {
/**
 * Reads all values from a column in an Excel sheet by header name.
 * @param sheetPath Path to the Excel file.
 * @param sheetName Name of the sheet.
 * @param columnHeader The header of the column to read.
 * @returns Array of cell values under the specified column.
 */
static async readColumnByHeader(sheetPath: string, sheetName: string, columnHeader: string): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(sheetPath);
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`Sheet ${sheetName} not found`);
    const headerRow = worksheet.getRow(1);
    let colIndex = -1;
    headerRow.eachCell((cell, colNumber) => {
        if (cell.value === columnHeader) {
            colIndex = colNumber;
        }
    });
    if (colIndex === -1) throw new Error(`Column ${columnHeader} not found`);
    const values: any[] = [];
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        values.push(row.getCell(colIndex).value);
    });
    return values;
}

/**
 * Updates values in an existing column by matching a key column, without affecting formulas or other cells.
 * @param sheetPath Path to the Excel file.
 * @param sheetName Name of the sheet.
 * @param keyHeader The header of the key column to match rows.
 * @param valueHeader The header of the column to write values to.
 * @param data Array of objects: { key: <key>, value: <value> }
 */
static async writeColumnByHeader(sheetPath: string, sheetName: string, keyHeader: string, valueHeader: string, data: { key: any, value: any }[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(sheetPath);
    const worksheet = workbook.getWorksheet(sheetName);
    if (!worksheet) throw new Error(`Sheet ${sheetName} not found`);
    const headerRow = worksheet.getRow(1);
    let keyCol = -1, valueCol = -1;
    headerRow.eachCell((cell, colNumber) => {
        if (cell.value === keyHeader) keyCol = colNumber;
        if (cell.value === valueHeader) valueCol = colNumber;
    });
    if (keyCol === -1 || valueCol === -1) throw new Error('Header not found');
    const dataMap = new Map(data.map(item => [item.key, item.value]));
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const keyCell = row.getCell(keyCol);
        if (dataMap.has(keyCell.value)) {
            row.getCell(valueCol).value = dataMap.get(keyCell.value);
        }
    });
    await workbook.xlsx.writeFile(sheetPath);
}

/**
 * Calculates the value of a node recursively based on formula mapping and input values.
 * @param node The node name to calculate.
 * @param inputValues Object with input node values (from API).
 * @param formulaMap Mapping of node names to formulas.
 * @param cache Internal cache for already calculated nodes.
 * @returns The calculated value for the node.
 */
static evaluateNode(
  node: string,
  inputValues: Record<string, number>,
  formulaMap: Record<string, string>,
  cache: Record<string, number> = {}
): number {
  if (cache[node] !== undefined) return cache[node];
  const formula = formulaMap[node];
  // If node is not present in formulaMap, treat as input node
  if (formula === undefined) {
    if (inputValues[node] === undefined) {
      throw new Error(`No formula or input value for node: ${node}`);
    }
    cache[node] = inputValues[node];
    return inputValues[node];
  }
  
  // If formula is 'input', return the input value directly
  if (formula === 'input') {
  if (inputValues[node] === undefined) {
    console.warn(`Missing input for ${node}, defaulting to 0`);
    cache[node] = 0;
    return 0;
  }
  cache[node] = inputValues[node];
  return inputValues[node];
}
  // Direct mapping (e.g. discountstoSalesgroupby: "discountstoSales")
  if (!/[+\-*/()]/.test(formula)) {
    cache[node] = CalculatenodeValidationUtils.evaluateNode(formula, inputValues, formulaMap, cache);
    return cache[node];
  }
  // Replace node names in formula with their evaluated values
  const expr = formula.replace(
    /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g,
    (match) => {
      if (match === node) throw new Error(`Circular reference detected for node: ${node}`);
      return CalculatenodeValidationUtils.evaluateNode(match, inputValues, formulaMap, cache).toString();
    }
  );
  // eslint-disable-next-line no-eval
  const result = eval(expr);
  cache[node] = result;
  return result;
}

/**
 * Calculates all nodes in the formula map, given input values.
 * @param inputValues Object with input node values (from API).
 * @param formulaMap Mapping of node names to formulas.
 * @returns Object with all calculated node values.
 */
static calculateAllNodes(
  inputValues: Record<string, number>,
  formulaMap: Record<string, string>
): Record<string, number> {
  const allCalculated: Record<string, number> = {};
  for (const node of Object.keys(formulaMap)) {
    try {
      allCalculated[node] = CalculatenodeValidationUtils.evaluateNode(node, inputValues, formulaMap, allCalculated);
    } catch (e) {
      // Optionally handle missing input or formula errors
      console.warn(`Error calculating node ${node}:`, e.message);
    }
  }
  return allCalculated;
}
}