"use client";
import { Loader2, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import type { Asset } from "next-video/dist/assets.js";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { registerPlayer } from "./video-group";

// The video element (next-video + Mux) is heavy, so it is only loaded
// when the video is about to scroll into view. Until then the poster is shown.
const VideoPlayerInner = dynamic(() => import("./VideoPlayerInner"), { ssr: false });

interface VideoPlayerProps {
  videoSrc: Asset | string;
  posterSrc: StaticImageData;
  title: string;
}

type Status = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

// A tap anywhere toggles play/pause. Nothing on the video captures drags, so swiping over it
// scrolls the page (or the row of videos) as usual.
export default function VideoPlayer({ videoSrc, posterSrc, title }: VideoPlayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [media, setMedia] = useState<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  // Tapped before the video element arrived: start it as soon as it does
  const playWhenReady = useRef(false);

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

  // Scrolled (or swiped) mostly out of view: pause
  useEffect(() => {
    const el = ref.current;
    if (!el || !media) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.intersectionRatio < 0.25 && !media.paused) media.pause();
      },
      { threshold: [0, 0.25] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [media]);

  useEffect(() => {
    if (!media) return;
    const listeners: [string, () => void][] = [
      ["play", () => setStatus("loading")],
      ["waiting", () => setStatus("loading")],
      [
        "playing",
        () => {
          setStatus("playing");
          setStarted(true);
        },
      ],
      ["pause", () => setStatus(media.ended ? "ended" : "paused")],
      ["ended", () => setStatus("ended")],
      ["error", () => setStatus("error")],
      ["timeupdate", () => setProgress(media.duration ? media.currentTime / media.duration : 0)],
      ["volumechange", () => setMuted(media.muted)],
    ];
    listeners.forEach(([type, listener]) => media.addEventListener(type, listener));
    const unregister = registerPlayer(media);
    if (playWhenReady.current) {
      playWhenReady.current = false;
      start(media);
    }
    return () => {
      listeners.forEach(([type, listener]) => media.removeEventListener(type, listener));
      unregister();
    };
  }, [media]);

  const toggle = () => {
    if (!media) {
      playWhenReady.current = true;
      setShouldLoad(true);
      setStatus("loading");
      return;
    }
    if (status === "error") media.load();
    if (media.paused || media.ended) start(media);
    else media.pause();
  };

  const playing = status === "playing" || status === "loading";
  const label = playing ? `Пауза: ${title}` : `Відтворити: ${title}`;

  return (
    <div
      ref={ref}
      className="relative aspect-9/16 touch-manipulation overflow-hidden rounded-lg bg-foreground"
    >
      {shouldLoad && <VideoPlayerInner videoSrc={videoSrc} onMedia={setMedia} />}

      {/* Stays over the video until the first frame plays, so there's no black flash */}
      <Image
        src={posterSrc}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 768px) 30vw, 70vw"
        className={cn(
          "pointer-events-none object-cover transition-opacity duration-500",
          started && status !== "ended" && "opacity-0",
        )}
      />

      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        title={label}
        className="absolute inset-0 flex cursor-pointer items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-white/70 focus-visible:ring-inset"
      >
        {status !== "playing" && (
          <span className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform active:scale-95">
            {status === "loading" ? (
              <Loader2 aria-hidden className="size-7 animate-spin" />
            ) : status === "ended" || status === "error" ? (
              <RotateCcw aria-hidden className="size-7" />
            ) : (
              <Play aria-hidden className="size-7 translate-x-0.5 fill-current" />
            )}
          </span>
        )}
      </button>

      {status === "error" && (
        <p
          role="status"
          className="pointer-events-none absolute inset-x-4 bottom-16 rounded-md bg-foreground/85 px-3 py-2 text-center type-small text-white"
        >
          Не вдалося відтворити відео. Торкніться, щоб спробувати ще раз
        </p>
      )}

      {started && (
        <>
          <button
            type="button"
            onClick={() => media && toggleMuted(media)}
            aria-label={muted ? "Увімкнути звук" : "Вимкнути звук"}
            className="absolute right-3 bottom-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-foreground/60 text-white outline-none focus-visible:ring-[3px] focus-visible:ring-white/70"
          >
            {muted ? <VolumeX aria-hidden className="size-5" /> : <Volume2 aria-hidden className="size-5" />}
          </button>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/25">
            <div className="h-full bg-primary" style={{ width: `${progress * 100}%` }} />
          </div>
        </>
      )}
    </div>
  );
}

function toggleMuted(media: HTMLMediaElement) {
  media.muted = !media.muted;
}

function start(media: HTMLMediaElement) {
  media.play().catch((error: unknown) => {
    // AbortError: paused again before it started — nothing went wrong
    if (error instanceof DOMException && error.name === "AbortError") return;
    media.dispatchEvent(
      new Event(error instanceof DOMException && error.name === "NotAllowedError" ? "pause" : "error"),
    );
  });
}
