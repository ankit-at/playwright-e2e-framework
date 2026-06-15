import type { Download, Locator } from "@playwright/test";
import { BasePage } from "../base.page";
import testData from "../../config/testData";

/**
 * UploadDownloadPage — the upload/download practice page: download an Excel file,
 * re-upload an edited copy, and read back the rendered table.
 */
export class UploadDownloadPage extends BasePage {
  readonly baseURL = testData.uploadDownload.baseURL;
  readonly downloadButton = this.page.getByRole("button", { name: "Download" });
  readonly fileInput = this.page.locator("#fileinput");

  async open(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  /** Click Download and return the captured Download (listener armed first). */
  async download(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download");
    await this.downloadButton.click();
    return downloadPromise;
  }

  /** Upload a file through the file input. */
  async upload(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  /** The rendered table row containing `text`. */
  rowContaining(text: string): Locator {
    return this.page.getByRole("row").filter({ has: this.page.getByText(text) });
  }
}
