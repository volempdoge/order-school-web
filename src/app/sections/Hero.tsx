import { ChevronDown } from "lucide-react";
import Link from "next/link";

import hero from "@/assets/hero.webp";
import heroMobile from "@/assets/hero-mobile.webp";
import ArtDirectedImage from "@/components/ArtDirectedImage";
import SectionLink from "@/components/SectionLink";
import { Button } from "@/components/ui/button";

// Dark until the photo arrives, so the transparent header never sits on beige
export default function Hero({ id }: { id?: string }) {
  return (
    <section id={id} data-hero className="relative min-h-screen w-full overflow-hidden bg-foreground">
      <div className="absolute inset-0 z-0 md:border-b-4 md:border-primary">
        {/* Phones: at most a little taller than the 2:3 photo itself (a ~6% trim at each side keeps
            everyone in), so tall screens don't crop the people at the sides. On tall screens the photo
            slides down to sit right above the heading; the dark background fills the rest. */}
        <div className="absolute inset-x-0 top-[max(0px,calc(100%-170vw-10rem))] h-full max-h-[170vw] md:top-0 md:max-h-none">
          <ArtDirectedImage
            mobile={heroMobile}
            desktop={hero}
            alt="Випускники Гуртка політичних студій із сертифікатами KSE у головному кампусі Київської школи економіки"
            fill
            priority
            sizes="100vw"
            // Trim a bit more on the left: the man at the right edge stands closer to it
            className="object-cover object-[60%_50%] md:object-center"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-foreground to-transparent md:hidden"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-foreground to-transparent md:hidden"
          />
        </div>
        {/* Scrim: keeps the white menu and heading readable over the light photo */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-foreground/70 to-transparent"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-foreground/85 via-foreground/20 to-transparent md:bg-linear-to-r md:from-foreground/75 md:via-foreground/30 md:to-transparent"
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-end justify-start">
        <div className="w-full px-6 pb-16 md:w-auto md:px-16 md:pb-24 lg:pb-32">
          <h1 className="max-w-[333px] type-display text-white md:max-w-5xl">
            Станьте частиною Гуртка <span className="text-primary">політичних студій</span> від KSE <br />
            Відкривайте світ суспільних змін
          </h1>
          <Button asChild variant="light" size="lg" className="mt-6 w-full sm:w-auto md:mt-12">
            <Link href="/onboarding">Хочу на курс</Link>
          </Button>
        </div>
      </div>

      {/* Phones: the hero fills the screen, so hint that the page goes on */}
      <SectionLink
        hash="#about"
        aria-label="Гортайте далі"
        className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 p-2 text-white/80 md:hidden"
      >
        <ChevronDown aria-hidden className="size-7 motion-safe:animate-bounce" />
      </SectionLink>
    </section>
  );
}
