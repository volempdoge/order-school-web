import Link from "next/link";

import GalleryTimeline from "@/components/gallery/GalleryTimeline";
import { Button } from "@/components/ui/button";
import { getGallery } from "@/lib/gallery";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Галерея",
  description:
    "Фото й відео Гуртка політичних студій KSE за минулі роки: модулі, візити до посольств, зустрічі з експертами, дебати й випускні.",
  path: "/gallery",
});

// Content comes from Notion; new photos are copied to Vercel Blob when the page regenerates
export const revalidate = 300;
// The first sync after many photos are added copies them all
export const maxDuration = 300;

export default async function GalleryPage() {
  const { events } = await getGallery();

  return (
    <main className="min-h-screen px-6 pt-28 pb-20 md:px-8 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-5xl">
        <h1 className="type-display">Галерея</h1>
        <span aria-hidden className="mt-4 block h-1 w-24 rounded-full bg-primary md:mt-5" />
        <p className="mt-6 max-w-3xl type-lead">
          Що відбувалось у гуртку за минулі роки: модулі, візити до посольств, зустрічі з експертами, дебати й
          випускні.
        </p>

        <GalleryTimeline events={events} />

        <div className="mt-16 flex flex-col items-start gap-4 md:mt-24">
          <p className="type-lead font-bold">Хочете бути на наступних фото?</p>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/onboarding">Хочу на курс</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
