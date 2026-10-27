import type { Metadata } from "next";

import { site } from "@/content/site";

// app/opengraph-image.jpg and app/twitter-image.jpg (1200×630); the alt matches their .alt.txt files
const SHARE_IMAGE = {
  width: 1200,
  height: 630,
  alt: "Гурток політичних студій KSE — офлайн-курс політології для учнів 8–11 класів у Києві",
};

// Child pages must repeat openGraph/twitter: Next.js replaces these objects
// instead of merging them with the ones from the layout. That includes the images: without them
// a shared link to any page but the home page had no picture, and Telegram showed no preview at all.
export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${site.name}` : site.title;
  return {
    title: title ?? { absolute: site.title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: site.name,
      url: path,
      title: fullTitle,
      description,
      images: [{ url: "/opengraph-image.jpg", type: "image/jpeg", ...SHARE_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: "/twitter-image.jpg", ...SHARE_IMAGE }],
    },
  };
}
