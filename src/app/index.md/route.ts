import { homeMarkdown } from "@/lib/markdown";
import { getTimeline } from "@/lib/modules";

export const revalidate = 60;

export async function GET() {
  const { modules } = await getTimeline();
  const body = homeMarkdown(modules);
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
