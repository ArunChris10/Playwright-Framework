import * as fs from 'fs';
import * as path from 'path';
import { globalStore } from '../globalStore';

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

    const fullNodeName = 
      `Node: ${baseNodeName ?? 'null'}: ` +
      `SBU: ${sbu ?? 'null'}: ` +
      `Department: ${department ?? 'null'}: ` +
      `ChannelL3: ${ChannelL3 ?? 'null'}: ` +
      `ChannelL2: ${ChannelL2 ?? 'null'}: ` +
      `ChannelL1: ${ChannelL1 ?? 'null'}: ` +
      `ChannelL0: ${ChannelL0 ?? 'null'}: ` +
      `BaseChannel: ${BaseChannel ?? 'null'} `;
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

export async function replaceNodeNames(json1: NodeEntry[], json2: any): Promise<NodeEntry[]> {
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
  console.log(updatedJson);

  return updatedJson;
}




