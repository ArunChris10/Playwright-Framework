import { expect } from "../../common/fixtures/test-hook";
import { Utility } from "../../common/fixtures/utils";
import testdatafile from "../testdata/new-aop-version.json";

export class AOPUtils{
    static async getAOPVersion(request){
        const endpointURL = `${process.env.apiBaseURLUFM}${testdatafile.get_info_endpoint}`;

        const response = await request.get(endpointURL);

        if (!response.ok()) {
            console.error(`API request failed with status code: ${response.status()} for URL ${response.url()}`);
          }

        return response;
    }
    public static getSurroundingMonths(actualsSyncTime: string): string[] {
        if (!/^\d{6}$/.test(actualsSyncTime)) {
            console.error("Invalid format for actualsSyncTime. Expected 'YYYYMM'.");
        }

        const year = parseInt(actualsSyncTime.slice(0, 4), 10);
        const month = parseInt(actualsSyncTime.slice(4, 6), 10) - 1; // JS Date months are 0-indexed
        const monthDelta = 6;
        const baseDate = new Date(year, month);
        const result: string[] = [];

        const pad = (num: number) => (num < 10 ? '0' + num : String(num));

        for (let i = -monthDelta; i <= monthDelta; i++) {
            const newDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i);
            const yyyy = newDate.getFullYear();
            const mm = pad(newDate.getMonth() + 1);
            result.push(`${yyyy}${mm}`);
        }
        return result;
    }


}
