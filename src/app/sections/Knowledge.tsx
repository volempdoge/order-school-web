import Image from "next/image";

import knowledgeRoute from "@/assets/knowledge-route.webp";
import knowledgeRouteMobile from "@/assets/knowledge-route-mobile.svg";
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

// The same for the phone/tablet route: the label boxes drawn in knowledge-route-mobile.svg
// (viewBox 391×516), in its units. The route visits the topics in a different order.
const MOBILE_VIEWBOX = { width: 391, height: 516 };
const MOBILE_LABELS = [
  { x: 15.5, y: 24, width: 233, breakAfter: 2 },
  { x: 168.5, y: 101, width: 205, breakAfter: 2 },
  { x: 182.5, y: 287, width: 191, breakAfter: 3 },
  { x: 15.5, y: 194.5, width: 186, breakAfter: 2 },
  { x: 15.5, y: 367.5, width: 201, breakAfter: 2 },
  { x: 208.5, y: 442, width: 165, breakAfter: 2 },
] as const;
const MOBILE_LABEL_HEIGHT = 60;

// Torch from the original illustration
function TorchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="32 553 13 22"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M40 569H37V574H40V569ZM42 569H35L33.5 565H43.5L42 569ZM37 559C38 556.695 40 554 40 554C40 554 43.18 559.745 43.18 561.615C43.18 563.485 41.87 565 40 565H36C34.68 565 33.82 563.93 33.82 562.61C33.82 561.29 36 557 36 557C36 557 36.48 558.005 37 559Z" />
    </svg>
  );
}

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

      {/* Topics are real text placed on the route illustrations: one for phones/tablets, one for desktop */}
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

        {/* Phones and tablets: the original winding route, with the topics as real text on its boxes */}
        <div className="@container relative mx-4 sm:mx-auto sm:max-w-xl lg:hidden">
          <Image src={knowledgeRouteMobile} alt="" aria-hidden className="h-auto w-full" />
          <ol className="absolute inset-0">
            {knowledgeTopics.map((topic, index) => {
              const box = MOBILE_LABELS[index];
              if (!box) return null;
              const [first, second] = splitLabel(topic, box.breakAfter);
              return (
                <li
                  key={topic}
                  className="absolute flex items-center justify-center text-center text-[3.4cqw] leading-[1.2] font-bold tracking-[0.04em] uppercase"
                  style={{
                    left: `${(box.x / MOBILE_VIEWBOX.width) * 100}%`,
                    top: `${(box.y / MOBILE_VIEWBOX.height) * 100}%`,
                    width: `${(box.width / MOBILE_VIEWBOX.width) * 100}%`,
                    height: `${(MOBILE_LABEL_HEIGHT / MOBILE_VIEWBOX.height) * 100}%`,
                  }}
                >
                  <span>
                    {first} <br />
                    {second}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Phones: hangs right under the route, whose line runs into it, as in the original illustration */}
      <div
        data-reveal="up"
        className="mx-[calc(1rem+4.2%)] flex items-center gap-3 rounded-md bg-primary px-4 py-4 font-body text-[1.1875rem] leading-[1.3] font-bold text-white sm:mx-auto sm:max-w-[33rem] lg:mt-8 lg:max-w-4xl lg:rounded-lg lg:px-8 lg:py-6 lg:text-xl"
      >
        <TorchIcon className="h-7 w-4 shrink-0 lg:h-8 lg:w-5" />
        <p>
          На вас чекають візити до посольств, зустрічі з відомими спікерами та дослідницькі завдання, щоб
          глибше зрозуміти політичні процеси
        </p>
      </div>
    </section>
  );
}
