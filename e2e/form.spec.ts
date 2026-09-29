import type { Page } from "@playwright/test";

import { expect, pickOption, test } from "./fixtures";

test.describe("registration form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/onboarding");
  });

  test("shows every validation error and sends nothing when empty", async ({ page, submissions }) => {
    await page.getByRole("button", { name: "Надіслати форму" }).click();

    await expect(page.getByText("Електронна пошта є обовʼязковою")).toBeVisible();
    await expect(page.getByText("Оберіть, хто ви")).toBeVisible();
    await expect(page.getByText("Без згоди на обробку персональних даних")).toBeVisible();
    expect(submissions).toHaveLength(0);
  });

  test("asks a student for the guardian's consent, but not a parent", async ({ page }) => {
    const guardian = page.getByLabel(/Мої батьки або інші законні представники/);

    await page.getByRole("radio", { name: "Школяр" }).click();
    await expect(guardian).toBeVisible();

    await page.getByRole("radio", { name: "Батько/Мати" }).click();
    await expect(guardian).toBeHidden();
    await expect(page.getByLabel(/Я є батьком\/матірʼю/)).toBeVisible();
  });

  test("a student can't submit without the guardian's consent", async ({ page, submissions }) => {
    await fillForm(page, "student");
    await page.getByLabel(/Я даю згоду на обробку/).check();
    await page.getByRole("button", { name: "Надіслати форму" }).click();

    await expect(page.getByText("Для неповнолітніх учасників потрібна згода батьків")).toBeVisible();
    expect(submissions).toHaveLength(0);
  });

  test("submits a complete application with the consent record", async ({ page, submissions }) => {
    await fillForm(page, "student");
    await page.getByLabel(/Я даю згоду на обробку/).check();
    await page.getByLabel(/Мої батьки або інші законні представники/).check();
    await page.getByRole("button", { name: "Надіслати форму" }).click();

    await expect(page.getByRole("dialog", { name: "Форму успішно надіслано!" })).toBeVisible();
    expect(submissions).toHaveLength(1);
    expect(submissions[0]).toMatchObject({
      email: "test@example.com",
      role: "student",
      grade: "10",
      module: "Весь курс",
      telegram: "@test_user",
      consent: true,
      guardianConsent: true,
      privacyPolicyVersion: expect.any(String),
      consentAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
  });

  test("a parent's application records no guardian flag", async ({ page, submissions }) => {
    await fillForm(page, "parent");
    await page.getByLabel(/Я є батьком\/матірʼю/).check();
    await page.getByRole("button", { name: "Надіслати форму" }).click();

    await expect(page.getByRole("dialog")).toBeVisible();
    expect(submissions[0]).toMatchObject({ role: "parent", consent: true, guardianConsent: null });
  });
});

async function fillForm(page: Page, role: "student" | "parent") {
  await page.getByLabel("Електронна пошта").fill("test@example.com");
  await page.getByRole("radio", { name: role === "student" ? "Школяр" : "Батько/Мати" }).click();
  await page.getByLabel("Ваше прізвище та імʼя").fill("Тестенко Тест");
  await page.getByLabel(/Школа, у якій навчається/).fill("Ліцей № 1");
  await pickOption(page, "Клас", "10");
  await pickOption(page, "Який модуль вас цікавить?", "Весь курс");
  await page.getByLabel("Telegram для звʼязку з вами").fill("@test_user");
  await page.getByLabel("Ваш номер телефону").fill("+380 00 000 00 00");
  await page.getByLabel("Як ви дізналися про курс?").fill("Instagram");
}
