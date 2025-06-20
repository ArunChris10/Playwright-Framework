import * as fs from 'fs';
import * as path from 'path';
import { globalStore } from '../globalStore';
import { report } from 'process';
import { interpolate } from '../utils/commonUtil';

type EmptyEntryReport = {
  nodeName: string;
  emptyFields: string[];
};

// DO NOT ADD ANYTHING TO THIS FILE UNLESS EXCLUSIVELY NEEDED FOR THE TESTS
export async function awaitvalidateDriversContainsData(payload: any): Promise<EmptyEntryReport[]> {
  const report: EmptyEntryReport[] = [];

  payload.row_data.forEach(row => {
    const baseNodeName = row["Node Name"];
    const sbu = row["SBU"];
    const department = row["Department"];
    const ChannelL3 = row["Channel L3"];
    const ChannelL2 = row["Channel L2"];
    const ChannelL1 = row["Channel L1"];
    const ChannelL0 = row["Channel L0"];
    const BaseChannel = row["Base Channel"];

    // Skip if Node Name is missing
    if (!baseNodeName) return;

    // Build fullNodeName by skipping any key-value where value is null/undefined/empty
    const nodeParts = [
      { label: 'Node', value: baseNodeName },
      { label: 'SBU', value: sbu },
      { label: 'Department', value: department },
      { label: 'ChannelL3', value: ChannelL3 },
      { label: 'ChannelL2', value: ChannelL2 },
      { label: 'ChannelL1', value: ChannelL1 },
      { label: 'ChannelL0', value: ChannelL0 },
      { label: 'BaseChannel', value: BaseChannel }
    ];
    const fullNodeName = nodeParts
      .filter(part => part.value !== null && part.value !== undefined && String(part.value).trim() !== 'null' && String(part.value).trim() !== '')
      .map(part => `${part.label}: ${part.value}`)
      .join(': ');
    const emptyFields: string[] = [];

    for (const key in row) {
      if (key === "Node Name") continue;

      // SBU and Department should not be missing
      if (key === "SBU" || key === "Department" || key === "Channel L3" || key === "Channel L2" || key === "Channel L1" || key === "Channel L0" || key === "Base Channel") {
        const value = row[key];
        if (
          value === null ||
          value === undefined ||
          (typeof value === "string" && value.trim() === "")
        ) {
          emptyFields.push(key);
        }
        continue;
      }

      const value = row[key];

      // Non-object or null = empty field
      if (typeof value !== "object" || value === null) {
        emptyFields.push(key);
        continue;
      }

      const nestedKey = Object.keys(value)[0];
      const nestedValue = value[nestedKey];

      if (
        nestedKey === undefined || 
        nestedValue === null || 
        nestedValue === undefined || 
        (typeof nestedValue === "string" && nestedValue.trim() === "")
      ) {
        emptyFields.push(key);
      }
    }

    if (emptyFields.length > 0) {
      report.push({
        nodeName: fullNodeName,
        emptyFields
      });
    }
  });

  globalStore.setValue("reportNodesDataAsObject", report);
  return report;
}

type NodeEntry = {
  nodeName: string;
  [key: string]: any;
};

type MappingEntry = {
  parent_id: number;
  child_id: number;
  parent_name: string;
  child_name: string;
};

export async function replaceNodeNames(json1: any[], json2: any): Promise<NodeEntry[]> {
  const outputPathWithoutReplacement = path.join(__dirname, 'null_reportWithoutReplacement.json');
  fs.writeFileSync(outputPathWithoutReplacement, JSON.stringify(json1, null, 2), 'utf-8');
  const idToNameMap = new Map<string, string>();

  // Flatten json2
  const flatMappings = Array.isArray(json2[0]) ? json2.flat() : json2;

  // Map every unique ID (parent + child) to name
  flatMappings.forEach(entry => {
    if (entry.parent_id && entry.parent_name) {
      idToNameMap.set(String(entry.parent_id), entry.parent_name);
    }
    if (entry.child_id && entry.child_name) {
      idToNameMap.set(String(entry.child_id), entry.child_name);
    }
  });

  const updatedJson = json1.map(entry => {
    const nodeName = entry.nodeName;
    if (!nodeName) return entry;

    const parts = nodeName.split(":");
    if (parts.length !== 16) return entry;

    const [
      nodeLabel, nodeValue,
      sbuLabel, sbuValue,
      deptLabel, deptValue,
      chL3Label, chL3Value,
      chL2Label, chL2Value,
      chL1Label, chL1Value,
      chL0Label, chL0Value,
      baseChLabel, baseChValue
    ] = parts.map(p => p.trim());

    const newNodeName = [
      nodeLabel, nodeValue,
      sbuLabel, idToNameMap.get(sbuValue) || sbuValue,
      deptLabel, idToNameMap.get(deptValue) || deptValue,
      chL3Label, idToNameMap.get(chL3Value) || chL3Value,
      chL2Label, idToNameMap.get(chL2Value) || chL2Value,
      chL1Label, idToNameMap.get(chL1Value) || chL1Value,
      chL0Label, idToNameMap.get(chL0Value) || chL0Value,
      baseChLabel, idToNameMap.get(baseChValue) || baseChValue
    ].join(':');

    return {
      ...entry,
      nodeName: newNodeName
    };
  });

  // Output file
  const outputPath = path.join(__dirname, 'null_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(updatedJson, null, 2), 'utf-8');
  console.log(`Report written to: ${outputPath}`);
  console.log("================================================== Report Preview ==================================================");
  return updatedJson;
}

type ReportEntry = {
  nodeName: string;
  emptyFields: string[];
  gcsDataExists?: boolean;
};

type UFMMonthData = {
  baseline?: any;
  isImpacted?: any;
  forecast?: any;
  actuals?: any;
  month_alias?: string;
};

type UFMEntry = {
  driver: string;
  nodeName: string;
  [key: string]: any; // months like "202611", "202612", etc.
};

export function fiscalMonthToKey(fiscalMonth: string): string {
  // Convert "Nov FY26" to "202611"
  const [monthStr, fyStr] = fiscalMonth.split(" ");
  const fy = parseInt(fyStr.replace("FY", ""), 10); // 26
  const monthMap: { [key: string]: string } = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const calendarYear = fy + 2000 - (["Jan", "Feb", "Mar"].includes(monthStr) ? 1 : 0);
  return `${calendarYear}${monthMap[monthStr]}`;
}

function isEmptyData(data: any): boolean {
  return data === undefined || data === null || data === "";
}

type Node = {
  nodeName: string;
  emptyFields: string[];
  MatchingWithUFM?: boolean;
};

type MonthData = {
  actuals?: any;
  forecast?: any;
  baseline?: any;
  isImpacted?: any;
  month_alias?: string;
};

type ApiResponse = {
  colDef: any[];
  rowdata: any[];
};

function convertMonthLabelToKey(label: string): string {
  const [monthStr, fiscalYear] = label.split(' ');
  const monthMap: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03',
    Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09',
    Oct: '10', Nov: '11', Dec: '12'
  };

  const month = monthMap[monthStr];
  const year = fiscalYear.replace('FY', '');
  const fullYear = Number(year) < 50 ? '20' + year : '19' + year;
  const calendarYear = month >= '01' && month <= '03' ? String(Number(fullYear) + 1) : fullYear;

  return `${calendarYear}${month}`;
}

export async function validateReportWithUFM(
  nodes: any[],
  responseRows: any[]
){
  const reportResult: Record<string, unknown>[] = [];
  let responseData = responseRows[0].rowData
  const result = nodes.map((node) => {
      const driverMatch = responseData.find((res) =>
        node.nodeName.toLowerCase().includes(res.driver?.toLowerCase?.() || "") &&
        node.nodeName.toLowerCase().includes(res.channel || "") &&
        node.nodeName.toLowerCase().includes(res.department || "")
      );

      const unmatchedFields = node.emptyFields.filter((label) => {
        const key = convertMonthLabelToKey(label);
        // Defensive: Only try to access driverMatch[key] if driverMatch is defined
        let monthData: MonthData | undefined = undefined;
        if (driverMatch && typeof driverMatch === 'object') {
          monthData = driverMatch[key];
        }
        if (!monthData) {
          reportResult.push({
            nodeName: node.nodeName,
            FY: key,
            isExcelMatchingUFMData: true
          });
        } else if (monthData.hasOwnProperty('actuals')) {
          reportResult.push({
            nodeName: node.nodeName,
            FY: key,
            isExcelMatchingUFMData: false
          });
        } else {
          reportResult.push({
            nodeName: node.nodeName,
            FY: key,
            isExcelMatchingUFMData: "No Key found in UFM"
          });
        }
      });
  });
  const outputPath = path.join(__dirname, 'UFMExcel_report.json');
  let mappingdata = interpolate("{{dimensionDataAsObject}}")
  let mappedReport =await replaceNodeNames(reportResult,mappingdata);
  fs.writeFileSync(outputPath, JSON.stringify(mappedReport, null, 2), 'utf-8');
  //let htmlReport = await generateHTMLReport(mappedReport);
  //const outputPathHTMLReport = path.join(__dirname, 'UFMExcel_report.html');
  //fs.writeFileSync(outputPathHTMLReport, JSON.stringify(htmlReport, null, 2), 'utf-8');
}

async function generateHTMLReport(reportData: any[]): Promise<string> {
  // Extract unique FYs and nodeNames
  const uniqueFYs = Array.from(new Set(reportData.map(item => item.FY))).sort();
  const uniqueNodeNames = Array.from(new Set(reportData.map(item => item.nodeName)));

  // Build table header
  let html = `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; font-family: Arial, sans-serif;">
    <thead>
      <tr>
        <th>Node Name</th>`;

  for (const fy of uniqueFYs) {
    html += `<th>${fy}</th>`;
  }

  html += `</tr></thead><tbody>`;

  // Build table rows
  for (const nodeName of uniqueNodeNames) {
    html += `<tr><td>${nodeName}</td>`;

    for (const fy of uniqueFYs) {
      const record = reportData.find(item => item.nodeName === nodeName && item.FY === fy);
      const matchText = record
        ? (record.isExcelMatchingUFMData ? 'Matches' : 'Not Matches')
        : 'N/A';
      const color = matchText === 'Matches' ? '#d4edda' : matchText === 'Not Matches' ? '#f8d7da' : '#fefefe';

      html += `<td style="background-color:${color}; text-align:center;">${matchText}</td>`;
    }

    html += `</tr>`;
  }

  html += `</tbody></table>`;
  return html;
}







