import GalleryMedia from "@/components/gallery/GalleryMedia";
import SocialLinks from "@/components/SocialLinks";
import type { GalleryEvent } from "@/lib/gallery";

const monthYear = new Intl.DateTimeFormat("uk-UA", {
  month: "long",
  year: "numeric",
  timeZone: "Europe/Kyiv",
});

function eventDate(date: string) {
  if (!date) return "";
  // "травень 2025 р." → "травень 2025"
  return monthYear.format(new Date(`${date}T12:00:00Z`)).replace(/\s*р\.$/, "");
}

function byYear(events: GalleryEvent[]) {
  const years = new Map<string, GalleryEvent[]>();
  for (const event of events) {
    const year = event.date.slice(0, 4) || "Інше";
    years.set(year, [...(years.get(year) ?? []), event]);
  }
  return [...years.entries()];
}

function Marker() {
  // The red cross from the course route illustration, centred on the timeline line
  return (
    <span aria-hidden className="absolute top-1.5 -left-[33px] size-4 md:-left-[49px]">
      <span className="absolute top-1/2 left-0 h-1 w-4 -translate-y-1/2 rounded-full bg-primary" />
      <span className="absolute top-0 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full bg-primary" />
    </span>
  );
}

// Events grouped by year, newest first, on a vertical line with the course's red crosses
export default function GalleryTimeline({ events }: { events: GalleryEvent[] }) {
  return (
    <>
      {events.length === 0 ? (
        <div className="mt-12 rounded-lg bg-primary px-6 py-8 text-white md:px-12 md:py-10">
          <p className="font-body text-[1.1875rem] leading-snug font-bold md:text-xl">
            Скоро тут зʼявляться фото й відео з минулих років. А поки — зазирніть у наші соцмережі.
          </p>
          <SocialLinks className="mt-6 flex gap-4" />
        </div>
      ) : (
        byYear(events).map(([year, yearEvents]) => (
          <section key={year} aria-labelledby={`year-${year}`} className="mt-14 md:mt-20">
            <h2 id={`year-${year}`} className="type-h2 text-primary">
              {year}
            </h2>
            <ol className="mt-6 space-y-14 border-l-2 border-primary pl-6 md:mt-8 md:space-y-20 md:pl-10">
              {yearEvents.map((event) => (
                <li key={event.id} className="relative">
                  <Marker />
                  <article>
                    {event.date && (
                      <time
                        dateTime={event.date}
                        className="type-small font-bold tracking-wider text-primary uppercase"
                      >
                        {eventDate(event.date)}
                      </time>
                    )}
                    <h3 className="mt-1 type-h3">{event.title}</h3>
                    {[event.description, ...event.text].filter(Boolean).map((paragraph, index) => (
                      <p key={index} className="mt-3 max-w-3xl type-body">
                        {paragraph}
                      </p>
                    ))}
                    {event.media.length > 0 && <GalleryMedia media={event.media} eventTitle={event.title} />}
                  </article>
                </li>
              ))}
            </ol>
          </section>
        ))
      )}
    </>
  );
}
