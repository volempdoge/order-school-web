import Link from "next/link";

import audienceDesktop from "@/assets/audience.webp";
import audienceMobile from "@/assets/audience-mobile.png";
import ArtDirectedImage from "@/components/ArtDirectedImage";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";
import { audience } from "@/content/site";

function AudienceItem({ text }: { text: string }) {
  // Highlight the word "спеціальності" the same way the design does
  const [before, after] = text.split("спеціальності");
  return (
    <>
      {before}
      {after !== undefined && (
        <>
          <span className="font-bold text-primary-strong">спеціальності</span>
          {after}
        </>
      )}
    </>
  );
}

export default function Audience({ id }: { id?: string }) {
  return (
    <section id={id} className="relative min-h-screen w-full py-10 md:py-20">
      <div className="relative min-h-screen overflow-hidden md:mx-auto md:grid md:min-h-0 md:max-w-7xl md:grid-cols-2 md:items-center md:gap-12 md:overflow-visible md:px-8">
        <div data-reveal="up" className="relative z-10 px-6 py-8 md:p-0">
          <SectionHeading align="left">
            Для кого створений <br className="hidden md:inline" />
            Гурток політичних <br className="hidden md:inline" />
            студій
          </SectionHeading>

          <ul className="my-8 space-y-4 md:my-10 md:space-y-6">
            {audience.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-lg bg-background/85 p-5 backdrop-blur-sm md:gap-4 md:rounded-none md:bg-transparent md:p-0 md:backdrop-blur-none"
              >
                <span aria-hidden className="mt-1.5 size-3 flex-shrink-0 rounded-full bg-primary" />
                <span className={`type-lead ${index === 0 ? "font-bold" : ""}`}>
                  <AudienceItem text={item} />
                </span>
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/onboarding">Дізнатися більше</Link>
          </Button>
        </div>

        {/* Phones: faded background behind the list. Desktop: illustration in the right column */}
        <div data-reveal="up" className="absolute top-10 right-0 left-20 z-0 h-[60vh] md:static md:h-auto">
          <ArtDirectedImage
            mobile={audienceMobile}
            desktop={audienceDesktop}
            alt="Колаж: люди дивляться на ноутбук, з якого виростає друкарська машинка, — ілюстрація для розділу «Для кого»"
            sizes="100vw"
            desktopSizes="(min-width: 1280px) 600px, 50vw"
            className="h-full w-full object-cover object-top md:h-auto md:object-contain"
          />
        </div>
      </div>
    </section>
  );
}
