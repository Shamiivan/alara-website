# Convex Backend

This directory contains Alara's Convex backend: schema definitions, auth setup, application functions, scheduled jobs, integrations, and generated Convex client types.

## Responsibilities

- Store users, calls, conversations, tasks, payments, telemetry, feature flags, and Google OAuth tokens.
- Gate authenticated app flows through Convex Auth and user status queries.
- Run clarity-call workflows and scheduled reminders.
- Integrate with ElevenLabs, Google Calendar, and Stripe.
- Expose Convex HTTP routes for external callbacks and webhooks.

## Directory Guide

```text
auth.ts / auth.config.ts        Convex Auth provider configuration
schema.ts                       Database tables and indexes
http.ts                         Convex HTTP routing
crons.ts                        Scheduled job registration
core/                           Product-domain functions
integrations/                   External service adapters
admin/                          Admin-only helpers
system/telemetry/               Telemetry storage
utils/                          Shared backend utilities
_generated/                     Generated Convex API and type files
```

## Local Development

Run Convex locally while developing:

```bash
npx convex dev
```

Regenerate Convex types after schema or function changes:

```bash
npx convex codegen
```

Deploy backend changes:

```bash
npx convex deploy
```

## Environment

Convex functions read secrets from Convex environment variables. Keep real values out of source control and set them with:

```bash
npx convex env set VARIABLE_NAME value
```

Common variables include Google OAuth credentials, Stripe secrets, ElevenLabs credentials, `SITE_URL`, `CONVEX_URL`, and webhook secrets. See the root `.env.example` for the full list of expected names.

## Conventions

- Keep product-domain logic under `core/`.
- Keep third-party API calls under `integrations/`.
- Validate public function arguments with `convex/values`.
- Prefer small query, mutation, and action files grouped by feature.
- Update generated types when backend contracts change.
