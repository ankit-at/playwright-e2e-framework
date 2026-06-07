// @ts-check
const { BasePage } = require("../base.page");
const testData = require("../../config/testData");

/**
 * DatePickerPage — the react-date-picker widget on the seleniumPractise offers
 * page. `pickDate` climbs the calendar views (days → months → years) and waits
 * for each destination view to render before the next click, so a click never
 * races a mid-flight React transition.
 */
class DatePickerPage extends BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.baseURL = testData.datepicker.baseURL;
    this.inputGroup = page.locator("div.react-date-picker__inputGroup");
    this.navigationLabel = page.locator("button.react-calendar__navigation__label");
    this.yearView = page.locator(".react-calendar__year-view");
    this.decadeView = page.locator(".react-calendar__decade-view");
    this.monthView = page.locator(".react-calendar__month-view");
    // Committed value + the three visible spinbutton inputs (month/day/year).
    this.dateInput = page.locator("input[name=date]");
    this.inputSegments = page.locator("input.react-date-picker__inputGroup__input");
  }

  async open() {
    await this.page.goto(this.baseURL);
  }

  /**
   * Pick a date by navigating the calendar views.
   * @param {string|number} year  e.g. 2026
   * @param {string} month        full month name, e.g. "December"
   * @param {string|number} day   e.g. 25
   */
  async pickDate(year, month, day) {
    await this.inputGroup.click();
    await this.navigationLabel.click();
    await this.yearView.waitFor();
    await this.navigationLabel.click();
    await this.decadeView.waitFor();
    await this.page
      .locator("button.react-calendar__tile.react-calendar__decade-view__years__year", {
        hasText: String(year),
      })
      .click();
    await this.yearView.waitFor();
    await this.page
      .locator("button.react-calendar__tile.react-calendar__year-view__months__month", {
        hasText: month,
      })
      .click();
    await this.monthView.waitFor();
    await this.page
      .locator("button.react-calendar__tile.react-calendar__month-view__days__day", {
        hasText: String(day),
      })
      .click();
  }
}

module.exports = { DatePickerPage };
