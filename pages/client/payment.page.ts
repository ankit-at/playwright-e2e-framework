import { ClientPage } from "./client.page";

export type CardDetails = {
  number?: string;
  /** value of the month <select>, e.g. "12" */
  month?: string;
  /** value of the year <select>, e.g. "25" */
  year?: string;
  cvv?: string;
  nameOnCard?: string;
  coupon?: string;
};

/**
 * PaymentPage — credit-card entry, coupon application, country selection, and
 * order placement, ending on the order-confirmation banner.
 */
export class PaymentPage extends ClientPage {
  readonly creditCardActive = this.page.locator(".payment__type--cc.active");
  // Card form fields, in DOM order within `div.field input.input.txt`.
  readonly cardNumberInput = this.page.locator("div.field input.input.txt").nth(0);
  readonly cvvInput = this.page.locator("div.field input.input.txt").nth(1);
  readonly nameOnCardInput = this.page.locator("div.field input.input.txt").nth(2);
  readonly couponInput = this.page.locator("div.field input.input.txt").nth(3);
  readonly monthSelect = this.page.locator("select.input.ddl").nth(0);
  readonly yearSelect = this.page.locator("select.input.ddl").nth(1);
  readonly applyCouponButton = this.page.locator("button.btn.mt-1");
  readonly couponAppliedMessage = this.page.locator("p.mt-1.ng-star-inserted");
  readonly userNameLabel = this.page.locator(".user__name.mt-5 label");
  readonly userNameInput = this.page.locator(".user__name.mt-5 input").first();
  // Country autocomplete + place-order
  readonly countryInput = this.page.locator("input.input.txt.text-validated").nth(2);
  readonly countryResults = this.page.locator("section.ta-results");
  readonly placeOrderButton = this.page.locator("a.btnn", { hasText: "Place Order" });
  // Confirmation
  readonly confirmation = this.page.locator("h1.hero-primary");
  readonly orderIdValue = this.page.locator(".em-spacer-1 .ng-star-inserted");

  /** Wait for the credit-card payment option to be active. */
  async waitForCreditCardForm(): Promise<void> {
    await this.actions.waitFor(this.creditCardActive);
  }

  /** Fill the card form and apply the coupon. */
  async fillCardAndApplyCoupon({
    number = "1111 1111 1111 1111 ",
    month = "12",
    year = "25",
    cvv = "102",
    nameOnCard = "Ankit",
    coupon = "rahulshettyacademy",
  }: CardDetails = {}): Promise<void> {
    await this.actions.fill(this.cardNumberInput, number);
    await this.actions.selectOption(this.monthSelect, month);
    await this.actions.selectOption(this.yearSelect, year);
    await this.actions.fill(this.cvvInput, cvv);
    await this.actions.fill(this.nameOnCardInput, nameOnCard);
    await this.actions.fill(this.couponInput, coupon);
    await this.actions.click(this.applyCouponButton);
  }

  /** Type into the country autocomplete and pick the exact match. */
  async selectCountry(country: string): Promise<void> {
    await this.actions.type(this.countryInput, country.toLowerCase());
    await this.actions.waitFor(this.countryResults);
    const options = this.countryResults.locator("button");
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text?.trim() === country) {
        await this.actions.click(options.nth(i));
        return;
      }
    }
  }

  async placeOrder(): Promise<void> {
    await this.actions.click(this.placeOrderButton);
  }

  /** The generated order id (leading "|" stripped). */
  async getOrderId(): Promise<string> {
    return (await this.orderIdValue.textContent())?.replace(/\|/g, "").trim() ?? "";
  }
}
