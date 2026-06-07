// @ts-check
//
// EventHub test fixtures — the entry point EventHub UI specs import from.
//
// Owns the per-worker authenticated session (log in once per worker, reuse
// storageState — see utils/auth.js) and lazily injects the EventHub page objects
// and the EventHubApi service client. A spec declares only what it needs in its
// arguments (`async ({ eventsPage, eventHubApi }) => …`) and Playwright builds
// just those — no login code and no `new SomePage(page)` boilerplate in the spec.
//
const base = require("@playwright/test");
const { seedEventHubStorageState } = require("../utils/auth");
const { EventHubApi } = require("../api/eventHubApi");
const {
  LoginPage,
  AdminEventsPage,
  EventsPage,
  BookingPage,
  MyBookingsPage,
  BookingDetailsPage,
} = require("../pages/eventhub");

/**
 * @typedef {Object} EventHubFixtures
 * @property {LoginPage} loginPage
 * @property {AdminEventsPage} adminEventsPage
 * @property {EventsPage} eventsPage
 * @property {BookingPage} bookingPage
 * @property {MyBookingsPage} myBookingsPage
 * @property {BookingDetailsPage} bookingDetailsPage
 * @property {EventHubApi} eventHubApi
 */

const test = base.test.extend(
  /** @type {import("@playwright/test").Fixtures<EventHubFixtures, { workerStorageState: string }, import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions>} */ ({
    // Forward the worker-scoped session to Playwright's storageState option so
    // every page/context this worker creates starts already logged in.
    storageState: ({ workerStorageState }, use) => use(workerStorageState),

    workerStorageState: [
      async ({ browser }, use) => {
        const fileName = await seedEventHubStorageState(browser, test.info());
        await use(fileName);
      },
      { scope: "worker" },
    ],

    // Page objects
    loginPage: async ({ page }, use) => {
      await use(new LoginPage(page));
    },
    adminEventsPage: async ({ page }, use) => {
      await use(new AdminEventsPage(page));
    },
    eventsPage: async ({ page }, use) => {
      await use(new EventsPage(page));
    },
    bookingPage: async ({ page }, use) => {
      await use(new BookingPage(page));
    },
    myBookingsPage: async ({ page }, use) => {
      await use(new MyBookingsPage(page));
    },
    bookingDetailsPage: async ({ page }, use) => {
      await use(new BookingDetailsPage(page));
    },

    // API service client
    eventHubApi: async ({ request }, use) => {
      await use(new EventHubApi(request));
    },
  }),
);

module.exports = { test, expect: base.expect };
