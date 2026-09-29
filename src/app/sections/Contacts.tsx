import { Instagram, Mail, Send } from "lucide-react";

import SectionHeading from "@/components/SectionHeading";
import FooterIcon from "@/components/sections/FooterIcon";
import { site } from "@/content/site";

export default function Contacts({ id }: { id?: string }) {
  return (
    <section id={id} className="relative w-full">
      <div className="bg-primary px-6 py-12 text-center md:py-16">
        <div className="text-white">
          <SectionHeading tone="inverse">Наші соцмережі</SectionHeading>
          {/* Large bold text: required for AA contrast of white on the brand red */}
          <p className="mt-6 text-xl leading-snug font-bold">
            Більше про гурток дізнавайтеся, написавши нам у Telegram або на пошту
          </p>
          <div className="mx-auto mt-12 flex max-w-xs justify-between">
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FooterIcon icon={Instagram} />
            </a>
            <a href={`mailto:${site.email}`} aria-label="Email">
              <FooterIcon icon={Mail} />
            </a>
            <a href={site.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
              <FooterIcon icon={Send} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
