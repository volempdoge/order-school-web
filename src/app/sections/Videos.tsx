import interviewOneBg from "@/assets/prev_interview_1.webp";
import interviewTwoBg from "@/assets/prev_interview_2.webp";
import interviewThreeBg from "@/assets/prev_interview_3.webp";
import sectionBackground from "@/assets/videos-bg.webp";
import SectionHeading from "@/components/SectionHeading";
import VideoPlayer from "@/components/sections/VideoPlayer";

import interviewOne from "../../../videos/Polit1.mov";
import interviewTwo from "../../../videos/Polit2.mov";

const videos = [
  { src: interviewOne, poster: interviewOneBg },
  { src: interviewTwo, poster: interviewThreeBg },
  { src: interviewTwo, poster: interviewTwoBg },
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
        {/* Phones: a swipeable row that peeks the next video. From md: three columns */}
        <div className="relative z-10 mx-auto md:px-16 lg:px-32 xl:px-64">
          <div className="flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 py-4 [scrollbar-width:none] md:my-16 md:justify-center md:gap-12 md:overflow-visible md:px-0 md:py-0 lg:my-18">
            {videos.map((video, index) => (
              <div
                key={index}
                data-reveal="up"
                style={{ "--reveal-delay": `${index * 0.2}s` } as React.CSSProperties}
                className="w-[70vw] max-w-xs shrink-0 snap-start md:w-full md:max-w-2xl md:shrink"
              >
                <VideoPlayer
                  videoSrc={video.src}
                  posterSrc={video.poster}
                  title={`Інтервʼю з випускником Гуртка політичних студій, відео ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
