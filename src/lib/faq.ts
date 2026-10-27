import { faq as fallbackFaq } from "@/content/site";
import { type FaqItem, getFaqItems } from "@/lib/notion";
import { reportError } from "@/lib/report-error";

export type { FaqItem };

// Never throws: without NOTION_FAQ_DATABASE_ID, or when Notion fails or the table is empty, the questions
// in site.ts are shown, so the section and its JSON-LD are never empty
export async function getFaq(): Promise<readonly FaqItem[]> {
  const databaseId = process.env.NOTION_FAQ_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) return fallbackFaq;

  try {
    const items = await getFaqItems(databaseId);
    return items.length ? items : fallbackFaq;
  } catch (error) {
    reportError(error, { area: "notion", action: "load-faq" });
    return fallbackFaq;
  }
}
