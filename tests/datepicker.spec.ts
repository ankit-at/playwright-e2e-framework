import { test, expect } from "../fixtures/practice.fixtures";
import testData from "../config/testData";
import authState from "../auth.json";

const { date } = testData.datepicker;

test.describe("Date Picker", () => {
  test.beforeEach(async ({ context, datePickerPage }) => {
    await context.addCookies(authState.cookies);
    await datePickerPage.open();
  });

  test("Select the date", async ({ datePickerPage }) => {
    const monthMap: Record<string, string> = {
      January: "1",
      February: "2",
      March: "3",
      April: "4",
      May: "5",
      June: "6",
      July: "7",
      August: "8",
      September: "9",
      October: "10",
      November: "11",
      December: "12",
    };

    const expectedSegments = [monthMap[date.month], String(date.day).padStart(2, "0"), date.year];

    await datePickerPage.pickDate(date.year, date.month, date.day);

    // react-date-picker commits the picked date asynchronously; the hidden input and
    // the visible spinbuttons settle a frame or two after the day click. Auto-retrying
    // assertions wait for that state to land instead of racing it.
    const expectedDate = `${date.year}-${monthMap[date.month].padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
    await expect(datePickerPage.dateInput).toHaveValue(expectedDate);

    for (let i = 0; i < expectedSegments.length; ++i) {
      await expect(datePickerPage.inputSegments.nth(i)).toHaveValue(expectedSegments[i]);
    }
  });
});
