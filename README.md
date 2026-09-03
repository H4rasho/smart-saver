# SmartSaver

SmartSaver is a personal finance application organized as a pnpm monorepo.

## Applications

- `apps/web`: Next.js application on `http://localhost:3000`
- `apps/api`: Bun API on `http://localhost:3001`

The API currently exposes `GET /health`. Existing Next.js API, MCP, OAuth,
authentication, localization, and database behavior remains in `apps/web`.

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
