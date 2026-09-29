import Link from "next/link";

import hero from "@/assets/hero.webp";
import heroMobile from "@/assets/hero-mobile.webp";
import ArtDirectedImage from "@/components/ArtDirectedImage";
import { Button } from "@/components/ui/button";

export default function Hero({ id }: { id?: string }) {
  return (
    <section id={id} className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 z-0 md:border-b-4 md:border-primary">
        <ArtDirectedImage
          mobile={heroMobile}
          desktop={hero}
          alt="Випускники Гуртка політичних студій із сертифікатами KSE у головному кампусі Київської школи економіки"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
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

      <div className="relative z-10 flex min-h-screen items-end justify-start md:items-center">
        <div className="w-full px-6 pb-16 md:mt-96 md:ml-16 md:w-auto md:px-0 md:pb-0">
          <h1 className="max-w-[333px] type-display text-white md:max-w-5xl">
            Станьте частиною Гуртка <span className="text-primary">політичних студій</span> від KSE <br />
            Відкривайте світ суспільних змін
          </h1>
          <Button asChild variant="light" size="lg" className="mt-6 w-full sm:w-auto md:mt-12">
            <Link href="/onboarding">Хочу на курс</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
