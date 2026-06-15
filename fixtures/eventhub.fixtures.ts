//
// EventHub test fixtures — the entry point EventHub UI specs import from.
//
// Owns the per-worker authenticated session (log in once per worker, reuse
// storageState — see utils/auth.ts) and lazily injects the EventHub page objects
// and the EventHubApi service client.
//
import { test as base, expect } from "@playwright/test";
import { seedEventHubStorageState } from "../utils/auth";
import { EventHubApi } from "../api/eventHubApi";
import {
  LoginPage,
  AdminEventsPage,
  EventsPage,
  BookingPage,
  MyBookingsPage,
  BookingDetailsPage,
} from "../pages/eventhub";

type EventHubFixtures = {
  loginPage: LoginPage;
  adminEventsPage: AdminEventsPage;
  eventsPage: EventsPage;
  bookingPage: BookingPage;
  myBookingsPage: MyBookingsPage;
  bookingDetailsPage: BookingDetailsPage;
  eventHubApi: EventHubApi;
};

type EventHubWorkerFixtures = {
  workerStorageState: string;
};

export const test = base.extend<EventHubFixtures, EventHubWorkerFixtures>({
  // Forward the worker-scoped session to Playwright's storageState option so every
  // page/context this worker creates starts already logged in.
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
});

export { expect };
