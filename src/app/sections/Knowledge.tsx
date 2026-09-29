import Image from "next/image";

import knowledgeRoute from "@/assets/knowledge-route.webp";
import SectionHeading from "@/components/SectionHeading";
import { knowledgeTopics } from "@/content/site";

// Where each topic sits on the route illustration (desktop), in % of the image,
// and after which word the label breaks onto its second line. Same order as knowledgeTopics.
const ROUTE_LABELS = [
  { left: 18.6, top: 17.4, breakAfter: 2 },
  { left: 53.9, top: 27.5, breakAfter: 2 },
  { left: 24.5, top: 47.2, breakAfter: 3 },
  { right: 24.7, top: 50, breakAfter: 2 },
  { left: 18.8, top: 71.3, breakAfter: 2 },
  { left: 43.1, top: 78.6, breakAfter: 2 },
] as const;

function splitLabel(text: string, breakAfter: number) {
  const words = text.split(" ");
  return [words.slice(0, breakAfter).join(" "), words.slice(breakAfter).join(" ")] as const;
}

export default function Knowledge({ id }: { id?: string }) {
  return (
    <section id={id} className="w-full overflow-x-hidden py-12 md:py-20 lg:min-h-screen">
      <div data-reveal="up" className="mx-auto max-w-6xl px-6 text-left md:px-4 md:text-center">
        <SectionHeading align="responsive">Навички і знання, які ви отримаєте</SectionHeading>
        <p className="mt-6 type-lead">
          Ви розберетеся, як працює політика на різних рівнях — від ідей та історії до сучасних процесів:
        </p>
      </div>

      {/* Topics are real text. Phones/tablets: a vertical route. Desktop: labels placed on the illustration. */}
      <div data-reveal="zoom" className="mt-8 w-full">
        <div className="@container relative hidden lg:block">
          <Image src={knowledgeRoute} alt="" aria-hidden sizes="100vw" className="h-auto w-full" />
          <ol className="absolute inset-0">
            {knowledgeTopics.map((topic, index) => {
              const place = ROUTE_LABELS[index];
              if (!place) return null;
              const [first, second] = splitLabel(topic, place.breakAfter);
              return (
                <li
                  key={topic}
                  className={`absolute text-[1.31cqw] leading-[1.2] font-bold tracking-[0.06em] uppercase ${"right" in place ? "text-right" : ""}`}
                  style={{
                    top: `${place.top}%`,
                    ...("right" in place ? { right: `${place.right}%` } : { left: `${place.left}%` }),
                  }}
                >
                  {/* The space keeps the words apart in the text itself, the <br> only breaks the line */}
                  {first} <br />
                  {second}
                </li>
              );
            })}
          </ol>
        </div>

        <ol className="mx-6 border-l-2 border-primary md:mx-auto md:max-w-xl lg:hidden">
          {knowledgeTopics.map((topic) => (
            <li key={topic} className="relative py-3 pl-8 font-bold tracking-wide uppercase">
              {/* The red cross marker from the illustration */}
              <span aria-hidden className="absolute top-1/2 -left-[9px] size-4 -translate-y-1/2">
                <span className="absolute top-1/2 left-0 h-1 w-4 -translate-y-1/2 rounded-full bg-primary" />
                <span className="absolute top-0 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full bg-primary" />
              </span>
              {topic}
            </li>
          ))}
        </ol>
      </div>

      <div
        data-reveal="up"
        className="mx-auto mt-8 hidden max-w-4xl rounded-lg bg-primary px-8 py-6 font-body text-xl leading-snug font-bold text-white md:block"
      >
        Крім цього, на вас чекають візити до посольств, зустрічі з відомими експертами та дослідницькі
        завдання, щоб глибше зрозуміти політичні процеси.
      </div>
    </section>
  );
}
