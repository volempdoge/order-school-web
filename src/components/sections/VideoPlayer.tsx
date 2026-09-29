"use client";
import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import type { Asset } from "next-video/dist/assets.js";
import { useEffect, useRef, useState } from "react";

// The player (next-video + player.style) is heavy, so it is only loaded
// when the video is about to scroll into view. Until then the poster is shown.
const VideoPlayerInner = dynamic(() => import("./VideoPlayerInner"), { ssr: false });

interface VideoPlayerProps {
  videoSrc: Asset | string;
  posterSrc: StaticImageData;
  title: string;
}

export default function VideoPlayer({ videoSrc, posterSrc, title }: VideoPlayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative aspect-9/16 overflow-hidden rounded-lg">
      <Image
        src={posterSrc}
        alt={title}
        fill
        sizes="(min-width: 768px) 30vw, 70vw"
        className="object-cover"
      />
      {shouldLoad && (
        <div className="absolute inset-0">
          <VideoPlayerInner videoSrc={videoSrc} posterSrc={posterSrc} />
        </div>
      )}
    </div>
  );
}
