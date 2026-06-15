import { BasePage } from "../base.page";
import testData from "../../config/testData";

/**
 * DatePickerPage — the react-date-picker widget on the seleniumPractise offers
 * page. `pickDate` climbs the calendar views (days → months → years) and waits
 * for each destination view to render before the next click, so a click never
 * races a mid-flight React transition.
 */
export class DatePickerPage extends BasePage {
  readonly baseURL = testData.datepicker.baseURL;
  readonly inputGroup = this.page.locator("div.react-date-picker__inputGroup");
  readonly navigationLabel = this.page.locator("button.react-calendar__navigation__label");
  readonly yearView = this.page.locator(".react-calendar__year-view");
  readonly decadeView = this.page.locator(".react-calendar__decade-view");
  readonly monthView = this.page.locator(".react-calendar__month-view");
  // Committed value + the three visible spinbutton inputs (month/day/year).
  readonly dateInput = this.page.locator("input[name=date]");
  readonly inputSegments = this.page.locator("input.react-date-picker__inputGroup__input");

  async open(): Promise<void> {
    await this.actions.goto(this.baseURL);
  }

  /**
   * Pick a date by navigating the calendar views.
   * @param month full month name, e.g. "December"
   */
  async pickDate(year: string | number, month: string, day: string | number): Promise<void> {
    await this.actions.click(this.inputGroup);
    await this.actions.click(this.navigationLabel);
    await this.actions.waitFor(this.yearView);
    await this.actions.click(this.navigationLabel);
    await this.actions.waitFor(this.decadeView);
    await this.actions.click(
      this.page.locator("button.react-calendar__tile.react-calendar__decade-view__years__year", {
        hasText: String(year),
      }),
    );
    await this.actions.waitFor(this.yearView);
    await this.actions.click(
      this.page.locator("button.react-calendar__tile.react-calendar__year-view__months__month", {
        hasText: month,
      }),
    );
    await this.actions.waitFor(this.monthView);
    await this.actions.click(
      this.page.locator("button.react-calendar__tile.react-calendar__month-view__days__day", {
        hasText: String(day),
      }),
    );
  }
}
