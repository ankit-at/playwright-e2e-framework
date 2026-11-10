import type { Page } from "@playwright/test";
import { wait } from "../../tests/helper";

/**
 * QA-Sentinel live test: a page object that breaks the approved structure skill
 * on purpose (expected: R8 import from tests/, R10 doesn't extend EventHubPage,
 * R12 hard-coded URL). Throwaway; do not merge.
 */
export class PromoPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto("https://eventhub.example.com/promo");
    await wait(500);
  }
}
