"use client";
import type { StaticImageData } from "next/image";
import Video from "next-video";
import type { Asset } from "next-video/dist/assets.js";
import Instaplay from "player.style/instaplay/react";
import { useState } from "react";

interface VideoPlayerInnerProps {
  videoSrc: Asset | string;
  posterSrc: StaticImageData | string;
}

export default function VideoPlayerInner({ videoSrc, posterSrc }: VideoPlayerInnerProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Video
      src={videoSrc}
      theme={Instaplay}
      poster={posterSrc}
      preload="metadata"
      onLoadedData={() => setIsLoading(false)}
      onCanPlay={() => setIsLoading(false)}
      style={{
        "--media-primary-color": "#ffffff",
        "--media-secondary-color": "var(--primary)",
        "--media-accent-color": "var(--primary)",
        width: "100%",
        height: "100%",
        opacity: isLoading ? 0 : 1,
        transition: "opacity 0.3s ease-in-out",
      }}
    />
  );
}
