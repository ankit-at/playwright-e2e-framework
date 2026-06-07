const { test, expect } = require("../fixtures/eventhub.fixtures");
const { mockEventsApi } = require("../mocks/eventHubMocks");

// Payloads are parameterized from test-data, not defined in the spec.
const SIX_EVENTS_RESPONSE = require("../test-data/sixEvents.json");
const FOUR_EVENTS_RESPONSE = require("../test-data/fourEvents.json");

// Login happens once per worker via the authenticated fixture (fixtures/eventhub.fixtures.js),
// so these tests start already signed in. The route stub (mocks/eventHubMocks.js) and
// the events listing (EventsPage) are both modular — the spec only mocks, navigates,
// and asserts.
test.describe("Events sandbox banner (API mocked)", () => {
  test("banner is visible when 6 events are returned", async ({ page, eventsPage }) => {
    await mockEventsApi(page, SIX_EVENTS_RESPONSE);
    await eventsPage.open();

    await expect(eventsPage.eventCards.first()).toBeVisible();
    await expect(eventsPage.eventCards).toHaveCount(6);
    await expect(eventsPage.sandboxBanner).toBeVisible();
    await expect(eventsPage.sandboxBanner).toContainText("9 bookings");
  });

  test("banner is hidden when 4 events are returned", async ({ page, eventsPage }) => {
    await mockEventsApi(page, FOUR_EVENTS_RESPONSE);
    await eventsPage.open();

    await expect(eventsPage.eventCards.first()).toBeVisible();
    await expect(eventsPage.eventCards).toHaveCount(4);
    await expect(eventsPage.sandboxBanner).not.toBeVisible();
  });
});
