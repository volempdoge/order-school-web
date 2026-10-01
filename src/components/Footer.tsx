import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.svg";
import { Button } from "@/components/ui/button";
import { navLinks, site } from "@/content/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-foreground text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 md:px-8 md:py-16 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <Link href="/" aria-label={`${site.name} — на головну`}>
            <Image src={logo} alt={site.name} className="h-10 w-auto" />
          </Link>
          <p className="type-small text-white/75">{site.shortDescription}</p>
        </div>

        <nav aria-label="Розділи сайту">
          <p className="mb-4 type-small font-bold tracking-wider uppercase">Про гурток</p>
          <ul className="space-y-2 type-small text-white/80">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={`/${link.href}`} className="underline-offset-4 hover:text-white hover:underline">
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-4 type-small font-bold tracking-wider uppercase">Контакти</p>
          <ul className="space-y-2 type-small text-white/80">
            <li>
              <a
                href={site.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-white hover:underline"
              >
                Telegram
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-white hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.email}`}
                className="underline-offset-4 hover:text-white hover:underline"
              >
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 type-small font-bold tracking-wider uppercase">Адреса</p>
          <address className="type-small text-white/80 not-italic">
            {site.address.place}
            <br />
            {site.address.street}, {site.address.city}, {site.address.postalCode}
          </address>
          <Button asChild variant="light" size="sm" className="mt-6">
            <Link href="/onboarding">Хочу на курс</Link>
          </Button>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-white/70 md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            © {year} {site.fullName}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="underline-offset-4 hover:text-white hover:underline">
              Політика конфіденційності
            </Link>
            {/* A route handler, not a page: a plain link, no client-side navigation */}
            <a
              href="/index.md"
              type="text/markdown"
              className="underline-offset-4 hover:text-white hover:underline"
            >
              Текстова версія (index.md)
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
