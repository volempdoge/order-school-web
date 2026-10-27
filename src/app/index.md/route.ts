import { getFaq } from "@/lib/faq";
import { homeMarkdown } from "@/lib/markdown";
import { getTimeline } from "@/lib/modules";

export const revalidate = 60;

export async function GET() {
  const [{ modules }, faq] = await Promise.all([getTimeline(), getFaq()]);
  const body = homeMarkdown(modules, faq);
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
