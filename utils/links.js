// @ts-check

/**
 * Collect every link matched by `locator`, then HTTP-probe each href and bucket
 * the results into broken (status >= 400 / request failed) and empty/invalid links.
 * @param {import("@playwright/test").Page} page
 * @param {string} locator CSS/locator string for the anchor elements
 */
async function findBrokenLinks(page, locator) {
  const links = await page.locator(locator).evaluateAll((elements) =>
    elements.map((el) => ({
      text: /** @type {HTMLElement} */ (el).innerText.trim(),
      href: el.getAttribute("href"),
    })),
  );

  const brokenLinks = [];
  const emptyLinks = [];

  for (const link of links) {
    // Empty or invalid links
    if (
      !link.href ||
      link.href === "#" ||
      link.href.trim() === "" ||
      link.href.startsWith("javascript:")
    ) {
      emptyLinks.push({
        text: link.text,
        href: link.href || "No href",
      });

      continue;
    }

    try {
      const response = await page.request.get(link.href);

      if (response.status() >= 400) {
        brokenLinks.push({
          text: link.text,
          href: link.href,
          status: response.status(),
        });
      }
    } catch {
      brokenLinks.push({
        text: link.text,
        href: link.href,
        status: "Request Failed",
      });
    }
  }

  return {
    brokenLinks,
    emptyLinks,
  };
}

module.exports = { findBrokenLinks };
