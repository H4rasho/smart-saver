# SmartSaver

SmartSaver is a personal finance application organized as a pnpm monorepo.

## Applications

- `apps/web`: Next.js application on `http://localhost:3000`
- `apps/api`: Bun API on `http://localhost:3001`

The API exposes `GET /health` and authenticated `POST /users` for user
registration. The welcome flow calls the API to register the user, then saves
categories and starter movements through Next.js. Other Next.js API, MCP,
OAuth, authentication, localization, and database behavior remains in
`apps/web`.

## Requirements

- Node.js 22
- pnpm 10
- Bun 1.3

## Getting Started

Install all workspace dependencies from the repository root:

```bash
pnpm install
```

Put the existing web environment variables in `apps/web/.env.local` for local
development or `apps/web/.env.production` for production operations.
Set `API_URL` in the web environment when the API is not at
`http://localhost:3001`. The API needs `CLERK_SECRET_KEY`,
`TURSO_DATABASE_URL`, and `TURSO_AUTH_TOKEN` in `apps/api/.env`. To enable the
iOS Shortcuts movement endpoint, also configure `SMARTSAVER_SHORTCUT_API_KEY`
and `SMARTSAVER_SHORTCUT_OWNER_CLERK_USER_ID`; use a generated, revocable value
for the API key and never place `CLERK_SECRET_KEY` in a shortcut.

The API movement contract is documented in
[docs/api/movements.md](docs/api/movements.md).

Start both applications:

```bash
pnpm dev
```

Start only one application when needed:

```bash
pnpm dev:web
pnpm dev:api
```

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test:api
pnpm test
pnpm build
```

## Security

Sensitive financial data is encrypted at rest with AES-256-GCM. Generate an
encryption key with:

```bash
node apps/web/scripts/generate_encryption_key.js
```

See [the encryption guide](apps/web/lib/ENCRYPTION_README.md) for details.

## Database

Database commands remain available from the repository root and delegate to
`apps/web`:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:prod
pnpm db:studio
```

See [the deployment guide](docs/DEPLOYMENT.md) for production instructions.
