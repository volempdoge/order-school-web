import { expect, test } from "./fixtures";

test.describe("mobile menu", () => {
  test.skip(({ isMobile }) => !isMobile, "The burger menu exists only on small screens");

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("opens as a modal dialog and locks the page scroll", async ({ page }) => {
    await page.getByRole("button", { name: "Відкрити меню" }).click();

    const dialog = page.getByRole("dialog", { name: "Меню" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Закрити меню" })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("hidden");
  });

  test("closes on Escape and returns focus to the menu button", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Відкрити меню" });
    await toggle.click();
    await page.keyboard.press("Escape");

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("keeps Tab inside the menu", async ({ page }) => {
    await page.getByRole("button", { name: "Відкрити меню" }).click();
    const dialog = page.getByRole("dialog", { name: "Меню" });

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Shift+Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
  });

  test("a section link closes the menu and scrolls to the section", async ({ page }) => {
    await page.getByRole("button", { name: "Відкрити меню" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Викладачі" }).click();

    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page).toHaveURL(/#teachers$/);
    await expect(page.locator("#teachers")).toBeInViewport();
  });
});

test("section links from another page lead to the home page section", async ({ page, isMobile }) => {
  await page.goto("/privacy");
  if (isMobile) {
    await page.getByRole("button", { name: "Відкрити меню" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Структура курсу" }).click();
  } else {
    await page.getByRole("banner").getByRole("link", { name: "Структура курсу" }).click();
  }
  await expect(page).toHaveURL(/\/#structure$/);
  await expect(page.locator("#structure")).toBeInViewport();
});
