import { test, expect } from "@playwright/test";
import testData from "../config/testData";
import { EventHubApi } from "../api/eventHubApi";
import { LoginPage, BookingDetailsPage } from "../pages/eventhub";

const users = testData.eventhub.personas;

test.describe("Booking authorization — cross-user access is denied (IDOR)", () => {
  test.beforeAll(async ({ request }) => {
    const api = new EventHubApi(request);
    await api.ensureAccount(users.yahoo);
    await api.ensureAccount(users.gmail);
  });

  test("Gmail user cannot view a booking made by the Yahoo user", async ({ page, request }) => {
    const api = new EventHubApi(request);

    // Step 1 — Login as Yahoo user
    const loginRes = await api.login(users.yahoo);
    expect(loginRes.status()).toBe(200);

    const { token } = await loginRes.json();
    expect(token).toBeTruthy();

    // Step 2 — Get events
    const eventsRes = await api.getEvents(token);
    expect(eventsRes.status()).toBe(200);

    const eventsBody = await eventsRes.json();
    const events = eventsBody.data || [];
    expect(events.length).toBeGreaterThan(0);

    let yahooBookingId: string | undefined;

    // Step 3 — Try booking events until one succeeds
    for (const event of events) {
      const bookingRes = await api.createBooking(token, {
        eventId: event.id,
        customerName: users.yahoo.name,
        customerEmail: users.yahoo.email,
        customerPhone: users.yahoo.phone,
        quantity: 1,
      });

      console.log(`Booking event ${event.id} (${event.title}) -> ${bookingRes.status()}`);
      // Do not log the raw booking response — it echoes customerEmail/customerPhone.

      if (bookingRes.ok()) {
        const bookingBody = await bookingRes.json();
        yahooBookingId = bookingBody.data?.id;
        break;
      }
    }

    expect(yahooBookingId, "Unable to create a booking for any available event").toBeTruthy();

    // Step 4 — Login as Gmail user (via the UI)
    await new LoginPage(page).login(users.gmail.email, users.gmail.password);

    // Step 5 — Attempt IDOR access
    const bookingDetails = new BookingDetailsPage(page);
    await bookingDetails.open(yahooBookingId!);

    // Step 6 — Verify authorization protection
    await expect(bookingDetails.accessDeniedHeading).toBeVisible();
    await expect(bookingDetails.accessDeniedMessage).toBeVisible();
  });
});
