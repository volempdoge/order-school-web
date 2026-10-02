import { createHash } from "node:crypto";
import { get as httpsGet } from "node:https";

import { del, list, put } from "@vercel/blob";
import { imageSize } from "image-size";

import { reportError } from "@/lib/report-error";

/*
  The gallery is a Notion database (NOTION_GALLERY_DATABASE_ID), one row per event:
    • title     — the event name (any title property)
    • «Дата»    — date; the timeline is sorted by it, newest first
    • «Опис»    — text, optional
    • «Опубліковано» — checkbox; only checked rows reach the site
  The page body of a row holds its media, in order: images (uploaded or by link) and YouTube videos
  (a video, embed or bookmark block with a YouTube link). A block's caption is shown under it.
  Paragraphs become the event's text, under the description.

  Notion's file links expire after an hour, so every image is copied to Vercel Blob
  (BLOB_READ_WRITE_TOKEN) once, named after the source file — later syncs reuse the copy.
*/

const NOTION_VERSION = "2022-06-28";
const REVALIDATE = 300;
const BLOB_PREFIX = "gallery/";
const PROPERTY = { date: "Дата", description: "Опис", published: "Опубліковано" } as const;

export interface GalleryImage {
  kind: "image";
  id: string;
  src: string;
  width: number;
  height: number;
  caption: string;
  /** Served straight from Notion (no Blob store configured): next/image can't optimize it */
  external: boolean;
}

export interface GalleryVideo {
  kind: "video";
  id: string;
  youtubeId: string;
  caption: string;
}

export type GalleryMedia = GalleryImage | GalleryVideo;

export interface GalleryEvent {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  description: string;
  text: string[];
  media: GalleryMedia[];
}

export interface Gallery {
  events: GalleryEvent[];
  /** Not configured or Notion unreachable */
  unavailable: boolean;
}

// --- Notion ---------------------------------------------------------------------------------

type RichText = { plain_text: string }[];
type FileObject = { type: "file"; file: { url: string } } | { type: "external"; external: { url: string } };

type Property =
  | { type: "title"; title: RichText }
  | { type: "rich_text"; rich_text: RichText }
  | { type: "date"; date: { start: string } | null }
  | { type: string };

interface NotionPage {
  id: string;
  properties: Record<string, Property | undefined>;
}

type Block =
  | { id: string; type: "image"; image: FileObject & { caption: RichText } }
  | { id: string; type: "video"; video: FileObject & { caption: RichText } }
  | { id: string; type: "embed"; embed: { url: string; caption: RichText } }
  | { id: string; type: "bookmark"; bookmark: { url: string; caption: RichText } }
  | { id: string; type: "paragraph"; paragraph: { rich_text: RichText } }
  | { id: string; type: string };

interface Paginated<T> {
  results: T[];
  has_more: boolean;
  next_cursor: string | null;
}

async function notion<T>(path: string, init?: { method: "POST"; body: unknown }): Promise<T> {
  const response = await fetch(`https://api.notion.com/v1/${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: init ? JSON.stringify(init.body) : undefined,
    next: { revalidate: REVALIDATE },
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(`Notion API error: ${error.message || response.statusText}`);
  }
  return (await response.json()) as T;
}

async function queryAll<T>(fetchPage: (cursor?: string) => Promise<Paginated<T>>): Promise<T[]> {
  const items: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    items.push(...page.results);
    cursor = page.has_more ? (page.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return items;
}

const plain = (text: RichText | undefined) =>
  (text ?? [])
    .map((t) => t.plain_text)
    .join("")
    .trim();

function textOf(property: Property | undefined): string {
  if (property?.type === "title" && "title" in property) return plain(property.title);
  if (property?.type === "rich_text" && "rich_text" in property) return plain(property.rich_text);
  return "";
}

const fileUrl = (file: FileObject) => (file.type === "file" ? file.file.url : file.external.url);

// --- YouTube --------------------------------------------------------------------------------

/** The video id of a YouTube link (watch, youtu.be, shorts, embed, live), or null */
export function youtubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^(www\.|m\.|music\.)/, "");
  const id =
    host === "youtu.be"
      ? parsed.pathname.slice(1)
      : host === "youtube.com" || host === "youtube-nocookie.com"
        ? (parsed.searchParams.get("v") ?? parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1])
        : undefined;
  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

// --- Images: copy to Vercel Blob --------------------------------------------------------------

interface StoredImage {
  src: string;
  width: number;
  height: number;
}

// Downloads go through node:https, not fetch: an uncached fetch would make the page dynamic,
// and a cached one would put megabytes of photos into the data cache.
function download(url: string, redirects = 3): Promise<{ body: Buffer; contentType?: string }> {
  return new Promise((resolve, reject) => {
    httpsGet(url, (response) => {
      const { statusCode = 0, headers } = response;
      if (statusCode >= 300 && statusCode < 400 && headers.location && redirects > 0) {
        response.resume();
        resolve(download(new URL(headers.location, url).toString(), redirects - 1));
        return;
      }
      if (statusCode !== 200) {
        response.resume();
        reject(new Error(`Image download failed: HTTP ${statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () =>
        resolve({ body: Buffer.concat(chunks), contentType: headers["content-type"] }),
      );
      response.on("error", reject);
    }).on("error", reject);
  });
}

// Pathname: gallery/<hash of the source file>-<width>x<height>.<ext>
const STORED_NAME = /^gallery\/([0-9a-f]{20})-(\d+)x(\d+)\.\w+$/;

async function storedImages(): Promise<Map<string, StoredImage>> {
  const stored = new Map<string, StoredImage>();
  const blobs = await queryAll(async (cursor) => {
    const page = await list({ prefix: BLOB_PREFIX, cursor, limit: 1000 });
    return { results: page.blobs, has_more: page.hasMore, next_cursor: page.cursor ?? null };
  });
  for (const blob of blobs) {
    const match = STORED_NAME.exec(blob.pathname);
    if (match) stored.set(match[1]!, { src: blob.url, width: Number(match[2]), height: Number(match[3]) });
  }
  return stored;
}

// The same file keeps the same hash: Notion's links change every hour, but not their path
function sourceHash(url: string, isNotionFile: boolean): string {
  const key = isNotionFile ? new URL(url).pathname : url;
  return createHash("sha1").update(key).digest("hex").slice(0, 20);
}

async function copyImage(url: string, hash: string, useBlob: boolean): Promise<StoredImage> {
  const { body, contentType } = await download(url);
  const size = imageSize(body);
  // EXIF orientations 5–8 are rotated by 90°: browsers and next/image show them swapped
  const rotated = (size.orientation ?? 1) >= 5;
  const width = rotated ? size.height : size.width;
  const height = rotated ? size.width : size.height;
  if (!useBlob) return { src: url, width, height };

  const extension = size.type === "jpg" ? "jpg" : (size.type ?? "jpg");
  const blob = await put(`${BLOB_PREFIX}${hash}-${width}x${height}.${extension}`, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: 365 * 24 * 60 * 60,
  });
  return { src: blob.url, width, height };
}

// --- Assembly --------------------------------------------------------------------------------

async function loadEvent(page: NotionPage, images: ImageSync): Promise<GalleryEvent> {
  const title = Object.values(page.properties).find((property) => property?.type === "title");
  const date = page.properties[PROPERTY.date];
  const blocks = await queryAll((cursor) =>
    notion<Paginated<Block>>(
      `blocks/${page.id}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`,
    ),
  );

  const text: string[] = [];
  const media: (GalleryMedia | null)[] = await Promise.all(
    blocks.map(async (block): Promise<GalleryMedia | null> => {
      if (block.type === "paragraph" && "paragraph" in block) {
        const paragraph = plain(block.paragraph.rich_text);
        if (paragraph) text.push(paragraph);
        return null;
      }
      if (block.type === "image" && "image" in block) {
        const stored = await images.get(fileUrl(block.image), block.image.type === "file");
        return stored && { kind: "image", id: block.id, caption: plain(block.image.caption), ...stored };
      }
      const link =
        block.type === "video" && "video" in block
          ? { url: fileUrl(block.video), caption: block.video.caption }
          : block.type === "embed" && "embed" in block
            ? block.embed
            : block.type === "bookmark" && "bookmark" in block
              ? block.bookmark
              : null;
      if (!link) return null;
      const id = youtubeId(link.url);
      if (!id) {
        reportError(new Error(`Gallery: only YouTube videos are supported, got ${link.url}`), {
          area: "gallery",
          action: "video",
        });
        return null;
      }
      return { kind: "video", id: block.id, youtubeId: id, caption: plain(link.caption) };
    }),
  );

  return {
    id: page.id,
    title: textOf(title) || "Без назви",
    date: date?.type === "date" && "date" in date ? (date.date?.start.slice(0, 10) ?? "") : "",
    description: textOf(page.properties[PROPERTY.description]),
    text,
    media: media.filter((item) => item !== null),
  };
}

// Copies images to Blob a few at a time; failures skip the image instead of the whole gallery
class ImageSync {
  private running = 0;
  private waiting: (() => void)[] = [];
  readonly used = new Set<string>();
  failed = false;

  constructor(
    readonly stored: Map<string, StoredImage>,
    private useBlob: boolean,
  ) {}

  async get(
    url: string,
    isNotionFile: boolean,
  ): Promise<Omit<GalleryImage, "kind" | "id" | "caption"> | null> {
    const hash = sourceHash(url, isNotionFile);
    this.used.add(hash);
    const hit = this.stored.get(hash);
    if (hit) return { ...hit, external: false };

    await this.slot();
    try {
      const image = await copyImage(url, hash, this.useBlob);
      this.stored.set(hash, image);
      return { ...image, external: !this.useBlob };
    } catch (error) {
      this.failed = true;
      reportError(error, { area: "gallery", action: "copy-image" });
      return null;
    } finally {
      this.release();
    }
  }

  private async slot() {
    if (this.running < 4) {
      this.running++;
      return;
    }
    await new Promise<void>((resolve) => this.waiting.push(resolve));
  }

  private release() {
    const next = this.waiting.shift();
    if (next) next();
    else this.running--;
  }
}

// Never throws: the page must render (and build) without Notion or Blob
export async function getGallery(): Promise<Gallery> {
  const databaseId = process.env.NOTION_GALLERY_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) return { events: [], unavailable: true };

  try {
    const pages = await queryAll((cursor) =>
      notion<Paginated<NotionPage>>(`databases/${databaseId}/query`, {
        method: "POST",
        body: {
          filter: { property: PROPERTY.published, checkbox: { equals: true } },
          sorts: [{ property: PROPERTY.date, direction: "descending" }],
          start_cursor: cursor,
          page_size: 100,
        },
      }),
    );

    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const images = new ImageSync(useBlob ? await storedImages() : new Map(), useBlob);

    // One event at a time keeps within Notion's rate limit (≈3 requests a second)
    const events: GalleryEvent[] = [];
    for (const page of pages) events.push(await loadEvent(page, images));

    // Copies of images that were removed from Notion. Only after a sync without errors,
    // so a temporary failure never deletes anything that's still in use.
    if (useBlob && !images.failed) {
      const unused = [...images.stored.entries()].filter(([hash]) => !images.used.has(hash));
      if (unused.length) await del(unused.map(([, image]) => image.src));
    }

    return { events, unavailable: false };
  } catch (error) {
    reportError(error, { area: "gallery", action: "load" });
    return { events: [], unavailable: true };
  }
}
