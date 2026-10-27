import { faq as fallbackFaq } from "@/content/site";
import { type FaqItem, getFaqItems } from "@/lib/notion";
import { reportError } from "@/lib/report-error";

export type { FaqItem };

// Never throws: falls back to the questions in site.ts when the table is not set, empty or unreachable
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
