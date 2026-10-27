"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

type SectionLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  /** "#faq" */
  hash: string;
};

// Smooth scrolling lives here, not in a global `scroll-behavior: smooth`: Next.js scrolls a new page to
// the top through the same CSS, so a global rule made every page change crawl up from the old position.
function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, hash: string) {
  const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  const target = document.getElementById(hash.slice(1));
  if (event.defaultPrevented || modified || !target) return;

  event.preventDefault();
  history.pushState(null, "", hash);
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  // After the click is handled: a link in the mobile menu first closes it, which unlocks the page scroll
  setTimeout(() => target.scrollIntoView({ behavior }));
}

// A link to a home page section (scroll-margin in globals.css keeps it below the header). On the home
// page it scrolls there smoothly; elsewhere it opens the home page right at the section.
export default function SectionLink({ hash, onClick, ...props }: SectionLinkProps) {
  const isHome = usePathname() === "/";
  if (!isHome) return <Link href={`/${hash}`} onClick={onClick} {...props} />;

  return (
    <a
      href={hash}
      onClick={(event) => {
        onClick?.(event);
        scrollToSection(event, hash);
      }}
      {...props}
    />
  );
}
