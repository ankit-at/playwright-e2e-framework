import { BasePage } from "../base.page";
import testData from "../../config/testData";

/**
 * EventHubPage — base for every page object of the EventHub web app
 * (https://eventhub.rahulshettyacademy.com). Resolves the app base URL from
 * config/testData so individual pages can build their routes.
 */
export class EventHubPage extends BasePage {
  readonly baseURL = testData.eventhub.baseURL;
}
