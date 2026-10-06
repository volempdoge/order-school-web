import Link from "next/link";

import polit1Poster from "@/assets/prev_interview_1.webp";
import vitaliyPoster from "@/assets/prev_interview_2.webp";
import sectionBackground from "@/assets/videos-bg.webp";
import SectionHeading from "@/components/SectionHeading";
import VideoPlayer from "@/components/sections/VideoPlayer";
import { Button } from "@/components/ui/button";

import interviewOne from "../../../videos/Polit1.mov";
import interviewTwo from "../../../videos/Polit2.mov";

// Polit2 is Vitaliy. Polit1 keeps the poster it had on the original site (prev_interview_1, captioned
// "Матвій"). Katya has a poster (prev_interview_3.webp) but no video file yet.
const videos = [
  {
    src: interviewTwo,
    poster: vitaliyPoster,
    title: "Інтервʼю з Віталієм, 10 клас, випускником Гуртка політичних студій",
  },
  {
    src: interviewOne,
    poster: polit1Poster,
    title: "Інтервʼю з випускницею Гуртка політичних студій",
  },
];

export default function Videos({ id }: { id?: string }) {
  return (
    <section className="relative w-full py-12 md:py-20" id={id}>
      <div data-reveal="up" className="relative z-10 mx-auto mb-8 max-w-6xl px-4 md:mb-16">
        <SectionHeading>Інтервʼю з випускниками</SectionHeading>
      </div>

      <div
        className="bg-cover bg-center bg-no-repeat py-12"
        style={{ backgroundImage: `url(${sectionBackground.src})` }}
      >
        {/* Phones: a swipeable row that peeks the next video. From md: side by side.
          The row reveals as a whole: cards off to the side never scroll into view, so they would stay
          shifted down and could be scrolled vertically inside the row. */}
        <div className="relative z-10 mx-auto md:px-16 lg:px-32 xl:px-64">
          <div
            data-reveal="up"
            className="flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain px-6 py-4 [scrollbar-width:none] md:my-16 md:justify-center md:gap-12 md:overflow-visible md:overflow-y-visible md:px-0 md:py-0 lg:my-18"
          >
            {videos.map((video) => (
              <div
                key={video.title}
                className="w-[70vw] max-w-xs shrink-0 snap-start md:w-full md:max-w-[18rem] md:shrink"
              >
                <VideoPlayer videoSrc={video.src} posterSrc={video.poster} title={video.title} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center px-6 md:mt-12">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/gallery">Більше фото й відео</Link>
        </Button>
      </div>
    </section>
  );
}
