import { test, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";
import testData from "../config/testData";
import { AngularFormPage } from "../pages/angularPractice";

const angular = testData.angularForm;

let page: Page;
let context: BrowserContext;
let form: AngularFormPage;

test.describe("Angular App", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      storageState: "auth.json", // already logged in
    });
    page = await context.newPage();
    form = new AngularFormPage(page);
    await form.open();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("Verify submission of form", async () => {
    await form.submitForm({
      name: angular.form.name,
      email: angular.form.email,
      password: angular.form.password,
      gender: angular.form.gender,
      birthday: angular.form.birthday,
    });

    await expect(form.successAlert).toHaveText(
      /Success! The Form has been submitted successfully!./,
    );
  });
});
