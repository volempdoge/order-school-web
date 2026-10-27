import type { Viewport } from "next";

import { site, SITE_URL } from "@/content/site";
import { type FaqItem, getFaq } from "@/lib/faq";
import { getTimeline, kyivISODate, type TimelineModule } from "@/lib/modules";

import AboutCourse from "./sections/AboutCourse";
import AboutQuote from "./sections/AboutQuote";
import Audience from "./sections/Audience";
import Contacts from "./sections/Contacts";
import Faq from "./sections/Faq";
import Hero from "./sections/Hero";
import Knowlege from "./sections/Knowledge";
import Map from "./sections/Map";
import NamedAfter from "./sections/NamedAfter";
import Structure from "./sections/Structure";
import Teachers from "./sections/Teachers";
import Timeline from "./sections/Timeline";
import Videos from "./sections/Videos";

// The page opens on the dark hero photo, so the browser's top bar starts dark (the header then keeps it in sync)
export const viewport: Viewport = {
  themeColor: "#191A21",
};

// Modules come from Notion: the page is static HTML, regenerated at most once a minute
export const revalidate = 60;

// The share image (app/opengraph-image.jpg), also offered to Google as the result's thumbnail
const PAGE_IMAGE = {
  "@type": "ImageObject",
  url: `${SITE_URL}/opengraph-image.jpg`,
  width: 1200,
  height: 630,
};

function jsonLd(modules: TimelineModule[], faq: readonly FaqItem[]) {
  const organization = {
    "@type": "EducationalOrganization",
    "@id": `${SITE_URL}/#organization`,
    name: site.fullName,
    alternateName: site.name,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    email: site.email,
    sameAs: [site.instagram, site.telegram],
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: site.provider.name,
      alternateName: site.provider.alternateName,
      url: site.provider.url,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    hasMap: site.address.mapUrl,
  };

  const course = {
    "@type": "Course",
    "@id": `${SITE_URL}/#course`,
    name: site.fullName,
    description: site.description,
    inLanguage: site.language,
    educationalLevel: "8–11 клас",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
      audienceType: "Учні 8–11 класів",
    },
    provider: { "@id": `${SITE_URL}/#organization` },
    url: SITE_URL,
    hasCourseInstance: modules.map((module) => ({
      "@type": "CourseInstance",
      name: `Модуль ${module.moduleId}: ${module.title}`,
      description: module.description || undefined,
      courseMode: "Onsite",
      startDate: module.startDate ? kyivISODate(module.startDate) : undefined,
      endDate: module.endDate ? kyivISODate(module.endDate) : undefined,
      location: {
        "@type": "Place",
        name: site.address.place,
        address: `${site.address.street}, ${site.address.city}`,
      },
    })),
  };

  const faqPage = {
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: site.title,
    description: site.description,
    inLanguage: site.language,
    about: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: PAGE_IMAGE,
    image: PAGE_IMAGE,
  };

  return { "@context": "https://schema.org", "@graph": [organization, webPage, course, faqPage] };
}

export default async function Home() {
  const [{ modules }, faq] = await Promise.all([getTimeline(), getFaq()]);

  return (
    <main className="min-h-screen overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(modules, faq)).replace(/</g, "\\u003c") }}
      />
      <Hero id="top" />
      <AboutQuote />
      <AboutCourse />
      <Knowlege id="knowledge" />
      <Structure id="structure" />
      <Timeline id="timeline" modules={modules} />
      <Audience id="audience" />
      <Teachers id="teachers" />
      <Videos id="interview" />
      <NamedAfter />
      <Faq id="faq" items={faq} />
      <Contacts id="contacts" />
      <Map />
    </main>
  );
}
