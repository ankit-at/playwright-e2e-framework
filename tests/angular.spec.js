const { test, expect } = require("@playwright/test");
const testData = require("../config/testData");
const { AngularFormPage } = require("../pages/angularPractice");

const angular = testData.angularForm;

/** @type {import("@playwright/test").Page} */
let page;
/** @type {import("@playwright/test").BrowserContext} */
let context;
/** @type {AngularFormPage} */
let form;

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
