import { TestInfo } from "@playwright/test";
import fs from "fs";
import debug from "debug";
import usersIBGFormat from "../testdata/users.json";
import usersNexusFormat from "../testdata/users-nexus-format.json";

export class Utility {
  private static readonly dir: string = "./test-results/logs/";
  private static readonly nexusTokenFilePath: string = "./secrets/nexus-users-token.json";
  private static readonly ibgTokenFilePath: string = "./secrets/ibg-users-token.json";
  private static readonly secretFilePath: string = "./secrets/ufm-secrets.json";

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

  static async fetchIBGFakeToken(userId: string, request) {
    const authURL = process.env.ibgAuthTokenURL;
    const body = usersIBGFormat.filter((user) => user.userId === userId);
    debug.log("Logging in with the user : ", JSON.stringify(body[0]));
    const responseBody = await request.post(`${authURL}`, {
      data: body[0],
    });
    const token = (await responseBody.json()).token;
    return token;
  }

  static async fetchNexusFakeTokens(userId: String, request) {
    const user = usersNexusFormat.filter((user) => user.userId === userId)[0];

    debug.log("fetching token for : ", JSON.stringify(user.userId));
    const adminSecret = (await this.getSecret())["nexus"].adminSecret[
      process.env.envName+""
    ];
    const responseBody = await request.post(
      `${process.env.nexusAuthTokenURL}`,
      {
        headers: {
          adminprivatekey: adminSecret,
        },
        data: user,
      }
    );
    const token = (await responseBody.json()).token;
    return token;
  }
  static async getNexusFakeToken(userId: string, request) {
    const rawdata = fs.existsSync(this.nexusTokenFilePath)
      ? fs.readFileSync(this.nexusTokenFilePath, "utf-8")
      : "{}";
    const parsedData: Object = JSON.parse(rawdata);
    if (!parsedData.hasOwnProperty(userId)) {
      parsedData[userId] = await this.fetchNexusFakeTokens(userId, request);
      const updatedDate = JSON.stringify(parsedData, null, 2);
      fs.writeFileSync(this.nexusTokenFilePath, updatedDate);
    }
    return JSON.stringify(parsedData[userId]);
  }

  static async getIBGFakeToken(userId: string, request) {
    const rawdata = fs.existsSync(this.ibgTokenFilePath)
      ? fs.readFileSync(this.ibgTokenFilePath, "utf-8")
      : "{}";
    const parsedData: Object = JSON.parse(rawdata);
    if (!parsedData.hasOwnProperty(userId)) {
      parsedData[userId] = await this.fetchIBGFakeToken(userId, request);
      const updatedDate = JSON.stringify(parsedData, null, 2);
      fs.writeFileSync(this.ibgTokenFilePath, updatedDate);
    }
    return JSON.stringify(parsedData[userId]);
  }

  //Method reads the secret file content
  private static async getSecret() {
    let raw_ufm_secrets;
    if (!process.env.CI) {
      raw_ufm_secrets = fs.readFileSync(this.secretFilePath, "utf8");
    } else {
      raw_ufm_secrets = fs.readFileSync(process.env.ufm_secrets + "", "utf8");
    }
    const ufm_secrets = JSON.parse(raw_ufm_secrets);
    return ufm_secrets;
  }

  //this method gets the password for userIds from the secret file
  public static async getLoginPassword(userId) {
    return (await this.getSecret())[userId];
  }
}
