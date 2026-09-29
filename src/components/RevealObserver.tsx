"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// One shared IntersectionObserver for every `[data-reveal]` element on the page.
// Sections stay server components; the animation itself lives in globals.css.
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-inview])");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.setAttribute("data-inview", ""));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-inview", "");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
