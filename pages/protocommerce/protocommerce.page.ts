import { BasePage } from "../base.page";
import testData from "../../config/testData";

/**
 * ProtoCommercePage — base for the "loginpagePractise" app
 * (https://rahulshettyacademy.com/loginpagePractise). Resolves the base URL from
 * config/testData.
 */
export class ProtoCommercePage extends BasePage {
  readonly baseURL = testData.protocommerce.baseURL;
}
