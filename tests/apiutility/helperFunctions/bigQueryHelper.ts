// bigQueryHelper.ts
// Helper class for connecting to Google BigQuery and running queries

import { BigQuery } from '@google-cloud/bigquery';
import { interpolate } from '../utils/commonUtil';
import {fiscalMonthToKey} from '../helperFunctions/helperFunctions'
import * as path from 'path';
import * as fs from 'fs';

// ---- EDIT THESE VALUES ----
const DEFAULT_PROJECT_ID = 'wmt-ibg-qa'; // <-- Set your GCP project ID here
const DEFAULT_KEY_FILENAME = 'service-account-key.json'; // <-- Set path to your service account JSON key here
// ---------------------------

export class BigQueryHelper {
  private bigquery: BigQuery;

  constructor(options?: { projectId?: string; keyFilename?: string }) {
    this.bigquery = new BigQuery({
      projectId: (options && options.projectId) ? options.projectId : DEFAULT_PROJECT_ID,
      keyFilename: (options && options.keyFilename) ? options.keyFilename : DEFAULT_KEY_FILENAME
    });
  }

  /**
   * Runs a SQL query on BigQuery and returns the results as an array of rows.
   * @param query The SQL query string to run
   * @param params Optional query parameters
   */
  async runQuery(query: string, params?: Record<string, any>): Promise<any[]> {
    const options: any = { query };
    if (params) {
      options.params = params;
    }
    const [job] = await this.bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    return rows;
  }

  /**
   * Runs a reusable query for each row in the null report, replacing placeholders with row data.
   * Adds a 'dataExists' key to each result indicating if data is present for that combination.
   * @param nullReportRows Array of objects from null_reportWithoutReplacement.json
   * @param scenarioId Scenario ID to use in the query
   * @param version Version to use in the query
   * @param nodeVarName Node variable name to use in the query
   * @param month Month to use in the query
   * @param datasetTable Full table name (e.g., `project.dataset.table`)
   * @returns Array of results for each row, with dataExists boolean
   */
  async runNullReportQueriesWithDataPresence({
    nullReportRows,
    scenarioId,
    version,
    nodeVarName,
    month,
    datasetTable
  }: {
    nullReportRows: Array<{ nodeName: string; emptyFields: string[] }>;
    scenarioId: number;
    version: number;
    nodeVarName: string;
    month: number;
    datasetTable: string;
  }): Promise<Array<{ nodeName: string; emptyFields: string[]; dataExists: boolean }>> {
    const results: Array<{ nodeName: string; emptyFields: string[]; dataExists: boolean }> = [];
    for (const row of nullReportRows) {
      const query = `SELECT month, audit_trail, sum(value) as value_sum FROM \
        \`${datasetTable}\`
        WHERE scenario_id=@scenarioId
          AND version=@version
          AND node_var_name=@nodeVarName
          AND month=@month
        GROUP BY month, audit_trail`;
      const params = {
        scenarioId,
        version,
        nodeVarName,
        month
      };
      const result = await this.runQuery(query, params);
      results.push({
        nodeName: row.nodeName,
        emptyFields: row.emptyFields,
        dataExists: Array.isArray(result) && result.length > 0
      });
    }
    return results;
  }
}

export async function validateNodesDataWithBQ(datObj: any[],queryToExecute:string) {
    let results : any[] = []
    let higherGrainQuery = `SELECT value FROM \`wmt-ibg-qa.ibg_ufm.ALL_SCENARIOS\`
                            where node_var_name = '{{nodeName}}'
                            AND month = {{FY}}
                            And scenario_id = {{scenario_id}}
                            and version = {{version}}`

    let lowerGrainQuery = `SELECT value FROM \`wmt-ibg-qa.ibg_ufm.ALL_SCENARIOS\`
                            where node_var_name = '{{nodeName}}'
                            AND month = {{FY}}
                            And scenario_id = {{scenario_id}}
                            and version = {{version}}
                            and department = {{department}}
                            and channel = {{channel}}`
    let queryString = ''

    for (const dat of datObj) {
        let nodeName = dat.nodeName
        let emptyFY = dat.emptyFields
        let nodesData = extractNodeInfo(nodeName)
 

        for (const FY of emptyFY) {
        // Defensive: fallback to empty string if any value is undefined
        if (queryToExecute.includes("lowerGrain")){
            let fiscalMonth = fiscalMonthToKey(FY);
            // Get interpolated values once and store them
            const scenarioId = interpolate("{{node_validator_asString_scenario_id}}");
            const version = interpolate("{{node_validator_asString_scenario_version_timestamp}}");
            
            const updatedQuery = lowerGrainQuery.replace("{{nodeName}}", nodesData.node ?? "")
                .replace("{{scenario_id}}", scenarioId)
                .replace("{{version}}", version)
                .replace("{{department}}", nodesData.department ?? "")
                .replace("{{channel}}", nodesData.baseChannel ?? "")
                .replace("{{FY}}", fiscalMonth);

            console.log('Executing query:', updatedQuery);
            // Clean up whitespace and newlines for BigQuery compatibility
            queryString = updatedQuery.replace(/\s+/g, ' ').trim();
        } else if(queryToExecute.includes("higherGrain")){
             let fiscalMonth = fiscalMonthToKey(FY);
            // Get interpolated values once and store them
            const scenarioId = interpolate("{{node_validator_asString_scenario_id}}");
            const version = interpolate("{{node_validator_asString_scenario_version_timestamp}}");
            
            const updatedQuery = higherGrainQuery.replace("{{nodeName}}", nodesData.node ?? "")
                .replace("{{scenario_id}}", scenarioId)
                .replace("{{version}}", version)
                .replace("{{FY}}", fiscalMonth);

            console.log('Executing query:', updatedQuery);
            // Clean up whitespace and newlines for BigQuery compatibility
            queryString = updatedQuery.replace(/\s+/g, ' ').trim();
        }
        // Debug: Log before creating BigQueryHelper
        console.log('Creating BigQueryHelper with:', {
          projectId: DEFAULT_PROJECT_ID,
          keyFilename: DEFAULT_KEY_FILENAME
        });
        const bq = new BigQueryHelper({ projectId: DEFAULT_PROJECT_ID, keyFilename: DEFAULT_KEY_FILENAME });
        // Debug: Log after creating BigQueryHelper
        console.log('BigQueryHelper created successfully');
        try{
        const rows = await bq.runQuery(queryString);
            if ((rows.length > 0)){
            results.push({
            nodeName: nodeName,
            emptyFields: emptyFY,
            dataMatches: "Data exists in GCP but not in excel plugin"
            });
            console.log('Data exists in BQ but not in excel plugin for query : ', queryString);
            console.log('Data in BQ:', rows);  
          }
            else if ((rows.length <= 0)){
            results.push({
            nodeName: nodeName,
            emptyFields: emptyFY,
            dataMatches: "Data does not exists in BQ and Excel plugin"
            });
            console.log('No data found for query:', queryString);
            console.log('Data in BQ:', rows); 
            }
        console.log('Query executed successfully:', queryString);
        } catch (error) {
            console.log('error Query:', error);
        }


    }
    }
      const outputPath = path.join(__dirname, 'GCPExcel_report.json');
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');
}

type NodeInfo = {
  node?: string;
  sbu?: string;
  department?: string;
  channels?: {
    ChannelL0?: string;
    ChannelL1?: string;
    ChannelL2?: string;
    ChannelL3?: string;
  };
  baseChannel?: string;
};

function extractNodeInfo(input: string): NodeInfo {
  const extract = (label: string): string | undefined => {
    const regex = new RegExp(`${label}:\\s*([^:]+)`, 'i');
    const match = input.match(regex);
    return match ? match[1].trim() : undefined;
  };

  return {
    node: extract('Node'),
    sbu: extract('SBU'),
    department: extract('Department'),
    channels: {
      ChannelL0: extract('ChannelL0'),
      ChannelL1: extract('ChannelL1'),
      ChannelL2: extract('ChannelL2'),
      ChannelL3: extract('ChannelL3'),
    },
    baseChannel: extract('BaseChannel'),
  };
}
