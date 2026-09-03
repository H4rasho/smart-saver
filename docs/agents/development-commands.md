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

## Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:prod
pnpm db:studio
```

## Git Hooks

Lefthook runs Biome against staged files before each commit and stages its fixes.
