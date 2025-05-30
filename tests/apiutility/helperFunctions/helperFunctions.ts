import * as fs from 'fs';
import * as path from 'path';

type EmptyEntryReport = {
  nodeName: string;
  emptyFields: string[];
};


// DO NOT ADD ANYTHING TO THIS FILE UNLESS EXCLUSIVELY NEEDED FOR THE TESTS
export function validateDriversContainsData(payload: any): EmptyEntryReport[] {
  const report: EmptyEntryReport[] = [];

  payload.row_data.forEach(row => {
    const nodeName = row["Node Name"];
    if (!nodeName) return;

    const emptyFields: string[] = [];

    for (const key in row) {
      if (key === "Node Name") continue;

      const nestedObj = row[key];
      if (typeof nestedObj !== "object" || nestedObj === null) {
        emptyFields.push(key);
        continue;
      }

      const nestedKey = Object.keys(nestedObj)[0]; // e.g., "18891747742445"
      const value = nestedObj[nestedKey];

      if (
        nestedKey === undefined || 
        value === null || 
        value === undefined || 
        (typeof value === "string" && value.trim() === "")
      ) {
        emptyFields.push(key);
      }
    }

    if (emptyFields.length > 0) {
      report.push({
        nodeName,
        emptyFields
      });
    }
  });

const outputPath = path.join(__dirname, 'null_report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`Report written to: ${outputPath}`);
  console.log("==================================================Report==================================================");
  console.log(report);
  return report;
}
