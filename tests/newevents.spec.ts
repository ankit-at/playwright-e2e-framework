import { test, expect } from "../fixtures/eventhub.fixtures";

// Same end-to-end flow as events.spec.ts, kept as a separate scenario. Login is
// handled once per worker by the authenticated fixture; the spec only arranges
// (via page objects) and asserts.
test("End to End Event Booking Flow", async ({
  page,
  adminEventsPage,
  eventsPage,
  bookingPage,
  myBookingsPage,
}) => {
  test.setTimeout(120000);

  const eventTitle = "Test Event" + Date.now();
  await adminEventsPage.createEvent({ title: eventTitle });
  await expect(adminEventsPage.successToast).toBeVisible();

  await eventsPage.open();
  const matchedCard = eventsPage.cardByTitle(eventTitle);
  await expect(matchedCard).toBeVisible({ timeout: 5000 });

  const seatForBooking = await eventsPage.seatsFor(matchedCard);
  console.log(`Seats before booking: ${seatForBooking}`);

  await eventsPage.bookNow(matchedCard);

  await bookingPage.waitUntilReady();
  await expect(bookingPage.ticketCount).toHaveText("1");

  await bookingPage.fillCustomerDetails({
    name: "Ankit",
    email: "ankit@example.com",
    phone: "+91 98765 42210",
  });
  await bookingPage.confirm();

  await expect(bookingPage.bookingRef).toBeVisible();
  const bookingRef = await bookingPage.getBookingRef();

  await bookingPage.viewMyBookings();
  await expect(page).toHaveURL(myBookingsPage.url);
  await expect(myBookingsPage.bookingCards.first()).toBeVisible();

  const matchedBookingCard = myBookingsPage.cardByRef(bookingRef);
  await expect(matchedBookingCard).toBeVisible();
  await expect(matchedBookingCard).toContainText(eventTitle);

  await eventsPage.open();
  const updatedCard = eventsPage.cardByTitle(eventTitle);
  await expect(updatedCard).toBeVisible();

  const seatAfterBooking = await eventsPage.seatsFor(updatedCard);
  console.log(`Seats after booking: ${seatAfterBooking}`);
  expect(seatAfterBooking).toBe(seatForBooking - 1);
});
