const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const NOTION_VERSION = "2022-06-28";

export interface Module {
  id: string;
  moduleId: number | null;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

// The subset of the Notion API property shapes this site reads
type RichText = { plain_text: string }[];
type NotionProperty =
  | { type: "title"; title: RichText }
  | { type: "rich_text"; rich_text: RichText }
  | { type: "date"; date: { start: string; end: string | null } | null }
  | { type: "select"; select: { name: string } | null }
  | { type: "status"; status: { name: string } | null }
  | { type: "number"; number: number | null }
  | { type: "unique_id"; unique_id: { number: number | null } }
  | { type: string };

interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty | undefined>;
}

function getText(property: NotionProperty | undefined): string {
  if (!property) return "";
  if (property.type === "title" && "title" in property)
    return property.title.map((t) => t.plain_text).join("");
  if (property.type === "rich_text" && "rich_text" in property)
    return property.rich_text.map((t) => t.plain_text).join("");
  if (property.type === "select" && "select" in property) return property.select?.name ?? "";
  if (property.type === "status" && "status" in property) return property.status?.name ?? "";
  return "";
}

function getDateStart(property: NotionProperty | undefined): string {
  return property?.type === "date" && "date" in property ? (property.date?.start ?? "") : "";
}

// "Module ID" is a Number column filled in by hand, or Notion's auto ID
function getNumber(property: NotionProperty | undefined): number | null {
  if (property?.type === "number" && "number" in property) return property.number;
  if (property?.type === "unique_id" && "unique_id" in property) return property.unique_id.number;
  return null;
}

async function queryDatabase(databaseId: string, body: unknown): Promise<NotionPage[]> {
  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Notion API error: ${error.message || response.statusText}`);
  }

  return ((await response.json()) as { results: NotionPage[] }).results;
}

export async function getModules(): Promise<Module[]> {
  try {
    const pages = await queryDatabase(NOTION_DATABASE_ID, {
      sorts: [{ property: "Start Date", direction: "ascending" }],
    });

    const modules: Module[] = pages
      .map(({ id, properties }) => ({
        id,
        moduleId: getNumber(properties["Module ID"]),
        title: getText(properties["Title"]),
        startDate: getDateStart(properties["Start Date"]),
        endDate: getDateStart(properties["End Date"]),
        // Handle "Description " with trailing space as seen in Notion API response
        description: getText(properties["Description"] ?? properties["Description "]),
        status: getText(properties["Status"]),
      }))
      // Filter out modules that are explicitly marked as "Draft"
      .filter((module) => module.status !== "Draft")
      .map(({ status: _status, ...module }) => module);

    return modules;
  } catch (error) {
    console.error("Error fetching from Notion:", error);
    throw error;
  }
}

export interface FaqItem {
  q: string;
  a: string;
}

// FAQ table: «Question» (title) and «Answer»; shown in the order the rows were created
export async function getFaqItems(databaseId: string): Promise<FaqItem[]> {
  const pages = await queryDatabase(databaseId, {
    sorts: [{ timestamp: "created_time", direction: "ascending" }],
  });
  return pages
    .map(({ properties }) => ({
      q: getText(properties["Question"]).trim(),
      a: getText(properties["Answer"]).trim(),
    }))
    .filter((item) => item.q && item.a);
}
