import Image, { type StaticImageData } from "next/image";

import mykyta from "@/assets/mykyta.webp";
import oksana from "@/assets/oksana.webp";
import vladyslav from "@/assets/vlad.webp";
import SectionHeading from "@/components/SectionHeading";
import { teachers } from "@/content/site";

const cards = [
  { ...teachers[0], photo: mykyta },
  { ...teachers[1], photo: vladyslav },
  { ...teachers[2], photo: oksana },
];

function TeacherCard({ teacher, photo }: { teacher: (typeof teachers)[number]; photo: StaticImageData }) {
  const [firstName, ...rest] = teacher.name.split(" ");
  return (
    <article className="flex h-full flex-col gap-6">
      <div className="overflow-hidden rounded-lg border border-foreground bg-background">
        <div className="relative aspect-4/5 md:aspect-auto md:h-[420px]">
          <Image
            src={photo}
            alt={`${teacher.name}, викладацька команда Гуртка політичних студій KSE`}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 80vw"
            className="object-cover"
          />
        </div>
        <div className="bg-primary py-4 text-center text-white">
          <h3 className="font-display text-2xl leading-tight uppercase">
            {firstName}
            <br />
            {rest.join(" ")}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col rounded-lg border border-foreground bg-card px-6 py-8">
        <ul className="flex-1 space-y-3 text-left type-body">
          {teacher.details.map((info) => (
            <li key={info} className="flex gap-3">
              <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
              <span>{info}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function Teachers({ id }: { id?: string }) {
  return (
    <section id={id} className="w-full py-12 md:py-20">
      <div data-reveal="up" className="mx-auto mb-12 max-w-6xl px-6 md:mb-16">
        <SectionHeading>Викладачі</SectionHeading>
      </div>
      {/* Phones: a swipeable row that peeks the next card, like the interviews. From md: three columns.
          The row reveals as a whole: cards off to the side never scroll into view, so they would stay
          shifted down and could be scrolled vertically inside the row. */}
      <div className="mx-auto max-w-5xl md:px-6">
        <div
          data-reveal="up"
          className="flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-6 pb-2 [scrollbar-width:none] md:grid md:auto-rows-[minmax(0,1fr)] md:grid-cols-3 md:gap-x-12 md:overflow-visible md:overflow-y-visible md:px-0 md:pb-0"
        >
          {cards.map((teacher) => (
            <div key={teacher.name} className="w-[80vw] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none">
              <TeacherCard teacher={teacher} photo={teacher.photo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
