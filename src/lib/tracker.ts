export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// The pixel loads after hydration (or not at all without FB_PIXEL_ID / with an ad blocker),
// so every call must tolerate a missing `fbq`.
function track(...args: unknown[]): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

export const pageview = (): void => {
  track("track", "PageView");
};

export const event = (name: string, options: Record<string, unknown> = {}): void => {
  track("track", name, options);
};
