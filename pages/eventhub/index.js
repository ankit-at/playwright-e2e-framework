// @ts-check
// Barrel for the EventHub page objects.
module.exports = {
  ...require("./login.page"),
  ...require("./adminEvents.page"),
  ...require("./events.page"),
  ...require("./booking.page"),
  ...require("./myBookings.page"),
  ...require("./bookingDetails.page"),
};
