import "./globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import PixelTracker from "@/components/PixelTracker";
import RevealObserver from "@/components/RevealObserver";
import { site, SITE_URL } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { FB_PIXEL_ID } from "@/lib/tracker";

// WOFF2, subset to Latin + Cyrillic (see src/app/fonts/README.md). Only the weights in use.
const gothamPro = localFont({
  src: [
    { path: "./fonts/gotham-pro-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/gotham-pro-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-gotham-pro",
  display: "swap",
});

// A single face (weight 600). Declaring the full range stops browsers from
// synthesizing a fake bold when a heading asks for font-bold.
const grotesk = localFont({
  src: [{ path: "./fonts/cy-grotesk-wide.woff2", weight: "100 900", style: "normal" }],
  display: "swap",
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ description: site.description, path: "/" }),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  applicationName: site.name,
  keywords: [
    "гурток політології",
    "гурток політології Київ",
    "курси політології для школярів",
    "політологія для старшокласників",
    "курси для учнів 8–11 класів",
    "критичне мислення для підлітків",
    "Київська школа економіки",
    "KSE",
    "підготовка до вступу на політологію",
    "міжнародні відносини для школярів",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "#E6E1D0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${grotesk.variable} ${gothamPro.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables scroll-reveal styles only when JS runs, so content is never hidden without it */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {FB_PIXEL_ID && (
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
            }}
          />
        )}
      </head>
      <body className="antialiased">
        <PixelTracker />
        <RevealObserver />
        <Navigation />
        {children}
        <Footer />
      </body>
      <GoogleAnalytics gaId="G-7D74XW0FZ1" />
    </html>
  );
}
