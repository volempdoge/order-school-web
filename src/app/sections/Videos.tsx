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
    <section className="relative hidden min-h-screen w-full py-12 md:block md:py-20" id={id}>
      <div data-reveal="up" className="relative z-10 mx-auto mb-8 max-w-6xl px-4 md:mb-16">
        <SectionHeading>Інтервʼю з випускниками</SectionHeading>
      </div>

      <div
        className="bg-cover bg-center bg-no-repeat py-12"
        style={{ backgroundImage: `url(${sectionBackground.src})` }}
      >
        <div className="relative z-10 mx-auto px-4 sm:px-8 md:px-16 lg:px-32 xl:px-64">
          <div className="my-8 flex justify-center gap-12 sm:my-12 md:my-16 lg:my-18">
            {videos.map((video, index) => (
              <div
                key={index}
                data-reveal="up"
                style={{ "--reveal-delay": `${index * 0.2}s` } as React.CSSProperties}
                className="w-full max-w-2xl"
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
