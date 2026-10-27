import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export default function Map() {
  return (
    <section className="relative w-full md:h-[50vh]" aria-label="Як нас знайти">
      {/* Interactive everywhere. On phones Google's embed pans with two fingers, so a one-finger swipe
          still scrolls the page; the button below opens the Maps app. */}
      <iframe
        title="Інститут св. Томи Аквінського на Google Maps"
        className="block h-80 w-full md:h-full"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://maps.google.com/maps?q=%D0%B2%D1%83%D0%BB.+%D0%94%D0%B5%D1%80%D0%B5%D0%B2%D0%BB%D1%8F%D0%BD%D1%81%D1%8C%D0%BA%D0%B0+13+%D0%9A%D0%B8%D1%97%D0%B2&z=16&hl=uk&output=embed"
      />
      <div className="px-6 py-6 md:absolute md:bottom-8 md:left-8 md:max-w-sm md:rounded-lg md:bg-card md:p-6 md:shadow-xl">
        <address className="type-body font-bold not-italic">
          {site.address.place}
          <br />
          <span className="font-medium text-muted-foreground">
            {site.address.street}, {site.address.city}
          </span>
        </address>
        <Button asChild size="sm" className="mt-4 w-full md:w-auto">
          <a href={site.address.mapUrl} target="_blank" rel="noopener noreferrer">
            Відкрити в Google Maps
            <ExternalLink aria-hidden />
          </a>
        </Button>
      </div>
    </section>
  );
}
