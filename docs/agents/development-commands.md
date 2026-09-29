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

# Run the Node.js API tests
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

The iOS Shortcuts endpoint additionally requires:

```bash
SMARTSAVER_SHORTCUT_API_KEY=
SMARTSAVER_SHORTCUT_OWNER_CLERK_USER_ID=
SMARTSAVER_SHORTCUT_TIME_ZONE=America/Santiago
OPENAI_API_KEY=
# Optional; defaults to gpt-5.6-luna
SMARTSAVER_SHORTCUT_OPENAI_MODEL=gpt-5.6-luna
```

Define them in `apps/api/.env` for local API development.
The web welcome flow uses the server-side `API_URL` setting for registration,
defaulting to `http://localhost:3001`.

The web file-import action uses the user's OpenAI key when present, otherwise
`OPENAI_API_KEY` from the web environment. It defaults to `gpt-5.6-luna`, like
the API Shortcut parser; optionally set `FILE_EXTRACTION_OPENAI_MODEL` in the
web environment to override it. The web and API deployments do not share
environment variables automatically. File import supports PDF, CSV, TXT, JSON,
PNG, JPG, and WebP files up to 10 MB. Office files need preprocessing and are
not accepted as raw model inputs. The Next.js Server Action body limit is set to
11 MB to allow a 10 MB file with multipart overhead.

`GET /movements` lists the authenticated user's movements. `POST /movements`
creates one non-recurring movement and accepts `name`, `amount`, `category_id`
(nullable), `movement_type_id`, and `transaction_date` (`YYYY-MM-DD`). Both
routes require a Clerk bearer token and ignore client-supplied owner IDs. The
API must use the same 64-hex-character `ENCRYPTION_KEY` as the web app to read
existing encrypted movements; set it in `apps/api/.env`. The web create form
and movement lists call the API through the server-side `API_URL`; import,
edit, delete, and totals still use the web database path.

`GET /health` does not require database or Clerk configuration.

`POST /movements/shortcut` uses the `X-SmartSaver-Shortcut-Key` header and the
server-side `SMARTSAVER_SHORTCUT_API_KEY` value. The server always assigns the
configured `SMARTSAVER_SHORTCUT_OWNER_CLERK_USER_ID` as the movement owner and
accepts `{ "text": "..." }`. The API uses server-side OpenAI structured output,
then resolves category and movement type names against the configured owner's
database references before reusing normal movement validation and persistence.
Relative dates use `SMARTSAVER_SHORTCUT_TIME_ZONE`. Do not put
`CLERK_SECRET_KEY` or `OPENAI_API_KEY` in an iOS Shortcut. See
[the movement API reference](../api/movements.md).

## Database

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:migrate:prod
pnpm db:studio
```

## Git Hooks

Lefthook runs Biome against staged files before each commit and stages its fixes.
