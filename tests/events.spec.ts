import { test, expect } from "../fixtures/eventhub.fixtures";

// Login happens once per worker via the authenticated fixture (fixtures/eventhub.fixtures.ts),
// so this test starts already signed in. All UI interaction goes through page
// objects; the spec is arrange + assertions only.
test("create event via UI, book it, and verify seat reduction", async ({
  page,
  adminEventsPage,
  eventsPage,
  bookingPage,
  myBookingsPage,
}) => {
  // create + book + multi-page verification against a live, slow site
  test.setTimeout(120000);

  // ── Create a bookable event (static demo events are unbookable) ───────────
  const eventTitle = `Test Event ${Date.now()}`;
  await adminEventsPage.createEvent({ title: eventTitle });
  await expect(adminEventsPage.successToast).toBeVisible();
  console.log(`Created event: "${eventTitle}"`);

  // ── Find the new card and capture seats before booking ───────────────────
  await eventsPage.open();
  const card = eventsPage.cardByTitle(eventTitle);
  await expect(card).toBeVisible({ timeout: 5000 });

  const seatsBeforeBooking = await eventsPage.seatsFor(card);
  console.log(`Seats before booking: ${seatsBeforeBooking}`);

  await eventsPage.bookNow(card);

  // ── Fill the booking form ────────────────────────────────────────────────
  await bookingPage.waitUntilReady();
  await expect(bookingPage.ticketCount).toHaveText("1");
  await bookingPage.fillCustomerDetails({
    name: "Test Student",
    email: "test.student@example.com",
    phone: "9876543210",
  });
  await bookingPage.confirm();

  // ── Verify booking confirmation ──────────────────────────────────────────
  await expect(bookingPage.bookingRef).toBeVisible();
  const bookingRef = await bookingPage.getBookingRef();
  expect(bookingRef.charAt(0)).toBe(eventTitle.trim().charAt(0).toUpperCase());
  console.log(`Booking confirmed. Ref: ${bookingRef}`);

  // ── Booking appears in My Bookings ───────────────────────────────────────
  await bookingPage.viewMyBookings();
  await expect(page).toHaveURL(myBookingsPage.url);
  await expect(myBookingsPage.bookingCards.first()).toBeVisible();

  const matchingCard = myBookingsPage.cardByRef(bookingRef);
  await expect(matchingCard).toBeVisible();
  await expect(matchingCard).toContainText(eventTitle);
  console.log(`Booking card found in My Bookings for ref: ${bookingRef}`);

  // ── Seat count dropped by exactly one ────────────────────────────────────
  await eventsPage.open();
  const updatedCard = eventsPage.cardByTitle(eventTitle);
  await expect(updatedCard).toBeVisible();

  const seatsAfterBooking = await eventsPage.seatsFor(updatedCard);
  console.log(`Seats after booking: ${seatsAfterBooking}`);
  expect(seatsAfterBooking).toBe(seatsBeforeBooking - 1);
});
