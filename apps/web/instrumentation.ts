/**
 * Next.js instrumentation hook. Loads the Sentry SDK for the active runtime
 * only; both configs no-op when NEXT_PUBLIC_SENTRY_DSN is unset.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
