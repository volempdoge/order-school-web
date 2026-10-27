import { createHash } from "node:crypto";
import { get as httpsGet, request as httpsRequest } from "node:https";

import { del, list, put } from "@vercel/blob";
import { imageSize } from "image-size";
import sharp from "sharp";

import { reportError } from "@/lib/report-error";

// The gallery from the Notion table «Спогади»: structure in README («Галерея»), Blob copies and
// limits in docs/architecture.md

const NOTION_VERSION = "2022-06-28";
// Keep in sync with `revalidate` in app/gallery/page.tsx
const REVALIDATE = 3600;
const BLOB_PREFIX = "gallery/";
const PROPERTY = {
  date: "Date",
  description: "Additional description",
  files: "Media file",
  video: "URL (video)",
  parent: "Parent item",
  children: "Sub-item",
  published: "Published",
} as const;

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
  /** The largest thumbnail YouTube has for it */
  thumbnail: string;
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

type RichText = { plain_text: string }[];
type FileObject = { type: "file"; file: { url: string } } | { type: "external"; external: { url: string } };

type Property =
  | { type: "title"; title: RichText }
  | { type: "rich_text"; rich_text: RichText }
  | { type: "date"; date: { start: string } | null }
  | { type: "files"; files: (FileObject & { name: string })[] }
  | { type: "url"; url: string | null }
  | { type: "relation"; relation: { id: string }[] }
  | { type: "checkbox"; checkbox: boolean }
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

const titleOf = (page: NotionPage) =>
  textOf(Object.values(page.properties).find((property) => property?.type === "title"));

function dateOf(page: NotionPage): string {
  const date = page.properties[PROPERTY.date];
  return date?.type === "date" && "date" in date ? (date.date?.start.slice(0, 10) ?? "") : "";
}

function filesOf(page: NotionPage): (FileObject & { name: string })[] {
  const files = page.properties[PROPERTY.files];
  return files?.type === "files" && "files" in files ? files.files : [];
}

function urlOf(page: NotionPage): string {
  const url = page.properties[PROPERTY.video];
  return url?.type === "url" && "url" in url ? (url.url ?? "").trim() : "";
}

function relationOf(page: NotionPage, name: string): string[] {
  const relation = page.properties[name];
  return relation?.type === "relation" && "relation" in relation ? relation.relation.map((r) => r.id) : [];
}

// No «Published» column: every event is shown
function isPublished(page: NotionPage): boolean {
  const published = page.properties[PROPERTY.published];
  return published?.type === "checkbox" && "checkbox" in published ? published.checkbox : true;
}

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

interface StoredImage {
  src: string;
  width: number;
  height: number;
}

// Downloads go through node:https, not fetch: an uncached fetch would make the page dynamic,
// and a cached one would put megabytes of photos into the data cache.
function download(url: string, redirects = 3): Promise<Buffer> {
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
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
}

function exists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    httpsRequest(url, { method: "HEAD", timeout: 5000 }, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    })
      .on("timeout", function (this: { destroy(): void }) {
        this.destroy();
      })
      .on("error", () => resolve(false))
      .end();
  });
}

// Largest first: 1280×720 and 640×480 exist only for some videos (404 otherwise), 480×360 for all
const YOUTUBE_THUMBNAILS = ["maxresdefault", "sddefault", "hqdefault"] as const;

export async function youtubeThumbnail(
  id: string,
  check: (url: string) => Promise<boolean> = exists,
): Promise<string> {
  const urls = YOUTUBE_THUMBNAILS.map((name) => `https://i.ytimg.com/vi/${id}/${name}.jpg`);
  for (const url of urls.slice(0, -1)) if (await check(url)) return url;
  return urls.at(-1)!;
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

// Long side of the copy kept in Blob; the site never shows a photo wider than 1920px
const MAX_SIDE = 2560;
// Part of every copy's name: change it and the next sync replaces all copies
const COPY_VERSION = `${MAX_SIDE}-webp`;

// The same file keeps the same hash: Notion's links change every hour, but not their path
function sourceHash(url: string, isNotionFile: boolean): string {
  const key = isNotionFile ? new URL(url).pathname : url;
  return createHash("sha1").update(`${COPY_VERSION}:${key}`).digest("hex").slice(0, 20);
}

export async function shrink(body: Buffer): Promise<{ body: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(body)
    .rotate() // EXIF orientation, so width and height match the photo as shown
    .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return { body: data, width: info.width, height: info.height };
}

async function copyImage(url: string, hash: string, useBlob: boolean): Promise<StoredImage> {
  const body = await download(url);

  if (!useBlob) {
    const size = imageSize(body);
    // EXIF orientations 5–8 are rotated by 90°: browsers and next/image show them swapped
    const rotated = (size.orientation ?? 1) >= 5;
    return {
      src: url,
      width: rotated ? size.height : size.width,
      height: rotated ? size.width : size.height,
    };
  }

  const copy = await shrink(body);
  const blob = await put(`${BLOB_PREFIX}${hash}-${copy.width}x${copy.height}.webp`, copy.body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "image/webp",
    cacheControlMaxAge: 365 * 24 * 60 * 60,
  });
  return { src: blob.url, width: copy.width, height: copy.height };
}

const VIDEO_FILE = /\.(mp4|mov|m4v|webm|avi|mkv)$/i;

async function videoFrom(url: string, id: string, caption: string): Promise<GalleryVideo | null> {
  const youtube = youtubeId(url);
  if (!youtube) {
    reportError(new Error(`Gallery: only YouTube videos are supported, got ${url}`), {
      area: "gallery",
      action: "video",
    });
    return null;
  }
  return { kind: "video", id, youtubeId: youtube, thumbnail: await youtubeThumbnail(youtube), caption };
}

async function propertyMedia(page: NotionPage, caption: string, images: ImageSync): Promise<GalleryMedia[]> {
  const photos = await Promise.all(
    filesOf(page).map(async (file, index): Promise<GalleryMedia | null> => {
      if (VIDEO_FILE.test(file.name)) {
        reportError(new Error(`Gallery: video files are not supported, add a YouTube link: ${file.name}`), {
          area: "gallery",
          action: "video",
        });
        return null;
      }
      const stored = await images.get(fileUrl(file), file.type === "file");
      return stored && { kind: "image", id: `${page.id}-${index}`, caption, ...stored };
    }),
  );
  const url = urlOf(page);
  const video = url ? await videoFrom(url, `${page.id}-video`, caption) : null;
  return [...photos, video].filter((item) => item !== null);
}

async function bodyContent(
  page: NotionPage,
  images: ImageSync,
): Promise<{ text: string[]; media: GalleryMedia[] }> {
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
      return link && (await videoFrom(link.url, block.id, plain(link.caption)));
    }),
  );

  return { text, media: media.filter((item) => item !== null) };
}

async function loadEvent(page: NotionPage, children: NotionPage[], images: ImageSync): Promise<GalleryEvent> {
  const description = textOf(page.properties[PROPERTY.description]);
  const [own, body, ...childMedia] = await Promise.all([
    propertyMedia(page, "", images),
    bodyContent(page, images),
    ...children.map((child) =>
      propertyMedia(child, textOf(child.properties[PROPERTY.description]) || titleOf(child), images),
    ),
  ]);

  return {
    id: page.id,
    title: titleOf(page) || "Без назви",
    date: dateOf(page),
    description,
    text: body.text,
    media: [...own, ...body.media, ...childMedia.flat()],
  };
}

// Sub-items keep the event's «Sub-item» order; Notion lists only the first 25 there, the rest follow
// in creation order
export function groupEvents(pages: NotionPage[]): { event: NotionPage; children: NotionPage[] }[] {
  const childrenOf = new Map<string, NotionPage[]>();
  const events: NotionPage[] = [];
  for (const page of pages) {
    const parent = relationOf(page, PROPERTY.parent)[0];
    if (parent) childrenOf.set(parent, [...(childrenOf.get(parent) ?? []), page]);
    else events.push(page);
  }

  return events.filter(isPublished).map((event) => {
    const listed = relationOf(event, PROPERTY.children);
    const position = (page: NotionPage) => {
      const index = listed.indexOf(page.id);
      return index === -1 ? listed.length : index;
    };
    const children = [...(childrenOf.get(event.id) ?? [])].sort((a, b) => position(a) - position(b));
    return { event, children };
  });
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
          // Newest first, undated last; sub-items (usually undated) keep their creation order
          sorts: [
            { property: PROPERTY.date, direction: "descending" },
            { timestamp: "created_time", direction: "ascending" },
          ],
          start_cursor: cursor,
          page_size: 100,
        },
      }),
    );

    const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
    const images = new ImageSync(useBlob ? await storedImages() : new Map(), useBlob);

    // One event at a time keeps within Notion's rate limit (≈3 requests a second)
    const events: GalleryEvent[] = [];
    for (const { event, children } of groupEvents(pages))
      events.push(await loadEvent(event, children, images));

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
