// @ts-check
const { BasePage } = require("../base.page");
const testData = require("../../config/testData");

/**
 * EventHubPage — base for every page object of the EventHub web app
 * (https://eventhub.rahulshettyacademy.com). Resolves the app base URL from
 * config/testData so individual pages can build their routes.
 */
class EventHubPage extends BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.baseURL = testData.eventhub.baseURL;
  }
}

module.exports = { EventHubPage };
