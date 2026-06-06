# Contributing

Alara is an active prototype. Keep contributions focused, documented, and easy to review.

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local`.
3. Add the matching Convex environment variables with `npx convex env set`.
4. Run `npm run dev` and `npx convex dev` in separate terminals.

## Development Standards

- Read the relevant files in `guidelines/` before changing product behavior, UI patterns, or backend architecture.
- Keep changes scoped to the feature or cleanup being addressed.
- Do not commit secrets, local environment files, production customer data, or generated build output.
- Update README or docs when setup, scripts, routes, integrations, or environment variables change.
- Regenerate Convex types when schema or function contracts change.

## Before Review

Run the lightweight checks:

```bash
npm run lint
npm run type-check
npm run build
```

If a check cannot run locally, note why in the pull request.
