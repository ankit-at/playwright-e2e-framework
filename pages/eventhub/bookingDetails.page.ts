import { EventHubPage } from "./eventhub.page";

/**
 * BookingDetailsPage — the single-booking detail route (`/bookings/:id`),
 * including the "Access Denied" state (IDOR check).
 */
export class BookingDetailsPage extends EventHubPage {
  readonly accessDeniedHeading = this.page.getByText("Access Denied");
  readonly accessDeniedMessage = this.page.getByText("You are not authorized to view this booking");

  async open(bookingId: string): Promise<void> {
    await this.actions.goto(`${this.baseURL}/bookings/${bookingId}`, { waitUntil: "networkidle" });
  }
}
