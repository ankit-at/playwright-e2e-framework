import type { Page } from "@playwright/test";

type BrokenLink = { text: string; href: string; status: number | string };
type EmptyLink = { text: string; href: string };

/**
 * Collect every link matched by `locator`, then HTTP-probe each href and bucket
 * the results into broken (status >= 400 / request failed) and empty/invalid links.
 * @param locator CSS/locator string for the anchor elements
 */
export async function findBrokenLinks(
  page: Page,
  locator: string,
): Promise<{ brokenLinks: BrokenLink[]; emptyLinks: EmptyLink[] }> {
  const links = await page.locator(locator).evaluateAll((elements) =>
    elements.map((el) => ({
      text: (el as HTMLElement).innerText.trim(),
      href: el.getAttribute("href"),
    })),
  );

  const brokenLinks: BrokenLink[] = [];
  const emptyLinks: EmptyLink[] = [];

  for (const link of links) {
    // Empty or invalid links. The scheme check is case-insensitive and tolerates
    // leading whitespace, and also covers the other non-navigational schemes a
    // browser would treat specially — startsWith("javascript:") alone would let
    // "JavaScript:" or " javascript:" slip through (CodeQL js/incomplete-url-scheme-check).
    if (
      !link.href ||
      link.href === "#" ||
      link.href.trim() === "" ||
      /^\s*(javascript|vbscript|data):/i.test(link.href)
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
