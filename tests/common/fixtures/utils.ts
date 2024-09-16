import { APIRequestContext, Page, TestInfo } from "@playwright/test";
import debug from "debug";
import fs from "fs";
import { Forecast } from "../../cdf-be/types/get-demand-scenario-forecast-response";
import { expect } from "../fixtures/test-hook";
import usersNexusFormat from "../testdata/users-nexus-format.json";
import usersIBGFormat from "../testdata/users.json";
import { Home } from "../pages/home.page";
import { LoginPage } from "../pages/login.page";

export class Utility {
  private static readonly dir: string = "./test-results/logs/";
  private static readonly nexusTokenFilePath: string =
    "./secrets/nexus-users-token.json";
  private static readonly ibgTokenFilePath: string =
    "./secrets/ibg-users-token.json";
  private static readonly mappingFilePath: string =
    "./tests/ufm-be/constants/mapping.json";
  private static readonly secretFilePath: string = "./secrets/ufm-secrets.json";
  private static spinner = "//span[contains(@class, 'Spinner')]";
  private static dataLoading =
    "//span[contains(@class, 'ag-overlay-loading-center')]";
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
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
    futureDates.sort((dt1, dt2) => dt1.getTime() - dt2.getTime());

    // return futureDates[0] in a particular format
    return futureDates[0].toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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

    Utility.logIt(`fetching token for : ${JSON.stringify(user.userId)}`);
    const adminSecret = (await this.getSecret())["nexus"].adminSecret[
      process.env.envName + ""
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
      raw_ufm_secrets = process.env.CRED_SECRET;
    }
    const ufm_secrets = JSON.parse(raw_ufm_secrets);
    return ufm_secrets;
  }

  static async setmappings(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}/metadata/dimensions/mappings`;
    this.logIt(endpointURL);
    let nexusTokens = await Utility.getNexusFakeToken(
      process.env.ufmUser + "",
      request
    );
    //this.logIt(nexusTokens);
    nexusTokens = nexusTokens.replace('"', "");
    nexusTokens = nexusTokens.replace('"', "");
    //API Request
    const responseData = await request.get(endpointURL, {
      headers: {
        Authorization: `Bearer ` + nexusTokens,
      },
      params: {
        dimension_group_id: 7,
      },
    });
    expect(responseData).toBeOK();
    //Extracting the response body
    const responseBody = JSON.parse(await responseData.text());
    let parsedData = JSON.stringify(responseBody, null, 2);

    const rawdata = fs.existsSync(this.mappingFilePath)
      ? fs.readFileSync(this.mappingFilePath)
      : "";

    fs.writeFileSync(this.mappingFilePath, parsedData);
  }

  //this method gets the password for userIds from the secret file
  public static async getLoginPassword(userId) {
    return (await this.getSecret())[userId];
  }

  public static async loginToIBGUsingToken(page, request) {
    const { appBaseURL } = process.env;

    await page.goto(appBaseURL + "/page-with-no-auth", { timeout: 300000 });
    await page.evaluate(() =>
      localStorage.setItem("isAutomationTestRunning", JSON.stringify(true))
    );
    const token = await Utility.getIBGFakeToken(
      process.env.ibgUser + "",
      request
    );
    await page.evaluate(
      (token) => localStorage.setItem("token", JSON.parse(token)),
      token
    );
    const url = appBaseURL + "";
    await page.goto(url);
  }

  public static async loginToCdf(
    page: Page,
    request: APIRequestContext,
    username: string,
    storageFilePath: string
  ) {
    await this.loginToIBGUsingToken(page, request);
    const homePage: Home = new Home(page);
    await homePage.checkIfHomepageIsVisible();
    await homePage.open("Demand");

    const cdfAppBaseURL = process.env.cdfAppBaseURL;
    const user = process.env[username];

    const loginPage = new LoginPage(page);
    await loginPage.login(user);
    await page.waitForURL(cdfAppBaseURL + "");
    await homePage.checkIfHomepageIsVisible();

    await page.context().storageState({ path: storageFilePath });
  }

  public static async randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static async getMonthYear() {
    let m = ("0" + (new Date().getMonth() + 1)).slice(-2);
    let y = new Date().getFullYear() + 1;
    let year = y.toString();
    return year + m;
  }

  public static async waitForLoaderToBeInvisible(page) {
    await page
      .getByRole("img", { name: "loading" })
      .first()
      .waitFor({ state: "detached", timeout: 420000 });
  }

  public static async waitForSpinnerToBeVisible(page) {
    await page
      .locator(this.spinner)
      .waitFor({ state: "visible", timeout: 480000 });
  }

  public static async waitForSpinnerToBeInvisible(page) {
    await page
      .getByRole("status", { name: "Spinner" })
      .waitFor({ state: "detached", timeout: 480000 });
  }

  public static async waitForDataLoadingMessageToBeVisible(page) {
    await page
      .locator(this.dataLoading)
      .first()
      .waitFor({ state: "visible", timeout: 480000 });
  }

  public static async waitForDataLoadingMessageToBeInvisible(page) {
    await page
      .locator(this.dataLoading)
      .first()
      .waitFor({ state: "hidden", timeout: 480000 });
  }
  public static async validateDataInGridAvailable(page, dataLoading) {
    await page
      .locator(dataLoading)
      .first()
      .waitFor({ state: "visible", timeout: 480000 });
  }

  public static getDateKey({ month, quarter, year }: Forecast) {
    return `${month}-${quarter}-${year}`;
  }

  /**
   * Asserts that the response status is OK (200) and logs the response body to the console and the debug log.
   *
   * @param {Response} response - The response object.
   * @param {boolean} [isError=false] - Whether the response is an error.
   * @return {Promise<object>} The response body.
   */
  static async assertAndLog(response, isError = false) {
    if (!isError) await expect.soft(response).toBeOK();
    let responseBody = await response.json();
    console.log(JSON.stringify(responseBody));
    debug.log(JSON.stringify(responseBody));
    return responseBody;
  }

  /**
   * Logs the given text to the console and on the debug log.
   *
   * @param {any} text - The text to be logged.
   * @return {Promise<void>} A Promise that resolves when the logging is complete.
   */
  static async logIt(text) {
    console.log(JSON.stringify(text));
    debug.log(JSON.stringify(text));
  }

  async keyPress(key) {
    await this.page.keyboard.press(key);
  }

  /*
   * Helps avoid test flakiness
   *
   * On long pages, the test runner sometimes scrolls too low from previous tests and accidentally clicks overlapping header buttons.
   * Scrolling to the top of the page is functionally a position-reset
   */
  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  static roundToDecimals(num: number, decimals: number = 2) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}
