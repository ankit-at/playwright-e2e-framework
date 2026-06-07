const { test, expect } = require("../fixtures/eventhub.fixtures");

/**
 * Arrange: create a fresh event and book `tickets` of it, landing on the
 * confirmation. Static demo events are unbookable, so each test seeds its own
 * event — same pattern as events/newevents specs.
 *
 * @param {{ adminEventsPage: import("../pages/eventhub/adminEvents.page").AdminEventsPage,
 *           eventsPage: import("../pages/eventhub/events.page").EventsPage,
 *           bookingPage: import("../pages/eventhub/booking.page").BookingPage }} pages
 * @param {number} tickets
 */
async function bookFreshEvent({ adminEventsPage, eventsPage, bookingPage }, tickets) {
  const eventTitle = "Refund Test Event " + Date.now();
  await adminEventsPage.createEvent({
    title: eventTitle,
    description: "Playwright refund test event",
  });

  await eventsPage.open();
  const card = eventsPage.cardByTitle(eventTitle);
  await eventsPage.bookNow(card);

  await bookingPage.waitUntilReady();
  await bookingPage.addTickets(tickets - 1); // 1 ticket = 0 extra clicks
  await bookingPage.fillCustomerDetails({
    name: "Ankit",
    email: "ankit@example.com",
    phone: "+91 98765 43210",
  });
  await bookingPage.confirm();
  await bookingPage.confirmationHeading.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
}

/**
 * Open the just-booked booking's detail view and assert the booking reference's
 * first character matches the event title's first character.
 * @param {import("../pages/eventhub/booking.page").BookingPage} bookingPage
 * @param {import("../pages/eventhub/myBookings.page").MyBookingsPage} myBookingsPage
 * @param {import("@playwright/test").Page} page
 */
async function openDetailsAndValidateRef(bookingPage, myBookingsPage, page) {
  await bookingPage.viewMyBookings();
  await expect(page).toHaveURL(myBookingsPage.url);
  await expect(myBookingsPage.bookingCards.first()).toBeVisible();

  await myBookingsPage.openFirstDetails();
  await expect(myBookingsPage.bookingInformation).toBeVisible();

  const bookingRef = (await myBookingsPage.detailBookingRef.innerText()).trim();
  const eventTitle = (await myBookingsPage.detailEventTitle.innerText()).trim();
  console.log(`Booking Ref: ${bookingRef}, Event Title: ${eventTitle}`);
  expect(bookingRef.charAt(0)).toBe(eventTitle.charAt(0));
}

test("Check Eligibility for Refund when non-group ticket is booked", async ({
  page,
  adminEventsPage,
  eventsPage,
  bookingPage,
  myBookingsPage,
}) => {
  test.setTimeout(120000);

  await bookFreshEvent({ adminEventsPage, eventsPage, bookingPage }, 1);
  await openDetailsAndValidateRef(bookingPage, myBookingsPage, page);

  await myBookingsPage.checkRefundEligibility();
  await expect(myBookingsPage.refundSpinner).toBeVisible();
  await expect(myBookingsPage.refundSpinner).not.toBeVisible({ timeout: 6000 });
  await expect(myBookingsPage.refundResult).toBeVisible();
  await expect(myBookingsPage.refundResult).toContainText("Eligible for refund");
  await expect(myBookingsPage.refundResult).toContainText(
    "Single-ticket bookings qualify for a full refund",
  );
});

test("Check Eligibility for Refund when group ticket is booked", async ({
  page,
  adminEventsPage,
  eventsPage,
  bookingPage,
  myBookingsPage,
}) => {
  test.setTimeout(120000);

  await bookFreshEvent({ adminEventsPage, eventsPage, bookingPage }, 3);
  await openDetailsAndValidateRef(bookingPage, myBookingsPage, page);

  await myBookingsPage.checkRefundEligibility();
  await expect(myBookingsPage.refundSpinner).toBeVisible();
  await expect(myBookingsPage.refundSpinner).not.toBeVisible({ timeout: 6000 });
  await expect(myBookingsPage.refundResult).toBeVisible();
  await expect(myBookingsPage.refundResult).toContainText("Not eligible for refund");
  await expect(myBookingsPage.refundResult).toContainText(
    "Group bookings (3 tickets) are non-refundable",
  );
});
