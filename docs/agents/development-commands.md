# Development Commands

Use `pnpm` as the package manager.

## Application

```bash
# Start the web and API applications
pnpm dev

# Start one application
pnpm dev:web
pnpm dev:api

pnpm build
pnpm start
pnpm lint
pnpm typecheck
```

## Tests

```bash
# Run all Playwright tests
pnpm test

# Run the Bun API tests
pnpm test:api

# Run one test file
pnpm --filter @smart-saver/web exec playwright test e2e/homepage.spec.ts

# Run tests matching a title
pnpm --filter @smart-saver/web exec playwright test --grep "homepage"

# Run tests in headed mode
pnpm --filter @smart-saver/web exec playwright test --headed

# Run tests in one browser project
pnpm --filter @smart-saver/web exec playwright test --project=chromium

# Open Playwright UI mode
pnpm --filter @smart-saver/web exec playwright test --ui
```

The web application runs on `http://localhost:3000`. The API runs on
`http://localhost:3001` and exposes `GET /health`.

## API Configuration

`POST /users` registers the authenticated Clerk user with a `currency`. It
requires these environment variables:

```bash
CLERK_SECRET_KEY=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

Define them in `apps/api/.env` for local API development.
The web welcome flow uses the server-side `API_URL` setting for registration,
defaulting to `http://localhost:3001`.

`GET /movements` lists the authenticated user's movements. `POST /movements`
creates one non-recurring movement and accepts `name`, `amount`, `category_id`
(nullable), `movement_type_id`, and `transaction_date` (`YYYY-MM-DD`). Both
routes require a Clerk bearer token and ignore client-supplied owner IDs. The
API must use the same 64-hex-character `ENCRYPTION_KEY` as the web app to read
existing encrypted movements; set it in `apps/api/.env`. The web create form
and movement lists call the API through the server-side `API_URL`; import,
edit, delete, and totals still use the web database path.

`GET /health` does not require database or Clerk configuration.

## Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:prod
pnpm db:studio
```

## Git Hooks

Lefthook runs Biome against staged files before each commit and stages its fixes.
