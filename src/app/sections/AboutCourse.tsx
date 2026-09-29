import Link from "next/link";

import kse_building from "@/assets/kse-building.webp";
import kse_building_mobile from "@/assets/kse-building-mobile.png";
import ArtDirectedImage from "@/components/ArtDirectedImage";
import SectionHeading from "@/components/SectionHeading";
import { Button } from "@/components/ui/button";

const accent = "text-primary-strong font-bold";

export default function AboutCourse() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen w-full flex-col overflow-hidden pt-24 pb-0 md:items-center md:justify-center md:py-0"
    >
      <div className="w-full px-6 md:grid md:grid-cols-3 md:grid-rows-3 md:gap-4 md:px-0">
        <div
          data-reveal="up"
          className="relative z-20 mb-6 md:col-span-2 md:mt-16 md:mb-0 md:ml-16 md:max-w-4xl"
        >
          <SectionHeading align="left">
            Чому варто обрати Гурток <span className="text-primary">політичних</span> студій KSE?
          </SectionHeading>
        </div>

        <div
          data-reveal="up"
          style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}
          className="relative z-20 md:col-span-2 md:row-span-2 md:row-start-2 md:ml-16"
        >
          <div className="space-y-4 text-justify type-body md:max-w-4xl md:space-y-6">
            <p>
              Це практичний курс від факультету соціальних наук <span className={accent}>KSE</span> для{" "}
              <span className={accent}>учнів 8–11 класів</span>, які хочуть глибше зрозуміти політику та
              суспільство. Навчання відбувається офлайн у головному кампусі KSE та в наших партнерів. Тут ви
              ознайомитеся з основами <span className={accent}>політичних наук і політичної філософії</span>,
              вивчите історію політичних ідей та їхній вплив на сучасність. Ви отримаєте інструменти, які
              допоможуть розуміти політичні процеси та впливати на зміни у суспільстві.
            </p>
            <p>
              Без зайвих спрощень, легковажності й поверхневості. Лише поглиблене вивчення першоджерел і
              літератури, практичні кейси та власні дослідження.
            </p>
          </div>

          <div className="mt-8 mb-6 md:mt-12 md:mb-0">
            <p className="mb-4 hidden type-lead font-bold md:block">Поспішайте, кількість місць обмежена</p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/onboarding">Дізнатися більше</Link>
            </Button>
          </div>
        </div>

        {/* On phones the building sits under the text, on desktop it fills the right column */}
        <div
          data-reveal="up-md-right"
          style={{ "--reveal-delay": "0.3s" } as React.CSSProperties}
          className="relative z-10 -mt-25 -mr-11 -ml-1 md:col-start-3 md:row-span-3 md:row-start-1 md:m-0 md:flex md:items-end md:justify-end"
        >
          <div className="relative aspect-[3/2] w-full md:aspect-[3/4] md:max-w-[760px] lg:aspect-[4/5]">
            <ArtDirectedImage
              mobile={kse_building_mobile}
              desktop={kse_building}
              alt="Будівля головного кампусу Київської школи економіки"
              fill
              sizes="100vw"
              desktopSizes="(min-width: 1280px) 700px, (min-width: 1024px) 520px, 45vw"
              className="object-contain object-bottom drop-shadow-xl md:object-center md:drop-shadow-none lg:object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
