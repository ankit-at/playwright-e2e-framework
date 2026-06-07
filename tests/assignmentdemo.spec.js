const { test, expect } = require("../fixtures/client.fixtures");
const testData = require("../config/testData");

const client = testData.client;

test("Verify invalid login", async ({ loginPage }) => {
  await loginPage.login(client.invalid.email, client.invalid.password);

  await expect(loginPage.toastMessage).toContainText(client.invalid.errorMessage);
});

test("Verify valid login and verify first product", async ({ loginPage, dashboardPage, cartPage }) => {
  await loginPage.login(client.credentials.email, client.credentials.password);

  await dashboardPage.firstProductTitle().waitFor();
  console.log(await dashboardPage.firstProductTitle().textContent());

  await dashboardPage.viewFirstProduct();
  await dashboardPage.addToCartUntilCounted(expect);

  await dashboardPage.goToCart();
  await expect(cartPage.cartProducts.first()).toBeVisible();
  console.log(await dashboardPage.cartBadge.textContent());
});
