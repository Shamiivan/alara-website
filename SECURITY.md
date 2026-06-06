# Security

## Reporting

If you find a security issue, do not open a public issue with exploit details. Contact the repository owner privately and include:

- A concise description of the issue
- Reproduction steps
- Impacted routes, functions, or integrations
- Any relevant logs or screenshots with secrets removed

## Secret Handling

Never commit:

- `.env*` files with real values
- OAuth client secrets
- Stripe secret or webhook keys
- ElevenLabs API keys
- Convex deployment secrets
- Private keys or certificates
- Production customer data

Use `.env.example` for variable names only. Store real values in local environment files, deployment settings, and Convex environment variables.

## Data Handling

This app touches authentication, calendar, payment, call, task, and transcript data. Treat all user-specific data as private. Keep demos synthetic and remove identifying information before sharing logs, screenshots, or sample payloads.
