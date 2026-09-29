import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { navLinks, site } from "@/content/site";

// Answers with HTTP 404; noindex overrides the layout's "index, follow"
export const metadata: Metadata = {
  title: "Сторінку не знайдено",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center px-6 pt-28 pb-20 md:pt-36">
      <div className="mx-auto w-full max-w-3xl">
        <p aria-hidden className="font-display text-[5rem] leading-none text-primary md:text-[9rem]">
          404
        </p>
        <h1 className="mt-4 type-h2">Сторінку не знайдено</h1>
        <span aria-hidden className="mt-4 block h-1 w-24 rounded-full bg-primary md:mt-5" />
        <p className="mt-6 max-w-2xl type-lead">
          Можливо, посилання застаріло або в адресі є помилка. Почніть з головної сторінки або подайте заявку
          на {site.name}.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">На головну</Link>
          </Button>
          <Button asChild variant="light" size="lg">
            <Link href="/onboarding">Хочу на курс</Link>
          </Button>
        </div>

        <nav aria-label="Розділи сайту" className="mt-12">
          <p className="type-small font-bold tracking-wider uppercase">Або перейдіть до розділу</p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 type-body">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={`/${link.href}`}
                  className="font-bold text-primary-strong underline underline-offset-4 hover:text-foreground"
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
