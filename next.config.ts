import type { NextConfig } from "next";
import { withNextVideo } from "next-video/process";

const CANONICAL_ORIGIN = "https://polithurtok.com.ua";

// Hosts that may still point at this deployment: send them to the canonical domain
// so search engines consolidate everything on one address.
const LEGACY_HOSTS = ["www.polithurtok.com.ua", "orderschool.online", "www.orderschool.online"];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return LEGACY_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: true,
    }));
  },
};

export default withNextVideo(nextConfig);
