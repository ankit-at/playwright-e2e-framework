// @ts-check
//
// Practice-app fixtures — the standalone RSA practice pages (AutomationPractice
// kitchen-sink, react-date-picker, Angular form, upload/download). Each is lazily
// built, so a spec only pays for the page object it actually declares.
//
const base = require("@playwright/test");
const { AutomationPracticePage } = require("../pages/automationPractice");
const { DatePickerPage } = require("../pages/datepicker");
const { AngularFormPage } = require("../pages/angularPractice");
const { UploadDownloadPage } = require("../pages/uploadDownload");

/**
 * @typedef {Object} PracticeFixtures
 * @property {AutomationPracticePage} automationPracticePage
 * @property {DatePickerPage} datePickerPage
 * @property {AngularFormPage} angularFormPage
 * @property {UploadDownloadPage} uploadDownloadPage
 */

const test = base.test.extend(
  /** @type {import("@playwright/test").Fixtures<PracticeFixtures, {}, import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions>} */ ({
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
  }),
);

module.exports = { test, expect: base.expect };
