"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import logo from "@/assets/logo.svg";
import logo_mobile from "@/assets/logo-main.svg";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { navLinks, site } from "@/content/site";

import SocialLinks from "./SocialLinks";
import { Button } from "./ui/button";

const MENU_ID = "mobile-menu";

export function Navigation() {
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Only the home page has a dark hero under the header; elsewhere white text would sit on beige
  const solid = scrolled || !isHome;
  // On the home page anchors scroll in place (scroll-margin in globals.css keeps them below the header)
  const sectionHref = (hash: string) => (isHome ? hash : `/${hash}`);

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );

    navLinks.forEach((link) => {
      const element = document.getElementById(link.href.slice(1));
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isHome]);

  // Mobile menu as a modal dialog: Escape closes it, Tab stays inside, the page behind doesn't scroll,
  // and focus returns to the menu button afterwards.
  React.useEffect(() => {
    if (!mobileMenuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const focusable = () => Array.from(menu.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
    menu.querySelector<HTMLElement>("[data-menu-close]")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const toggle = toggleRef.current;
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      toggle?.focus();
    };
  }, [mobileMenuOpen]);

  // Links inside the menu close it; the browser then follows the link
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 flex h-20 w-full items-center justify-between gap-2 px-4 transition-all duration-300 md:px-8 lg:gap-4 xl:gap-6 xl:px-12 2xl:px-20 ${
          solid
            ? "rounded-b-md bg-background text-foreground shadow-md md:h-24"
            : "bg-transparent text-white md:h-36"
        }`}
      >
        <Link href="/" aria-label={`${site.name} — на головну`} className="shrink-0">
          <Image
            src={solid ? logo_mobile : logo}
            alt={site.name}
            priority
            className="h-7 w-auto cursor-pointer md:h-10 2xl:h-12"
          />
        </Link>

        <NavigationMenu className="hidden min-w-0 flex-1 xl:block">
          <NavigationMenuList className="flex justify-center space-x-1 2xl:space-x-3">
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  href={sectionHref(link.href)}
                  aria-current={isHome && `#${activeSection}` === link.href ? "location" : undefined}
                  className="inline-block cursor-pointer bg-transparent px-1 py-2 text-xs font-bold whitespace-nowrap uppercase decoration-primary decoration-2 underline-offset-8 hover:text-inherit hover:underline focus:bg-transparent focus:text-inherit aria-[current=location]:underline 2xl:px-2 2xl:text-sm 2xl:tracking-wide"
                >
                  {link.text}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <Button asChild size="sm" className="hidden shrink-0 xl:inline-flex">
          <Link href="/onboarding">Хочу на курс</Link>
        </Button>

        <button
          ref={toggleRef}
          type="button"
          className="z-50 flex h-6 w-8 flex-col gap-[6px] xl:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Відкрити меню"
          aria-expanded={mobileMenuOpen}
          aria-controls={MENU_ID}
        >
          <span className={`h-[3px] w-full ${solid ? "bg-foreground" : "bg-white"} transition-colors`} />
          <span className={`h-[3px] w-full ${solid ? "bg-foreground" : "bg-white"} transition-colors`} />
          <span className={`h-[3px] w-full ${solid ? "bg-foreground" : "bg-white"} transition-colors`} />
        </button>
      </header>

      {/* Rendered only while open, so the links are not duplicated in the page HTML */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          id={MENU_ID}
          role="dialog"
          aria-modal="true"
          aria-label="Меню"
          className="fixed inset-0 z-[60] animate-in overscroll-contain bg-primary duration-300 fade-in xl:hidden"
        >
          <div className="flex h-dvh flex-col overflow-y-auto">
            {/* Same height and paddings as the header, so the logo and the button stay in place */}
            <div className="flex h-20 flex-shrink-0 items-center justify-between border-b border-white/30 px-4 md:h-24 md:px-8">
              <Link href="/" onClick={closeMenu}>
                <Image src={logo} alt={site.name} className="h-7 w-auto md:h-10" />
              </Link>
              <button
                type="button"
                data-menu-close
                onClick={() => setMobileMenuOpen(false)}
                className="-mr-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md focus-visible:ring-[3px] focus-visible:ring-white/70 focus-visible:outline-none"
                aria-label="Закрити меню"
              >
                <svg
                  aria-hidden
                  className="h-9 w-9 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-shrink-0 flex-col">
              {navLinks.map((link, index) => (
                <React.Fragment key={link.href}>
                  <Link
                    href={sectionHref(link.href)}
                    onClick={closeMenu}
                    className="px-6 py-4 text-xl font-bold tracking-wide text-white uppercase transition-colors hover:bg-white/10"
                  >
                    {link.text}
                  </Link>
                  {index < navLinks.length - 1 && <div className="mx-3 h-px bg-white/30" />}
                </React.Fragment>
              ))}
            </nav>

            <div className="mt-auto flex-shrink-0 space-y-4 px-6 pt-4 pb-6">
              <div className="flex justify-center px-6">
                <Button asChild variant="outlineLight" size="lg">
                  <Link href="/onboarding" onClick={closeMenu}>
                    Хочу на курс
                  </Link>
                </Button>
              </div>

              <div className="pt-2">
                <p className="mb-4 text-center text-xl font-bold tracking-wide text-white uppercase">
                  Наші соцмережі
                </p>
                <SocialLinks className="flex justify-center gap-4 pb-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
