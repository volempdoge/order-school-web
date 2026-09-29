import { expect, type Page, test as base } from "@playwright/test";

const FORM_ENDPOINT = /script\.google\.com\/macros\//;

// Every test runs with the Google Apps Script endpoint mocked: nothing reaches the real sheet.
export const test = base.extend<{ submissions: unknown[] }>({
  submissions: async ({ page }, use) => {
    const submissions: unknown[] = [];
    await page.route(FORM_ENDPOINT, async (route) => {
      submissions.push(JSON.parse(route.request().postData() ?? "null"));
      await route.fulfill({ status: 200, body: "" });
    });
    await use(submissions);
  },
});

export { expect };

export async function pickOption(page: Page, label: string, option: string) {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
