import * as Sentry from "@sentry/nextjs";

// Server-only error monitoring: no Sentry code is shipped to the browser.
// Enabled when SENTRY_DSN is set (see README).
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" && process.env.NEXT_RUNTIME !== "edge") return;

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    enabled: Boolean(process.env.SENTRY_DSN),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    // Visitors are mostly minors: send the error and its stack only — no user, request or variable data
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
      databaseQueryData: false,
      genAI: { inputs: false, outputs: false },
    },
    tracesSampleRate: 0,
  });
}

export const onRequestError = Sentry.captureRequestError;
