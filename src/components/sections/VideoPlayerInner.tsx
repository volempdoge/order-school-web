"use client";
import Video from "next-video";
import type { Asset } from "next-video/dist/assets.js";

interface VideoPlayerInnerProps {
  videoSrc: Asset | string;
  /** Receives the media element: the controls live in VideoPlayer */
  onMedia: (media: HTMLVideoElement | null) => void;
}

// The bare Mux video element, without a player theme: themed controls fought the page's touch
// scrolling and couldn't be paused with a tap on phones.
export default function VideoPlayerInner({ videoSrc, onMedia }: VideoPlayerInnerProps) {
  return (
    <Video
      ref={onMedia}
      src={videoSrc}
      controls={false}
      playsInline
      preload="metadata"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        "--media-object-fit": "cover",
      }}
    />
  );
}
