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
      className="relative flex w-full flex-col overflow-hidden pt-24 pb-0 lg:min-h-screen lg:items-center lg:justify-center lg:py-0"
    >
      {/* Two columns from lg only: on tablets the building would shrink into a corner */}
      <div className="w-full px-6 md:px-8 lg:grid lg:grid-cols-3 lg:grid-rows-3 lg:gap-4 lg:px-0">
        <div
          data-reveal="up"
          className="relative z-20 mb-6 lg:col-span-2 lg:mt-16 lg:mb-0 lg:ml-16 lg:max-w-4xl"
        >
          <SectionHeading align="left">
            Чому варто обрати Гурток <span className="text-primary">політичних</span> студій KSE?
          </SectionHeading>
        </div>

        <div
          data-reveal="up"
          style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}
          className="relative z-20 lg:col-span-2 lg:row-span-2 lg:row-start-2 lg:ml-16"
        >
          <div className="space-y-4 type-body md:max-w-4xl md:space-y-6 lg:text-justify lg:hyphens-auto">
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

          <div className="mt-8 mb-6 md:mt-10 lg:mt-12 lg:mb-0">
            <p className="mb-4 hidden type-lead font-bold md:block">Поспішайте, кількість місць обмежена</p>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/onboarding">Дізнатися більше</Link>
            </Button>
          </div>
        </div>

        {/* Phones: the wide crop under the text. Tablets: the full art, right-aligned. Desktop: the right column */}
        <div
          data-reveal="up-md-right"
          style={{ "--reveal-delay": "0.3s" } as React.CSSProperties}
          className="relative z-10 -mt-25 -mr-11 -ml-1 md:mt-0 md:-mr-8 md:ml-auto md:max-w-[560px] lg:col-start-3 lg:row-span-3 lg:row-start-1 lg:m-0 lg:flex lg:max-w-none lg:items-end lg:justify-end"
        >
          <div className="relative aspect-3/2 w-full md:aspect-square lg:aspect-4/5 lg:max-w-[760px]">
            <ArtDirectedImage
              mobile={kse_building_mobile}
              desktop={kse_building}
              alt="Будівля головного кампусу Київської школи економіки"
              fill
              sizes="100vw"
              desktopSizes="(min-width: 1280px) 700px, (min-width: 1024px) 520px, 560px"
              className="object-contain object-bottom drop-shadow-xl md:object-center md:drop-shadow-none lg:object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
