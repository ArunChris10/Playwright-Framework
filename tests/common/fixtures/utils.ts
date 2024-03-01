import { TestInfo } from "@playwright/test";
import fs from "fs";
import debug from 'debug';
import usersIBGFormat from "../testdata/users.json";
import usersNexusFormat from "../testdata/users-nexus-format.json"

export class Utility {

  private static readonly dir: string = "./test-results/logs/";
  
  private static createLogFileDir() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }
  }

  static async addLogs(testInfo: TestInfo, logs: String[]) {
    // After the test we can check whether the test passed or failed.
    this.createLogFileDir();
    let logFileName = testInfo.title + "_" + testInfo.testId + ".log";
    let logFile = this.dir + logFileName;
    await fs.promises.writeFile(logFile, logs.join("\n"), "utf8");
    testInfo.attachments.push({
      name: "logs",
      contentType: "text/plain",
      path: logFile,
    });
  }

  // The function returns next upcoming date given the array of date strings
  static async getUpcomingForecastSubmissionDate(strdates: string[]) {
    //convert string to Date type
    let dates = strdates.map((dateString) => new Date(dateString));

    //current date
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    //removing the past dates
    const futureDates = dates.filter((date) => date >= currentDate);

    //sorting the dates in ascending order and return the first date
    futureDates.sort((dt1, dt2) => dt1.getDate() - dt2.getDate());
    return futureDates[0];
  }

  static async getIBGFakeToken(userId: string, request){
    const authURL = process.env.ibgAuthTokenURL;
    const body = usersIBGFormat.filter((user) => (user.userId === userId));
    debug.log("Logging in with the user : ", JSON.stringify(body[0]));
    const responseBody = await request.post(`${authURL}`, {
      data: body[0],
    });
    const token = (await responseBody.json()).token;
    return token;
  }

  static async getNexusFakeToken(userId: string, request){
    const authURL = process.env.nexusAuthTokenURL;
    const body = usersNexusFormat.filter((user) => (user.userId === userId));
    debug.log("Logging in with the user : ", JSON.stringify(body[0]));
    const responseBody = await request.post(`${authURL}`, {
      data: body[0],
    });
    const token = (await responseBody.json()).token;
    return token;
  }


}
