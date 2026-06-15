import { test, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";
import testData from "../config/testData";
import { LoginPage, DashboardPage, CartPage, PaymentPage, OrdersPage } from "../pages/client";

const client = testData.client;

let page: Page;
let context: BrowserContext;

let dashboard: DashboardPage;
let cart: CartPage;
let payment: PaymentPage;
let orders: OrdersPage;

test.describe("Happy Flow (shared session)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    dashboard = new DashboardPage(page);
    cart = new CartPage(page);
    payment = new PaymentPage(page);
    orders = new OrdersPage(page);

    await new LoginPage(page).login(client.credentials.email, client.credentials.password);

    // Wait for the dashboard product list — Angular's product API call fires after
    // the initial HTML settles.
    await dashboard.firstProductTitle().waitFor({ timeout: 30000 });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("Verify product name", async () => {
    await expect(dashboard.firstProductTitle()).toHaveText(client.productName);
  });

  test("Add product to cart", async () => {
    await dashboard.viewFirstProduct();
    await dashboard.addToCartUntilCounted(expect);
    await dashboard.goToCart();
    await cart.cartProducts.first().waitFor();
  });

  test("Verify product in cart", async () => {
    await expect(cart.cartProducts).toHaveText(client.productName);
  });

  test("Verify credit card details and place order", async () => {
    await cart.checkout();
    await payment.waitForCreditCardForm();
    await payment.fillCardAndApplyCoupon();

    await expect(payment.couponAppliedMessage).toHaveText("* Coupon Applied");
    await expect(payment.userNameLabel).toHaveText(client.credentials.email);

    const text = await payment.userNameInput.inputValue();
    expect(text).toBe(client.credentials.email);
  });

  test("Place order", async () => {
    await payment.selectCountry("India");
    await payment.placeOrder();

    await expect(payment.confirmation).toHaveText(/thank.?you for the order/i);

    const orderId = await payment.getOrderId();
    console.log(orderId);

    await dashboard.goToMyOrders();
    await orders.waitForRows();
    expect(await orders.hasOrder(orderId)).toBeTruthy();
  });
});
