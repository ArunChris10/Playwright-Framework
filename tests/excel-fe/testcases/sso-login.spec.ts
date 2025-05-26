import { test } from "../../common/fixtures/test-hook";
import { LoginExcelPage } from "../../common/pages/login-excel.page";

test.describe(
  "SSO Login test",
  { tag: "@Regression @Smoke @ExcelPlugin @ExcelSSOLogin" },
  async () => {
    let loginExcelPage: LoginExcelPage;

    test.beforeAll(async ({ pageFactory }) => {
      loginExcelPage = pageFactory.loginExcel();
    });

    test("Verify SSO is triggered on first use", async () => {
        await loginExcelPage.verifySSOIsTriggered();
    });

    test("Verify cannot open IBG if SSO fails", async () => {
        await loginExcelPage.verifySSOFailed();
    });
  }
);
