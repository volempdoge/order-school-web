import Image from "next/image";

import namedafter from "@/assets/namedafter.webp";
import SectionHeading from "@/components/SectionHeading";
import { namedAfter } from "@/content/site";

const columnPadding = "px-6 md:px-10 lg:px-16 xl:px-20";

export default function NamedAfter() {
  return (
    <section className="relative w-full overflow-hidden py-20">
      {/* One image for all breakpoints: under the heading on phones/tablets, right column on desktop */}
      <div className="grid w-full lg:grid-cols-2 lg:grid-rows-[1fr_auto_auto_1fr]">
        <div
          data-reveal="up"
          className={`${columnPadding} pt-12 md:pt-16 lg:col-start-1 lg:row-start-2 lg:pt-20`}
        >
          <SectionHeading align="left" className="mb-6 max-w-[800px] md:mb-8">
            Гурток, названий на честь <span className="text-primary">Леоніда Паська</span>
          </SectionHeading>
        </div>

        <div
          data-reveal="right"
          className={`${columnPadding} lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:px-0`}
        >
          <div className="relative mb-6 h-[250px] w-full max-w-[800px] sm:h-[300px] md:h-[420px] lg:mb-0 lg:h-full lg:min-h-[600px] lg:max-w-none">
            <Image
              src={namedafter}
              alt="Леонід Пасько у своїй радіомайстерні серед вимірювальних приладів"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-lg object-cover lg:rounded-none"
            />
          </div>
        </div>

        <div
          data-reveal="up"
          className={`${columnPadding} pb-12 md:pb-16 lg:col-start-1 lg:row-start-3 lg:pb-20`}
        >
          <p className="max-w-[800px] text-justify type-lead">
            {namedAfter.text} Більше про його життя та захоплення читайте на{" "}
            <a
              href={namedAfter.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-strong underline underline-offset-2"
            >
              Ukrainer
            </a>
            .
          </p>
        </div>
      </div>

      <figure
        data-reveal="zoom"
        className="mx-6 mt-12 max-w-6xl rounded-lg border-3 border-primary px-6 py-6 md:mx-auto md:mt-24 md:px-12 md:py-10"
      >
        <blockquote className="type-quote">
          «{namedAfter.quote}» — <cite className="not-italic">Леонід Пасько</cite>
        </blockquote>
      </figure>
    </section>
  );
}
