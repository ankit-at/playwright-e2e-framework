const { test, expect } = require("@playwright/test");
const testData = require("../config/testData");
const { LoginPage, DashboardPage, CartPage, PaymentPage, OrdersPage } = require("../pages/client");

const client = testData.client;

/** @type {import("@playwright/test").Page} */
let page;
/** @type {import("@playwright/test").BrowserContext} */
let context;
/** @type {import("@playwright/test").Page} */
let page1;
/** @type {import("@playwright/test").BrowserContext} */
let newWebContext;

/** @type {DashboardPage} */ let dashboard;
/** @type {CartPage} */ let cart;
/** @type {PaymentPage} */ let payment;
/** @type {OrdersPage} */ let orders;

test.describe("API Testing Part2", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    // First context: log in via UI and persist the session.
    context = await browser.newContext();
    page = await context.newPage();
    await new LoginPage(page).login(client.credentials.email, client.credentials.password);
    await page.waitForLoadState("networkidle");
    await context.storageState({ path: "state.json" });

    // Second context: start from the injected session (already authenticated).
    newWebContext = await browser.newContext({ storageState: "state.json" });
    page1 = await newWebContext.newPage();

    dashboard = new DashboardPage(page1);
    cart = new CartPage(page1);
    payment = new PaymentPage(page1);
    orders = new OrdersPage(page1);

    await dashboard.open();
    await page1.waitForLoadState("networkidle");
    // networkidle resolves before Angular renders the product list — wait explicitly
    await dashboard.firstProductTitle().waitFor({ timeout: 30000 });
  });

  test.afterAll(async () => {
    await newWebContext.close();
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
    await expect(cart.cartProducts).toContainText(client.productName);
  });

  test("Verify credit card details and place order", async () => {
    await cart.checkout();
    await payment.waitForCreditCardForm();
    await payment.fillCardAndApplyCoupon({ number: "1111 1111 1111 1111" });

    await expect(payment.couponAppliedMessage).toHaveText("* Coupon Applied");
    await expect(payment.userNameLabel).toHaveText(client.credentials.email);

    const email = await payment.userNameInput.inputValue();
    expect(email).toBe(client.credentials.email);
  });

  test("Place order", async () => {
    await payment.selectCountry("India");
    await payment.placeOrder();

    await expect(payment.confirmation).toContainText("Thankyou");

    const orderId = await payment.getOrderId();
    console.log("Order ID:", orderId);

    await dashboard.goToMyOrders();
    await orders.waitForRows();
    expect(await orders.hasOrder(orderId)).toBeTruthy();
  });
});
