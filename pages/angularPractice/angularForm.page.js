// @ts-check
const { BasePage } = require("../base.page");
const testData = require("../../config/testData");

/**
 * @typedef {Object} FormDetails
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {string} gender    option of the Gender <select>
 * @property {string} birthday  yyyy-mm-dd
 */

/**
 * AngularFormPage — the angularpractice "Form" screen. Base URL comes from
 * angular.properties.
 */
class AngularFormPage extends BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.baseURL = testData.angularForm.baseURL;
    this.nameInput = page.locator('input.form-control[name="name"]');
    this.emailInput = page.locator('[name="email"]');
    this.passwordInput = page.getByPlaceholder("Password");
    this.loveIceCreamCheckbox = page.getByLabel("Check me out if you Love IceCreams!");
    this.genderSelect = page.getByLabel("Gender");
    this.employedRadio = page.locator('[name="inlineRadioOptions"]').first();
    this.birthdayInput = page.locator('[name="bday"]');
    this.submitButton = page.getByRole("button", { name: "Submit" });
    this.successAlert = page.locator("div.alert-success");
  }

  async open() {
    await this.page.goto(this.baseURL);
  }

  /** Fill every field and submit. @param {FormDetails} details */
  async submitForm({ name, email, password, gender, birthday }) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loveIceCreamCheckbox.click();
    await this.genderSelect.selectOption(gender);
    await this.employedRadio.click();
    await this.birthdayInput.fill(birthday);
    await this.submitButton.click();
  }
}

module.exports = { AngularFormPage };
