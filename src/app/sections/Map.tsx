import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export default function Map() {
  return (
    <section className="relative w-full md:h-[50vh]" aria-label="Як нас знайти">
      {/* Interactive everywhere. On phones Google's embed pans with two fingers, so a one-finger swipe
          still scrolls the page; the button below opens the Maps app. */}
      <iframe
        title="Київська школа економіки на Google Maps"
        className="block h-80 w-full md:h-full"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.6466551217677!2d30.42773540751654!3d50.45877602475506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4ce632498e36d%3A0x2254c30854d16308!2sKyiv%20School%20of%20Economics!5e0!3m2!1sen!2sua!4v1759863871447!5m2!1sen!2sua"
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
