import { expect, test } from "./fixtures";

test("home page renders its content on the server", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("Відповіді на поширені запитання");
  // FAQ answers and course topics are text in the HTML, not behind JS or inside images
  expect(html).toContain("Одне заняття триває 2 години");
  expect(html).toContain("Як працює теорія ігор у політиці");
});

test("course topics are readable text on every screen size", async ({ page }) => {
  await page.goto("/");
  await page.locator("#knowledge").scrollIntoViewIfNeeded();
  const topic = page.locator("#knowledge li").filter({ hasText: "Етичні основи політики", visible: true });
  await expect(topic).toHaveCount(1);
  await expect(topic).toBeVisible();
});

test("unknown pages get the 404 page", async ({ page }) => {
  const response = await page.goto("/ne-isnuye");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Сторінку не знайдено" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "На головну", exact: true })).toHaveAttribute(
    "href",
    "/",
  );
  const robots = await page
    .locator('meta[name="robots"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("content")));
  expect(robots.length).toBeGreaterThan(0);
  for (const value of robots) expect(value).toMatch(/noindex/);
});

test("without a schedule the site invites to pre-register for upcoming courses", async ({ page }) => {
  // E2E runs without Notion credentials, so there is no schedule
  test.skip(Boolean(process.env.NOTION_API_KEY), "Notion is configured");
  await page.goto("/#timeline");
  const timeline = page.locator("#timeline");
  await expect(timeline.getByText("Нові річні курси в розробці")).toBeVisible();
  await timeline.getByRole("link", { name: "Хочу на майбутній курс" }).click();

  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByText("Це попередній запис")).toBeVisible();
});

test("the gallery page renders, with a placeholder while it has no content", async ({ page }) => {
  test.skip(Boolean(process.env.NOTION_GALLERY_DATABASE_ID), "The gallery is configured");
  await page.goto("/gallery");
  await expect(page.getByRole("heading", { level: 1, name: "Галерея" })).toBeVisible();
  await expect(page.getByText("Скоро тут зʼявляться фото й відео")).toBeVisible();
});
