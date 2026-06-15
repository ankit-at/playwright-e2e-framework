import type { Page } from "@playwright/test";

// Glob for the events listing API. Ends in ** so it also matches the live query
// string (/api/events?page=1&limit=12) — a bare **/api/events is $-anchored and
// would never match once params are appended.
export const EVENTS_API_GLOB = "**/api/events**";

/**
 * Stub the EventHub events-listing API with a fixed payload (route interception).
 */
export async function mockEventsApi(page: Page, payload: unknown): Promise<void> {
  await page.route(EVENTS_API_GLOB, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });
}
