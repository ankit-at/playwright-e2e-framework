import { test, expect } from "../fixtures/protocommerce.fixtures";
import { LoginPage } from "../pages/protocommerce";
import testData from "../config/testData";

const proto = testData.protocommerce;

test("Verify Invalid username and password", async ({ loginPage }) => {
  await loginPage.login(proto.invalid.username, proto.invalid.password);

  await expect(loginPage.errorBanner).toHaveText(proto.invalid.errorMessage);
});

test("Verify valid username and password", async ({ loginPage, productsPage }) => {
  await loginPage.login(proto.credentials.username, proto.credentials.password);

  await productsPage.firstProduct().click();
  await expect(productsPage.page).toHaveTitle(proto.dashboardTitle);
});

test("verify all products are displayed", async ({ loginPage, productsPage }) => {
  await loginPage.login(proto.credentials.username, proto.credentials.password);

  await productsPage.firstProduct().waitFor();
  const productNames = await productsPage.productNames();
  console.log(productNames);
  expect(productNames.length).toBeGreaterThan(0);
});

test("UI Basics Elements Handling", async ({ loginPage }) => {
  await loginPage.open();
  await expect(loginPage.page).toHaveTitle(/Rahul Shetty Academy/);

  await loginPage.usernameInput.fill(proto.credentials.username);
  await loginPage.passwordInput.fill(proto.credentials.password);

  // Dropdown
  await loginPage.roleDropdown.selectOption("consult");
  await expect(loginPage.roleDropdown).toHaveValue("consult");

  // Radio buttons
  await loginPage.radioByValue("user").check();
  await expect(loginPage.radioByValue("user")).toBeChecked();

  await loginPage.okayButton.click();

  await loginPage.radioByValue("admin").check();
  await expect(loginPage.radioByValue("admin")).toBeChecked();

  // Checkbox — check, uncheck, then check again
  await loginPage.termsCheckbox.check();
  await expect(loginPage.termsCheckbox).toBeChecked();
  await loginPage.termsCheckbox.uncheck();
  await expect(loginPage.termsCheckbox).not.toBeChecked();
  await loginPage.termsCheckbox.check();
  await expect(loginPage.termsCheckbox).toBeChecked();

  await expect(loginPage.documentsLink).toHaveAttribute("class", "blinkingText");
});

test("Child Window Handling", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await expect(page).toHaveTitle(/Rahul Shetty Academy/);

  // Clicking the documents link opens a new tab — capture it via the 'page' event
  const [newPage] = await Promise.all([
    context.waitForEvent("page"),
    loginPage.documentsLink.click(),
  ]);

  await newPage.waitForLoadState();

  // Extract the email advertised on the child window, then reuse it on the main page
  const text = await newPage.locator("p.red").textContent();
  const email = text?.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] ?? "";
  // Do not log the extracted email or the text containing it — sensitive.

  await page.bringToFront();

  await loginPage.usernameInput.fill(email);
  const validateEmail = await loginPage.usernameInput.inputValue();
  // Do not log validateEmail — it is the email address.

  expect(validateEmail).toBe(email);
});
