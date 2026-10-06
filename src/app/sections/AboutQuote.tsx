import Image from "next/image";

import quote from "@/assets/quote.webp";

export default function AboutQuote() {
  return (
    <section className="relative mt-12 flex w-full items-center justify-center md:mt-20">
      <div className="grid w-full max-w-[1800px] grid-cols-1 items-center gap-4 md:grid-cols-[4fr_1fr] md:gap-1">
        <div data-reveal="left" className="flex items-center justify-center">
          <figure className="mr-2 w-full rounded-r-lg border-3 border-l-0 border-primary px-6 py-6 md:px-16 md:py-10">
            <blockquote className="type-quote">
              «Демократія має народжуватися у кожному новому поколінні, і саме освіта допомагає їй зʼявитися
              на світ.» — <cite className="not-italic">Джон Дьюї</cite>
            </blockquote>
          </figure>
        </div>
        <div data-reveal="right-rotate" className="hidden justify-start md:flex">
          <div className="w-full max-w-sm flex-shrink-0">
            <Image
              src={quote}
              alt="Портрет американського філософа й педагога Джона Дьюї"
              sizes="384px"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
