// @ts-check

// Glob for the events listing API. Ends in ** so it also matches the live query
// string (/api/events?page=1&limit=12) — a bare **/api/events is $-anchored and
// would never match once params are appended.
const EVENTS_API_GLOB = "**/api/events**";

/**
 * Stub the EventHub events-listing API with a fixed payload (route interception).
 * @param {import("@playwright/test").Page} page
 * @param {unknown} payload JSON body to return for the events listing call
 */
async function mockEventsApi(page, payload) {
  await page.route(EVENTS_API_GLOB, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    });
  });
}

module.exports = { EVENTS_API_GLOB, mockEventsApi };
