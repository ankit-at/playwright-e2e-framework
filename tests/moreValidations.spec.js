const { test, expect } = require("../fixtures/practice.fixtures");

test("should have correct title", async ({ page, automationPracticePage: practice }) => {
  await practice.open();

  // Show / hide
  await expect(practice.displayedText).toBeVisible();
  await practice.hideTextboxButton.click();
  await expect(practice.displayedText).toBeHidden();

  // Confirm dialog — dismiss
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Are you sure");
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.dismiss();
  });
  await practice.confirmButton.click();

  // Mouse hover — "Top" link
  await practice.clickMouseHoverLink("Top");

  // Mouse hover — "Reload" link; assert a frame navigation fired
  await practice.mouseHover.hover();
  await practice.mouseHoverContent.waitFor();

  let navigated = false;
  page.once("framenavigated", () => {
    navigated = true;
  });
  await practice.mouseHoverContent.locator("a", { hasText: "Reload" }).click({ force: true });
  expect(navigated).toBeTruthy();

  // Alert dialog — accept
  page.once("dialog", async (dialog) => {
    console.log(dialog.type());
    console.log(dialog.message());
    expect(dialog.message()).toContain("share this practice page");
    await dialog.accept();
  });
  await practice.alertButton.click();

  // Iframe
  const frame = practice.coursesFrame();
  await frame.locator("a:visible", { hasText: "All Access Plan" }).click();

  const content = await frame.locator(".text h2").textContent();
  console.log(`Content: ${content}`);

  const newContent = (content ?? "").split(" ")[1].trim();
  console.log(`Trimmed Content: ${newContent}`);
});
