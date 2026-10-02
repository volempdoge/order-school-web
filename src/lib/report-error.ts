import * as Sentry from "@sentry/nextjs";

// Server-side error reporting. Sends to Sentry when SENTRY_DSN is set; always logs.
export function reportError(error: unknown, tags: Record<string, string> = {}): void {
  console.error(`[${Object.values(tags).join(":") || "error"}]`, error);
  Sentry.captureException(error, { tags });
}
