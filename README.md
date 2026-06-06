# Alara

Alara is a voice-first productivity companion for turning an overloaded day into one clear next step. It combines a public marketing site with an authenticated app for onboarding, scheduled clarity calls, task capture, Google Calendar context, Stripe payment status, and Convex-backed state.

This repository is an active product prototype. The code is public-readable, but the package is intentionally marked private and no open-source license has been selected yet.

## Product Direction

Most productivity tools add more lists and more setup. Alara is designed around alignment instead:

- Start with a short conversation about what is on your mind.
- Distill the conversation into one concrete action and a few supporting steps.
- Use calendar context and gentle reminders to make the step realistic.
- Track momentum without turning missed plans into guilt.

## Tech Stack

- **Framework:** Next.js 15, React 19, TypeScript
- **Backend:** Convex functions, database tables, scheduled jobs, and HTTP routes
- **Auth:** Convex Auth / Auth.js with Google OAuth
- **Voice:** ElevenLabs conversational agent integration
- **Calendar:** Google Calendar OAuth and availability reads
- **Payments:** Stripe checkout and webhook fulfillment
- **Styling:** Tailwind CSS 4 with local UI primitives

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- A Convex project
- Google OAuth credentials
- Stripe test credentials
- ElevenLabs API credentials for call features

### Install

```bash
npm install
```

### Configure Environment

Create a local environment file from the template:

```bash
cp .env.example .env.local
```

Fill in the values for your local project. Several server-side values are also read by Convex functions, so set those in Convex as well:

```bash
npx convex env set VARIABLE_NAME value
```

### Run Locally

Run the Next.js app:

```bash
npm run dev
```

In a second terminal, run Convex while developing backend functions:

```bash
npx convex dev
```

Open `http://localhost:3000`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server with Turbopack. |
| `npm run build` | Build the production Next.js app. |
| `npm run start` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the repository. |
| `npm run lint:fix` | Run ESLint and apply automatic fixes. |
| `npm run type-check` | Run TypeScript without emitting files. |
| `npm run deploy` | Run checks and deploy Convex functions. |
| `npm run ship` | Deploy and push the current branch. |

## Project Structure

```text
src/app/                  Next.js App Router pages, layouts, and API routes
src/components/           UI, landing, navigation, settings, calls, and task components
src/hooks/                Client hooks for app data
src/lib/                  Shared client/server helpers
convex/                   Convex schema, functions, integrations, crons, and HTTP routes
docs/                     Architecture and flow documentation
guidelines/               Product, design, architecture, and implementation guidelines
agents/elevenlabs/        ElevenLabs agent prompt and behavior notes
public/                   Static assets, including landing page demo audio
```

## Documentation

- [Authentication Flow](docs/authentication-flow.md)
- [Convex Backend Notes](convex/README.md)
- [Product Description](guidelines/product_description.md)
- [Frontend Architecture](guidelines/architecture/frontend.md)
- [Convex Architecture](guidelines/architecture/convex.md)
- [Color System](guidelines/COLOR_SYSTEM.md)

## Quality Checklist

Before opening a pull request or deploying, run:

```bash
npm run lint
npm run type-check
npm run build
```

If dependencies are not installed yet, run `npm install` first.

## Security

Do not commit `.env*` files, API keys, OAuth secrets, Stripe secrets, webhook secrets, private keys, or production customer data. Use `.env.example` for variable names only.

See [SECURITY.md](SECURITY.md) for reporting and handling guidance.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local development expectations and repository conventions.
