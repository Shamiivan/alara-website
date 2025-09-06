'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// If you already centralize tokens, adjust the import path:
import { TOKENS } from '@/components/tokens';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
;

export default function Error({ error, reset }: Props) {
  const router = useRouter();

  // Replace with your logger (Sentry, LogRocket, Convex log, etc.)
  function reportError(e: Error & { digest?: string }) {
    // send to your error reporting service
    // e.message, e.stack, e.digest
    // Example: Sentry.captureException(e)
    console.error('[dashboard:error]', e);
  }

  useEffect(() => {
    reportError(error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-[60vh] flex items-center justify-center p-6"
      style={{ background: TOKENS.bg }}
    >
      <div
        className="w-full max-w-xl rounded-2xl p-6 md:p-8 shadow"
        style={{
          background: TOKENS.cardBg,
          boxShadow: TOKENS.shadow as string,
          border: `1px solid ${TOKENS.border}`,
          borderRadius: TOKENS.radius,
        }}
      >
        {/* Tiny bit of personality, not too much */}
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: TOKENS.accent }}
            aria-hidden="true"
          >
            <span className="text-2xl">🧭</span>
          </div>
          <div className="flex-1">
            <h1
              className="text-xl md:text-2xl font-semibold mb-1"
              style={{ color: TOKENS.text }}
            >
              We hit a snag while tidying your plan.
            </h1>
            <p className="mb-4" style={{ color: TOKENS.subtext }}>
              You’re doing better than you think. One tap and we’ll try again.
            </p>

            {/* Primary action = one clear path */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={reset}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-all"
                style={{
                  background: TOKENS.primary,
                  color: '#FFFFFF',
                  boxShadow: TOKENS.shadow as string,
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform =
                    'translateY(1px)';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = '';
                }}
              >
                Try again
              </button>

              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium border transition-all"
                style={{
                  borderColor: TOKENS.border,
                  color: TOKENS.text,
                  background: TOKENS.cardBg,
                }}
              >
                Refresh
              </button>

              <Link
                href="/app/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium border transition-all"
                style={{
                  borderColor: TOKENS.border,
                  color: TOKENS.text,
                  background: TOKENS.cardBg,
                }}
              >
                Go to dashboard
              </Link>
            </div>

            {/* Helpful meta for support / debugging */}
            {(error?.digest || isDev) && (
              <div
                className="mt-5 text-sm rounded-xl p-3"
                style={{ background: TOKENS.accent }}
              >
                <div style={{ color: TOKENS.subtext }}>
                  <strong>Technical details:</strong>
                  {error?.digest ? (
                    <div className="mt-1">Error ID: <code>{error.digest}</code></div>
                  ) : null}
                  {isDev && (
                    <>
                      <div className="mt-1">
                        <code>{error?.message}</code>
                      </div>
                      {error?.stack && (
                        <details className="mt-1">
                          <summary>Stack trace</summary>
                          <pre className="mt-2 overflow-auto">{error.stack}</pre>
                        </details>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Gentle nudge, in your voice */}
            <p className="mt-6 text-sm" style={{ color: TOKENS.subtext }}>
              Tip: plans change — that’s normal. We’ll adapt with you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
