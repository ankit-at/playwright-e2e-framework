import { test, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";
import testData from "../config/testData";
import { LoginPage, DashboardPage, CartPage, PaymentPage, OrdersPage } from "../pages/client";

const client = testData.client;

let page: Page;
let context: BrowserContext;
let newWebContext: BrowserContext;
let page1: Page;

let dashboard: DashboardPage;
let cart: CartPage;
let payment: PaymentPage;
let orders: OrdersPage;

test.describe("API Testing Part2", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    await new LoginPage(page).login(client.credentials.email, client.credentials.password);
    await page.waitForLoadState("networkidle");
    await context.storageState({ path: "state.json" });

    newWebContext = await browser.newContext({ storageState: "state.json" });
    page1 = await newWebContext.newPage();

    dashboard = new DashboardPage(page1);
    cart = new CartPage(page1);
    payment = new PaymentPage(page1);
    orders = new OrdersPage(page1);

    await dashboard.open();
    await page1.waitForLoadState("networkidle");
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
    await page1.close();
    await newWebContext.close();
  });

  test("Verify product name", async () => {
    await dashboard.firstProductTitle().waitFor();
    await expect(dashboard.firstProductTitle()).toHaveText(client.productName);
  });

  test("Add product to cart", async () => {
    await dashboard.viewFirstProduct();
    await dashboard.addToCartUntilCounted(expect);
    await dashboard.goToCart();
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

  test("Verify wrong order ids are not accessible", async () => {
    await orders.goToMyOrders();

    // Rewrite the order-details request to a non-existent id to simulate an IDOR
    // attempt — the server must reject it.
    await page1.route(
      `${client.apiBaseURL}/api/ecom/order/get-orders-details?id=*`,
      async (route) =>
        route.continue({ url: `${client.apiBaseURL}/api/ecom/order/get-orders-details?id=abc` }),
    );

    await orders.viewOrderButton.click();
    await page1.waitForLoadState("networkidle");

    await expect(orders.notAuthorizedMessage).toHaveText("You are not authorize to view this order");
  });
});
