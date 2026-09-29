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
        <div className="relative h-[420px]">
          <Image
            src={photo}
            alt={`${teacher.name}, викладацька команда Гуртка політичних студій KSE`}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 768px) 33vw, 100vw"
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
    <section id={id} className="min-h-screen w-full py-20">
      <div data-reveal="up" className="mx-auto mb-12 max-w-6xl px-4 md:mb-16">
        <SectionHeading>Викладачі</SectionHeading>
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:auto-rows-[minmax(0,1fr)] md:grid-cols-3 md:gap-y-0">
          {cards.map((teacher, index) => (
            <div
              key={teacher.name}
              data-reveal="up"
              style={{ "--reveal-delay": `${index * 0.15}s` } as React.CSSProperties}
              className="h-full"
            >
              <TeacherCard teacher={teacher} photo={teacher.photo} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
