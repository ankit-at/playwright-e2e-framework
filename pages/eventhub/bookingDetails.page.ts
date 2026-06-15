import { EventHubPage } from "./eventhub.page";

/**
 * BookingDetailsPage — the single-booking detail route (`/bookings/:id`),
 * including the "Access Denied" state shown when a user opens a booking they do
 * not own (authorization / IDOR check).
 */
export class BookingDetailsPage extends EventHubPage {
  readonly accessDeniedHeading = this.page.getByText("Access Denied");
  readonly accessDeniedMessage = this.page.getByText("You are not authorized to view this booking");

  /** Open a booking by id. */
  async open(bookingId: string): Promise<void> {
    await this.page.goto(`${this.baseURL}/bookings/${bookingId}`, { waitUntil: "networkidle" });
  }
}
