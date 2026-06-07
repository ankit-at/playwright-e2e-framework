// @ts-check
const { ClientPage } = require("./client.page");

/**
 * @typedef {Object} CardDetails
 * @property {string} [number]
 * @property {string} [month]   value of the month <select>, e.g. "12"
 * @property {string} [year]    value of the year <select>, e.g. "25"
 * @property {string} [cvv]
 * @property {string} [nameOnCard]
 * @property {string} [coupon]
 */

/**
 * PaymentPage — credit-card entry, coupon application, country selection, and
 * order placement, ending on the order-confirmation banner.
 */
class PaymentPage extends ClientPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.creditCardActive = page.locator(".payment__type--cc.active");
    // Card form fields, in DOM order within `div.field input.input.txt`.
    this.cardNumberInput = page.locator("div.field input.input.txt").nth(0);
    this.cvvInput = page.locator("div.field input.input.txt").nth(1);
    this.nameOnCardInput = page.locator("div.field input.input.txt").nth(2);
    this.couponInput = page.locator("div.field input.input.txt").nth(3);
    this.monthSelect = page.locator("select.input.ddl").nth(0);
    this.yearSelect = page.locator("select.input.ddl").nth(1);
    this.applyCouponButton = page.locator("button.btn.mt-1");
    this.couponAppliedMessage = page.locator("p.mt-1.ng-star-inserted");
    this.userNameLabel = page.locator(".user__name.mt-5 label");
    this.userNameInput = page.locator(".user__name.mt-5 input").first();
    // Country autocomplete + place-order
    this.countryInput = page.locator("input.input.txt.text-validated").nth(2);
    this.countryResults = page.locator("section.ta-results");
    this.placeOrderButton = page.locator("a.btnn", { hasText: "Place Order" });
    // Confirmation
    this.confirmation = page.locator("h1.hero-primary");
    this.orderIdValue = page.locator(".em-spacer-1 .ng-star-inserted");
  }

  /** Wait for the credit-card payment option to be active. */
  async waitForCreditCardForm() {
    await this.creditCardActive.waitFor();
  }

  /** Fill the card form and apply the coupon. @param {CardDetails} [details] */
  async fillCardAndApplyCoupon({
    number = "1111 1111 1111 1111 ",
    month = "12",
    year = "25",
    cvv = "102",
    nameOnCard = "Ankit",
    coupon = "rahulshettyacademy",
  } = {}) {
    await this.cardNumberInput.fill(number);
    await this.monthSelect.selectOption(month);
    await this.yearSelect.selectOption(year);
    await this.cvvInput.fill(cvv);
    await this.nameOnCardInput.fill(nameOnCard);
    await this.couponInput.fill(coupon);
    await this.applyCouponButton.click();
  }

  /**
   * Type into the country autocomplete and pick the exact match.
   * @param {string} country
   */
  async selectCountry(country) {
    await this.countryInput.pressSequentially(country.toLowerCase());
    await this.countryResults.waitFor();
    const options = this.countryResults.locator("button");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text?.trim() === country) {
        await options.nth(i).click();
        return;
      }
    }
  }

  async placeOrder() {
    await this.placeOrderButton.click();
  }

  /** @returns {Promise<string>} the generated order id (leading "|" stripped). */
  async getOrderId() {
    return (await this.orderIdValue.textContent())?.replace(/\|/g, "").trim() ?? "";
  }
}

module.exports = { PaymentPage };
