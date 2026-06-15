//
// Practice-app fixtures — the standalone RSA practice pages (AutomationPractice
// kitchen-sink, react-date-picker, Angular form, upload/download). Each is lazily
// built, so a spec only pays for the page object it actually declares.
//
import { test as base, expect } from "@playwright/test";
import { AutomationPracticePage } from "../pages/automationPractice";
import { DatePickerPage } from "../pages/datepicker";
import { AngularFormPage } from "../pages/angularPractice";
import { UploadDownloadPage } from "../pages/uploadDownload";

type PracticeFixtures = {
  automationPracticePage: AutomationPracticePage;
  datePickerPage: DatePickerPage;
  angularFormPage: AngularFormPage;
  uploadDownloadPage: UploadDownloadPage;
};

export const test = base.extend<PracticeFixtures>({
  automationPracticePage: async ({ page }, use) => {
    await use(new AutomationPracticePage(page));
  },
  datePickerPage: async ({ page }, use) => {
    await use(new DatePickerPage(page));
  },
  angularFormPage: async ({ page }, use) => {
    await use(new AngularFormPage(page));
  },
  uploadDownloadPage: async ({ page }, use) => {
    await use(new UploadDownloadPage(page));
  },
});

export { expect };
