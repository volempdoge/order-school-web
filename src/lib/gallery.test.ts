import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { groupEvents, shrink, youtubeId, youtubeThumbnail } from "./gallery";

describe("youtubeId", () => {
  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ?si=abc",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    "https://www.youtube.com/live/dQw4w9WgXcQ",
  ])("reads the id from %s", (url) => {
    expect(youtubeId(url)).toBe("dQw4w9WgXcQ");
  });

  it.each([
    "https://vimeo.com/123456",
    "https://www.youtube.com/@channel",
    "not a url",
    "https://youtu.be/short",
  ])("rejects %s", (url) => {
    expect(youtubeId(url)).toBeNull();
  });
});

describe("groupEvents", () => {
  const row = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    properties: { Entry: { type: "title", title: [{ plain_text: id }] }, ...extra },
  });
  const relation = (...ids: string[]) => ({ type: "relation", relation: ids.map((id) => ({ id })) });
  const parent = (id: string) => ({ "Parent item": relation(id) });

  it("makes rows without a parent events and puts sub-items in their «Sub-item» order", () => {
    const groups = groupEvents([
      row("school", { "Sub-item": relation("b", "a") }),
      row("a", parent("school")),
      row("hike"),
      row("c", parent("school")),
      row("b", parent("school")),
    ]);
    expect(groups.map(({ event, children }) => [event.id, children.map((c) => c.id)])).toEqual([
      ["school", ["b", "a", "c"]],
      ["hike", []],
    ]);
  });

  it("shows every event while there is no «Published» column", () => {
    expect(groupEvents([row("a"), row("b")])).toHaveLength(2);
  });

  it("hides events that are not checked as «Published»", () => {
    const published = (checkbox: boolean) => ({ Published: { type: "checkbox", checkbox } });
    const groups = groupEvents([row("a", published(true)), row("b", published(false))]);
    expect(groups.map(({ event }) => event.id)).toEqual(["a"]);
  });
});

describe("shrink", () => {
  const photo = (width: number, height: number) =>
    sharp({ create: { width, height, channels: 3, background: "#d63c3c" } }).jpeg();

  it("caps the long side at 2560px, keeping the proportions, as WebP", async () => {
    const copy = await shrink(await photo(4000, 6000).toBuffer());
    expect([copy.width, copy.height]).toEqual([1707, 2560]);
    expect((await sharp(copy.body).metadata()).format).toBe("webp");
  });

  it("never enlarges a small photo", async () => {
    const copy = await shrink(await photo(800, 600).toBuffer());
    expect([copy.width, copy.height]).toEqual([800, 600]);
  });

  it("applies the EXIF rotation, so a portrait shot taken sideways stays portrait", async () => {
    const copy = await shrink(await photo(600, 400).withMetadata({ orientation: 6 }).toBuffer());
    expect([copy.width, copy.height]).toEqual([400, 600]);
  });
});

describe("youtubeThumbnail", () => {
  const available =
    (...names: string[]) =>
    async (url: string) =>
      names.some((name) => url.endsWith(`/${name}.jpg`));

  it("takes the 1280×720 thumbnail when the video has one", async () => {
    expect(await youtubeThumbnail("dhy2WOy60kw", available("maxresdefault", "sddefault"))).toBe(
      "https://i.ytimg.com/vi/dhy2WOy60kw/maxresdefault.jpg",
    );
  });

  it("falls back to 640×480, then to 480×360, which every video has", async () => {
    expect(await youtubeThumbnail("x", available("sddefault"))).toMatch(/\/sddefault\.jpg$/);
    expect(await youtubeThumbnail("x", available())).toMatch(/\/hqdefault\.jpg$/);
  });
});
