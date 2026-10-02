"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import * as fbq from "@/lib/tracker";

function PixelTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // The initial PageView is sent by the pixel snippet in the layout
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fbq.pageview();
  }, [pathname, searchParams]);

  return null;
}

export default function PixelTracker() {
  return (
    <Suspense fallback={null}>
      <PixelTrackerInner />
    </Suspense>
  );
}
