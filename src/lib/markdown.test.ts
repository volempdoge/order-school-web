import { describe, expect, it } from "vitest";

import { faq, SITE_URL, teachers } from "@/content/site";

import { homeMarkdown, llmsTxt } from "./markdown";
import { buildTimeline } from "./modules";

describe("llms.txt", () => {
  const text = llmsTxt();

  it("follows the llmstxt.org structure", () => {
    expect(text).toMatch(/^# .+\n\n> .+/);
    expect(text).toContain("## Optional");
  });

  it("links to the markdown version and the registration form", () => {
    expect(text).toContain(`${SITE_URL}/index.md`);
    expect(text).toContain(`${SITE_URL}/onboarding`);
  });
});

describe("index.md", () => {
  it("contains every FAQ answer and teacher", () => {
    const md = homeMarkdown([]);
    for (const item of faq) {
      expect(md).toContain(item.q);
      expect(md).toContain(item.a);
    }
    for (const teacher of teachers) expect(md).toContain(teacher.name);
  });

  it("lists modules with dates and statuses", () => {
    const modules = buildTimeline(
      [
        {
          id: "a",
          moduleId: 1,
          title: "Вступ",
          description: "Опис",
          startDate: "2026-10-01",
          endDate: "2026-10-14",
        },
      ],
      new Date("2026-10-05T12:00:00Z"),
    );
    const md = homeMarkdown(modules);
    expect(md).toContain("**Модуль 1: Вступ** (01.10–14.10) — триває");
    expect(md).toContain("Опис");
  });

  it("falls back to a placeholder when Notion is unavailable", () => {
    expect(homeMarkdown([])).toContain("Розклад модулів уточнюється.");
  });
});
