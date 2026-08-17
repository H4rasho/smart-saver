# Development Commands

Use `pnpm` as the package manager.

## Application

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Tests

```bash
# Run all Playwright tests
pnpm test

# Run one test file
pnpm playwright test e2e/homepage.spec.ts

# Run tests matching a title
pnpm playwright test --grep "homepage"

# Run tests in headed mode
pnpm playwright test --headed

# Run tests in one browser project
pnpm playwright test --project=chromium

# Open Playwright UI mode
pnpm playwright test --ui
```

## Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:prod
pnpm db:studio
```

## Git Hooks

Lefthook runs Biome against staged files before each commit and stages its fixes.
