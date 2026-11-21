import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Keep error reporting completely inert unless a DSN is configured. No PII is
// attached to events; message text is never sent to Sentry.
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
