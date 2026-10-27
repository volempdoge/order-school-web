import { afterEach, describe, expect, it, vi } from "vitest";

import { faq } from "@/content/site";

import { getFaq } from "./faq";

describe("getFaq", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("uses the questions from site.ts while the Notion table is not configured", async () => {
    vi.stubEnv("NOTION_FAQ_DATABASE_ID", "");
    expect(await getFaq()).toBe(faq);
  });

  it("falls back to site.ts when Notion fails", async () => {
    vi.stubEnv("NOTION_FAQ_DATABASE_ID", "db");
    vi.stubEnv("NOTION_API_KEY", "key");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await getFaq()).toBe(faq);
  });

  it("reads questions and answers from Notion, skipping incomplete rows", async () => {
    vi.stubEnv("NOTION_FAQ_DATABASE_ID", "db");
    vi.stubEnv("NOTION_API_KEY", "key");
    const text = (value: string) => [{ plain_text: value }];
    const row = (q: string, a: string) => ({
      id: q,
      properties: {
        Question: { type: "title", title: text(q) },
        Answer: { type: "rich_text", rich_text: text(a) },
      },
    });
    const results = [row("Хто може взяти участь?", "Учні 8–11 класів."), row("Без відповіді", "")];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ results })));
    expect(await getFaq()).toEqual([{ q: "Хто може взяти участь?", a: "Учні 8–11 класів." }]);
  });
});
