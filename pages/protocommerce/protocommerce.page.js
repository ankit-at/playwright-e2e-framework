// @ts-check
const { BasePage } = require("../base.page");
const testData = require("../../config/testData");

/**
 * ProtoCommercePage — base for the "loginpagePractise" app
 * (https://rahulshettyacademy.com/loginpagePractise). Resolves the base URL from
 * config/testData.
 */
class ProtoCommercePage extends BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.baseURL = testData.protocommerce.baseURL;
  }
}

module.exports = { ProtoCommercePage };
