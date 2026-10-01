import Image from "next/image";

import col1 from "@/assets/col1.webp";
import col2 from "@/assets/col2.webp";
import col3 from "@/assets/col3.webp";
import SectionHeading from "@/components/SectionHeading";
import StructureCols from "@/components/sections/StructureCols";
import { structure } from "@/content/site";

const columns = [
  { ...structure[0], image: col1, alt: "Гравюра капітелі доричної колони — ілюстрація до заняття «Теорія»" },
  {
    ...structure[1],
    image: col2,
    alt: "Гравюра капітелі іонічної колони — ілюстрація до заняття «Практика»",
  },
  {
    ...structure[2],
    image: col3,
    alt: "Гравюра капітелі коринфської колони — ілюстрація до заняття «Досвід»",
  },
];

export default function Structure({ id }: { id?: string }) {
  return (
    <section className="w-full overflow-x-hidden py-12 md:py-20" id={id}>
      <div className="mx-auto max-w-4xl px-6">
        <div data-reveal="up">
          <SectionHeading>Структура курсу</SectionHeading>
        </div>

        <p data-reveal="up" className="mt-8 text-justify type-lead hyphens-auto">
          Річну програму гуртка поділено на тематичні модулі. Кожен навчальний модуль триває 2 тижні і
          складається з трьох логічно повʼязаних занять: «Теорія», «Практика» та «Досвід».
        </p>
      </div>

      <div className="mt-16 flex w-full justify-center px-6">
        <div className="grid max-w-7xl grid-cols-1 items-end gap-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-12 xl:gap-16">
          {columns.map((item, index) => (
            <div
              key={item.title}
              data-reveal="up"
              style={{ "--reveal-delay": `${index * 0.1}s` } as React.CSSProperties}
              className="flex h-full flex-col"
            >
              <StructureCols
                header={`${index + 1}. ${item.title}`}
                paragph1={item.text}
                paragph2={`— ${item.focus}`}
                span="Акцент"
              />
              <div className="mt-auto flex w-full items-end justify-center pt-8">
                <Image
                  src={item.image}
                  alt={item.alt}
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="h-auto w-full max-w-sm object-contain object-bottom md:max-w-md lg:max-w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
