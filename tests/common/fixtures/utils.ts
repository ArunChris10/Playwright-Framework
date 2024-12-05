import { APIRequestContext, Download, Page, TestInfo } from "@playwright/test";
import debug from "debug";
import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import { Forecast } from "../../cdf-be/types/get-demand-scenario-forecast-response";
import { expect } from "../fixtures/test-hook";
import usersNexusFormat from "../testdata/users-nexus-format.json";
import usersIBGFormat from "../testdata/users.json";
import { Home } from "../pages/home.page";
import { LoginPage } from "../pages/login.page";
import excelToJson from "convert-excel-to-json";

export class Utility {
  private static readonly dir: string = "./test-results/logs/";
  private static readonly nexusTokenFilePath: string =
    "./secrets/nexus-users-token.json";
  private static readonly ibgTokenFilePath: string =
    "./secrets/ibg-users-token.json";
  private static readonly mappingFilePath: string =
    "./tests/ufm-be/constants/mapping.json";
  private static readonly pba_sba_listFilePath: string =
    "./tests/ufm-be/constants/PBA_SBA_List.json";
  private static readonly secretFilePath: string = "./secrets/ufm-secrets.json";
  private static spinner = "//span[contains(@class, 'Spinner')]";
  private static dataLoading =
    "//span[contains(@class, 'ag-overlay-loading-center')]";
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
  /**
   * Creates a directory for log files if it does not already exist.
   *
   * @return {void}
   */
  private static createLogFileDir() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir);
    }
  }

  /**
   * Adds logs to a file and attaches it to the test info.
   *
   * @param {TestInfo} testInfo - The test info.
   * @param {String[]} logs - The logs to be added.
   * @return {Promise<void>} A promise that resolves when the logs are added.
   */
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

  /**
   * Returns the upcoming forecast submission date from the given array of date strings.
   *
   * @param {string[]} strdates - An array of date strings in the format "YYYY-MM-DD".
   * @return {Promise<string>} A promise that resolves to the upcoming forecast submission date in the format "MMM D, YYYY".
   */
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

  /**
   * Fetches the fake token for the given user ID from the ibgAuthTokenURL.
   *
   * @param {string} userId - The user ID.
   * @param {Request} request - The request object.
   * @return {Promise<string>} The token.
   */
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

  /**
   * Fetches a Nexus fake token for a given user ID.
   *
   * @param {String} userId - The user ID.
   * @param {Request} request - The request object.
   * @return {Promise<String>} A promise that resolves to the token.
   */
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
  /**
   * Retrieves a Nexus fake token for a given user ID.
   *
   * @param {string} userId - The user ID.
   * @param {Request} request - The request object.
   * @return {Promise<string>} A promise that resolves to the token.
   */
  static async getNexusFakeToken(userId: string, request) {
    // const rawdata = fs.existsSync(this.nexusTokenFilePath)
    //   ? fs.readFileSync(this.nexusTokenFilePath, "utf-8")
    //   : "{}";
    const rawdata = "{}";
    const parsedData: Object = JSON.parse(rawdata);
    if (!parsedData.hasOwnProperty(userId)) {
      parsedData[userId] = await this.fetchNexusFakeTokens(userId, request);
      const updatedDate = JSON.stringify(parsedData, null, 2);
      fs.writeFileSync(this.nexusTokenFilePath, updatedDate);
    }
    let nexusTokens = JSON.stringify(parsedData[userId]);
    nexusTokens = nexusTokens.replace('"', "");
    nexusTokens = nexusTokens.replace('"', "");
    nexusTokens = `Bearer ` + nexusTokens;
    return nexusTokens;
  }
  /**
   * Retrieves the fake token for the given user ID from the ibgTokenFilePath.
   *
   * @param {string} userId - The user ID.
   * @param {Request} request - The request object.
   * @return {Promise<string>} The token.
   */
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

  /**
   * Retrieves the secret from the environment variable or the file system.
   *
   * @return {Promise<object>} The parsed JSON object containing the secrets.
   */
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

  /**
   * Sets the mappings by making a GET request to the API endpoint.
   * Also creates the list of all PBA and SBA List based on mapping api response.
   *
   * @param {Request} request - The request object.
   * @return {Promise<void>} A promise that resolves when the mappings are set.
   */
  static async setmappings(request) {
    const endpointURL = `${process.env.apiBaseURLUFM}/metadata/dimensions/mappings`;
    this.logIt(endpointURL);
    let nexusTokens = await Utility.getNexusFakeToken(
      process.env.ufmUser + "",
      request
    );
    const responseData = await request.get(endpointURL, {
      headers: {
        Authorization: nexusTokens,
      },
      params: {
        dimension_group_id: 7,
      },
    });
    expect(responseData).toBeOK();
    if ((await responseData.status()) == 200) {
      const responseBody = await responseData.json();
      const { SBAList, PBAList } = responseBody.reduce(
        (acc, i) => {
          if (i.child_dim_name === "SBA") {
            acc.SBAList.push(i.child_name);
          } else if (i.child_dim_name === "PBA") {
            acc.PBAList.push(i.child_name);
          }
          return acc;
        },
        { SBAList: [], PBAList: [] }
      );
      const finalString = JSON.stringify({ SBAList, PBAList });
      fs.promises.writeFile(
        this.mappingFilePath,
        JSON.stringify(responseBody, null, 2)
      );
      fs.promises.writeFile(this.pba_sba_listFilePath, finalString);
    }
  }

  /**
   * Retrieves the login password for a given user ID.
   *
   * @param {string} userId - The ID of the user.
   * @return {Promise<string>} The login password for the user.
   */
  public static async getLoginPassword(userId) {
    return (await this.getSecret())[userId];
  }

  /**
   * Logs in to the IBG application using a fake token.
   *
   * @param {Page} page - The Playwright Page object.
   * @param {Request} request - The Playwright Request object.
   * @return {Promise<void>} A promise that resolves when the login is complete.
   */
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

  /**
   * Logs in to the CDF application using a fake token.
   *
   * @param {Page} page - The Playwright Page object.
   * @param {APIRequestContext} request - The Playwright Request object.
   * @param {string} username - The username of the user.
   * @param {string} storageFilePath - The path to the storage file.
   * @return {Promise<void>} A promise that resolves when the login is complete.
   */
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

  /**
   * Generates a random integer between the specified minimum and maximum values (inclusive).
   *
   * @param {number} min - The minimum value for the generated integer.
   * @param {number} max - The maximum value for the generated integer.
   * @return {Promise<number>} A Promise that resolves with a random integer.
   */
  public static async randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Returns the current month and year in the format 'YYYYMM'.
   *
   * @return {string} The current month and year.
   */
  public static getMonthYear() {
    let m = ("0" + (new Date().getMonth() + 1)).slice(-2);
    let y = new Date().getFullYear() + 1;
    let year = y.toString();
    return year + m;
  }

  /**
   * Converts a month number to its corresponding short name.
   *
   * @param {string} month - The month number to convert (i.e. "01", "12").
   * @return {string} The corresponding month name.
   */
  public static convertFYMonthNumberToName(month: string) {
    const monthNames = [
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
    ];
    const index = parseInt(month, 10) - 1;
    return monthNames[index];
  }

  public static async waitForLoaderToBeInvisible(page) {
    await page
      .getByRole("img", { name: "loading" })
      .first()
      .waitFor({ state: "detached", timeout: 420000 });
  }

  /**
   * Waits for the spinner to be visible on the page.
   *
   * @param {Page} page - The Playwright Page object.
   * @return {Promise<void>} A promise that resolves when the spinner is visible.
   */
  public static async waitForSpinnerToBeVisible(page) {
    await page
      .locator(this.spinner)
      .waitFor({ state: "visible", timeout: 480000 });
  }

  /**
   * Waits for the spinner to be invisible.
   *
   * @param {Page} page - The Playwright Page object.
   * @return {Promise<void>} A promise that resolves when the spinner is invisible.
   */
  public static async waitForSpinnerToBeInvisible(page) {
    await page
      .locator(this.spinner)
      .waitFor({ state: "detached", timeout: 480000 });
  }

  /**
   * Waits for the data loading message to be visible on the page.
   *
   * @param {Page} page - The Playwright Page object.
   * @return {Promise<void>} A promise that resolves when the data loading message is visible.
   */
  public static async waitForDataLoadingMessageToBeVisible(page) {
    await page
      .locator(this.dataLoading)
      .first()
      .waitFor({ state: "visible", timeout: 480000 });
  }

  /**
   * Waits for the data loading message to be invisible.
   *
   * @param {Page} page - The Playwright Page object.
   * @return {Promise<void>} A promise that resolves when the data loading message is invisible.
   */
  public static async waitForDataLoadingMessageToBeInvisible(page) {
    await page
      .locator(this.dataLoading)
      .first()
      .waitFor({ state: "hidden", timeout: 480000 });
  }
  /**
   * Validates if data is available in the grid.
   *
   * @param {Page} page - The Playwright Page object.
   * @param {string} dataLoading - The selector for the data loading element.
   * @return {Promise<void>} A promise that resolves when the data is available.
   */
  public static async validateDataInGridAvailable(page, dataLoading) {
    await page
      .locator(dataLoading)
      .first()
      .waitFor({ state: "visible", timeout: 480000 });
  }

  /**
   * Generates a unique key for a forecast based on the month, quarter, and year.
   *
   * @param {Forecast} forecast - The forecast object containing the month, quarter, and year.
   * @return {string} The generated key in the format "month-quarter-year".
   */
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
    this.logIt(responseBody);
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

  /**
   * Presses a key on the keyboard.
   *
   * @param {string} key - The key to press.
   * @return {Promise<void>} A Promise that resolves when the key is pressed.
   */
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

  /**
   * Rounds a number to a specified number of decimal places.
   *
   * @param {number} num - The number to round.
   * @param {number} [decimals=2] - The number of decimal places to round to.
   * @return {number} The rounded number.
   */
  static roundToDecimals(num: number, decimals: number = 2) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  public static async verifyPageDoesNotHaveText(page, text) {
    await expect(page.getByText(text)).not.toBeVisible();
  }

  public static async downloadCSV(download: Download) {
    const downloadPath = path.join(__dirname, "download.csv");
    await download.saveAs(downloadPath);
    const csvFileData = fs.readFileSync(downloadPath, "utf8");
    fs.unlinkSync(downloadPath);
    const csvArray = csvFileData.split(/\r\n/).map((row) =>
      // Matches commas with no space after them. The lookahead regex is needed to parse the
      // file correctly because sometimes cell values can contain commas, i.e. ARTS, CRAFTS, SEWING & FABRICS
      row.split(/,(?=\S)/)
    );
    // The CSV ends with a comma, and as expected, this matches the regex and creates a final entry with [''] as a value.
    // So, discard this. Unfortunately, there is no better way to match/remove all commas without generating this entry.
    csvArray.splice(csvArray.length - 1);
    return csvArray;
  }

  public static async downloadExcel(download: Download) {
    const downloadPath = path.join(__dirname, "download.xlsx");
    await download.saveAs(downloadPath);
    const workbook = xlsx.readFile(downloadPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    fs.unlinkSync(downloadPath);
    return xlsx.utils.sheet_to_json(sheet);
  }

  /**
   * Returns an array of strings representing the current quarter in the format "YYYYMM".
   *
   * @return {Promise<string[]>} An array of strings representing the current quarter in the format "YYYYMM".
   */
  public static async getQuarter() {
    const today = new Date();
    // Get the month of the year
    const month = today.getMonth() + 1;
    let y = new Date().getFullYear() + 1;
    let year = y.toString();
    let quarter;
    if (month >= 2 && month < 5)
      quarter = year + "01," + year + "02," + year + "03";
    if (month >= 5 && month < 8)
      quarter = year + "04," + year + "05," + year + "06";
    if (month >= 8 && month < 11)
      quarter = year + "07," + year + "08," + year + "09";
    if (month >= 11 || month < 2)
      quarter = year + "10," + year + "11," + year + "12";
    // Print the quarter months
    return quarter.split(",");
  }

  public static getFileDownloadedPath() {
    return path.join(__dirname, "download.xlsx");
  }

  public static async downloadAndSaveValidatedExcelFile(download: Download) {
    const downloadPath = this.getFileDownloadedPath();
    await download.saveAs(downloadPath);
  }

  public static fileGettingDownloaded() {
    const downloadPath = this.getFileDownloadedPath();
    return fs.existsSync(downloadPath);
  }

  public static fileNotGettingDownloaded() {
    const downloadPath = this.getFileDownloadedPath();
    if (fs.existsSync(downloadPath)) {
      fs.unlinkSync(downloadPath);
    }
    return !fs.existsSync(downloadPath);
  }

  /**
   * Reads a sheet from an Excel file and returns the result as a JSON file.
   *
   * @param {string} filepath - The path of the Excel file.
   * @param {string} sheetName - The name of the sheet to read.
   * @return {Promise<object>} A Promise that resolves with the JSON object.
   */
  public static async readExcelreturnJson(filepath: string, sheetName: string) {
    const result = excelToJson({
      sourceFile: filepath,
      header: {
        rows: 2,
      },
      //range: "B:K",
      columnToKey: {
        // B: "Node ID",
        // C: "Node Name",
        // D: "Calc/Input",
        // E: "Granularity",
        // G: "Entity",
        // H: "Channel",
        // I: "SBU",
        // J: "Department",
        // K: "FY25 M1",
        "*": "{{columnHeader}}",
      },
      sheets: [sheetName],
    });

    //await fs.promises.writeFile(writepath, JSON.stringify(result));
    return JSON.parse(JSON.stringify(result));
  }

  /**
   * Returns an array of fiscal year-month combinations starting from the next year.
   *
   * @return {Promise<string[]>} An array of strings representing fiscal year-month combinations.
   */
  static async getFiscalYearMonthList() {
    const currentYear = new Date().getFullYear() + 1;
    const monthArray = Array.from(
      { length: 12 },
      (_, i) => `${currentYear}${(i + 1).toString().padStart(2, "0")}`
    );
    return monthArray;
  }
}
