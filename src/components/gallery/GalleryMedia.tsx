"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Image from "next/image";
import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";

import type { GalleryImage, GalleryMedia as Media, GalleryVideo } from "@/lib/gallery";

// YouTube's player loads only after a tap: until then it's a thumbnail, so a page full of videos stays light
function YouTubeVideo({ video, label }: { video: GalleryVideo; label: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-md bg-foreground">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0&playsinline=1`}
            title={label}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Відтворити відео: ${label}`}
            className="group absolute inset-0 flex cursor-pointer items-center justify-center outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60 focus-visible:ring-inset"
          >
            <Image
              src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover:scale-105">
              <Play aria-hidden className="size-7 translate-x-0.5 fill-current" />
            </span>
          </button>
        )}
      </div>
      {video.caption && (
        <figcaption className="mt-2 type-small text-muted-foreground">{video.caption}</figcaption>
      )}
    </figure>
  );
}

// Full-screen viewer on a native <dialog>: Escape closes it, arrows and swipes move between photos
function Lightbox({
  images,
  index,
  onIndex,
  onClose,
  eventTitle,
}: {
  images: GalleryImage[];
  index: number;
  onIndex: Dispatch<SetStateAction<number | null>>;
  onClose: () => void;
  eventTitle: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const image = images[index];
  const many = images.length > 1;
  // From the latest index, so quick repeated presses never skip or stall
  const go = (step: number) => onIndex((current) => ((current ?? 0) + step + images.length) % images.length);
  // Listeners are attached once; they always call the latest `go`
  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    let touchX: number | null = null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goRef.current(-1);
      if (event.key === "ArrowRight") goRef.current(1);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchX = event.touches[0]?.clientX ?? null;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const end = event.changedTouches[0]?.clientX;
      if (touchX !== null && end !== undefined && Math.abs(end - touchX) >= 50)
        goRef.current(end < touchX ? 1 : -1);
      touchX = null;
    };
    dialog.addEventListener("keydown", onKeyDown);
    dialog.addEventListener("touchstart", onTouchStart, { passive: true });
    dialog.addEventListener("touchend", onTouchEnd);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      dialog.removeEventListener("touchstart", onTouchStart);
      dialog.removeEventListener("touchend", onTouchEnd);
      root.style.overflow = previousOverflow;
    };
  }, []);

  if (!image) return null;

  return (
    <dialog
      ref={ref}
      aria-label={`Фото: ${eventTitle}`}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-foreground/95 p-0 text-white backdrop:bg-foreground/80"
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 py-16">
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          <Image
            key={image.id}
            src={image.src}
            alt={image.caption || eventTitle}
            width={image.width}
            height={image.height}
            sizes="100vw"
            unoptimized={image.external}
            className="h-auto max-h-full w-auto max-w-full object-contain"
          />
        </div>
        <p className="min-h-6 max-w-3xl text-center type-body">
          {image.caption}
          {many && (
            <span className="ml-3 text-white/60">
              {index + 1} / {images.length}
            </span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => ref.current?.close()}
        aria-label="Закрити"
        className="absolute top-4 right-4 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/70"
      >
        <X aria-hidden className="size-6" />
      </button>
      {many && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Попереднє фото"
            className="absolute top-1/2 left-2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/70 md:left-6"
          >
            <ChevronLeft aria-hidden className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Наступне фото"
            className="absolute top-1/2 right-2 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-[3px] focus-visible:ring-white/70 md:right-6"
          >
            <ChevronRight aria-hidden className="size-6" />
          </button>
        </>
      )}
    </dialog>
  );
}

// An event's media: videos first, full width; photos in a masonry grid that opens the viewer
export default function GalleryMedia({ media, eventTitle }: { media: Media[]; eventTitle: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const images = media.filter((item): item is GalleryImage => item.kind === "image");
  const videos = media.filter((item): item is GalleryVideo => item.kind === "video");

  return (
    <div className="mt-6 space-y-3">
      {videos.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {videos.map((video) => (
            <YouTubeVideo key={video.id} video={video} label={video.caption || eventTitle} />
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="columns-2 gap-3 md:columns-3">
          {images.map((image, index) => (
            <figure key={image.id} className="mb-3 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={`Відкрити фото${image.caption ? `: ${image.caption}` : ""}`}
                className="block w-full cursor-zoom-in overflow-hidden rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
              >
                <Image
                  src={image.src}
                  alt={image.caption || eventTitle}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 1024px) 300px, (min-width: 768px) 30vw, 50vw"
                  unoptimized={image.external}
                  className="h-auto w-full transition-transform duration-300 hover:scale-[1.03]"
                />
              </button>
              {image.caption && (
                <figcaption className="mt-1.5 type-small text-muted-foreground">{image.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {open !== null && (
        <Lightbox
          images={images}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          eventTitle={eventTitle}
        />
      )}
    </div>
  );
}
