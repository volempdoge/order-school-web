import { describe, expect, it } from "vitest";

import { site, SITE_URL } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

import robots from "./robots";
import sitemap from "./sitemap";

describe("robots.txt", () => {
  it("allows crawling and points to the sitemap", () => {
    const result = robots();
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(result.rules).toEqual([expect.objectContaining({ userAgent: "*", allow: "/" })]);
  });
});

describe("sitemap.xml", () => {
  it("lists every public page with absolute URLs", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([
      `${SITE_URL}/`,
      `${SITE_URL}/onboarding`,
      `${SITE_URL}/gallery`,
      `${SITE_URL}/privacy`,
    ]);
  });
});

describe("pageMetadata", () => {
  it("sets canonical, Open Graph and Twitter for a page", () => {
    const meta = pageMetadata({ title: "Сторінка", description: "Опис", path: "/page" });
    expect(meta.alternates?.canonical).toBe("/page");
    expect(meta.openGraph).toMatchObject({ url: "/page", title: expect.stringContaining("Сторінка") });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", description: "Опис" });
  });
});

describe("search snippet", () => {
  it("keeps the title and description within what Google shows", () => {
    expect(site.title.length).toBeLessThanOrEqual(60);
    expect(site.description.length).toBeGreaterThanOrEqual(70);
    expect(site.description.length).toBeLessThanOrEqual(160);
  });
});
