"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";

type SectionLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  /** "#faq" */
  hash: string;
};

// Smooth scrolling only here, not globally: see docs/architecture.md («Навігація і прокрутка»)
function scrollToSection(event: React.MouseEvent<HTMLAnchorElement>, hash: string) {
  const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  const target = document.getElementById(hash.slice(1));
  if (event.defaultPrevented || modified || !target) return;

  event.preventDefault();
  history.pushState(null, "", hash);
  const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  // After the click: a link in the mobile menu first closes it, which unlocks the page scroll
  setTimeout(() => target.scrollIntoView({ behavior }));
}

// A link to a home page section: scrolls to it on the home page, opens the home page at it elsewhere
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
