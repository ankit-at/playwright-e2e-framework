// @ts-check
const { BasePage } = require("../base.page");
const testData = require("../../config/testData");

/**
 * UploadDownloadPage — the upload/download practice page: download an Excel file,
 * re-upload an edited copy, and read back the rendered table.
 */
class UploadDownloadPage extends BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.baseURL = testData.uploadDownload.baseURL;
    this.downloadButton = page.getByRole("button", { name: "Download" });
    this.fileInput = page.locator("#fileinput");
  }

  async open() {
    await this.page.goto(this.baseURL);
  }

  /**
   * Click Download and return the captured Download (listener armed first).
   * @returns {Promise<import("@playwright/test").Download>}
   */
  async download() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.downloadButton.click();
    return downloadPromise;
  }

  /** Upload a file through the file input. @param {string} filePath */
  async upload(filePath) {
    await this.fileInput.setInputFiles(filePath);
  }

  /**
   * The rendered table row containing `text`.
   * @param {string} text
   * @returns {import("@playwright/test").Locator}
   */
  rowContaining(text) {
    return this.page.getByRole("row").filter({ has: this.page.getByText(text) });
  }
}

module.exports = { UploadDownloadPage };
