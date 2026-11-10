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

# Run focused web unit tests
pnpm test:unit

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
# Optional; defaults to gpt-5.6-luna
SMARTSAVER_SHORTCUT_OPENAI_MODEL=gpt-5.6-luna
```

Define them in `apps/api/.env` for local API development.
The web welcome flow uses the server-side `API_URL` setting for registration,
defaulting to `http://localhost:3001`.

All AI flows use only the user's OpenAI key stored encrypted in the database.
Configure it in web Settings before using AI; there is no server-key fallback.
The Shortcut reads the configured owner's key on every request, so rotation or
deletion takes effect without restarting the API. Missing keys return `503`. It defaults to `gpt-6-luna` with
`medium` reasoning effort; optionally set `FILE_EXTRACTION_OPENAI_MODEL` in the
web environment to override the model. The Shortcut parser remains on its own
`gpt-5.6-luna` default. The web and API deployments do not share
environment variables automatically. File import supports PDF, CSV, TXT, JSON,
PNG, JPG, and WebP files up to 10 MB. Office files need preprocessing and are
not accepted as raw model inputs. The Next.js Server Action body limit is set to
11 MB to allow a 10 MB file with multipart overhead. Unknown transactions use
the user's available catch-all category (such as Others or Otros) when one
exists; otherwise they remain uncategorized.

`GET /movements` lists the authenticated user's movements. `POST /movements`
creates one non-recurring movement and accepts `name`, `amount`, `category_id`
(nullable), `movement_type_id`, and `transaction_date` (`YYYY-MM-DD`). Both
routes require a Clerk bearer token and ignore client-supplied owner IDs. The
API must use the same 64-hex-character `ENCRYPTION_KEY` as the web app to read
existing encrypted movements; set it in `apps/api/.env`. The web create form
and movement lists call the API through the server-side `API_URL`; import,
edit, delete, and totals still use the web database path.

`GET /health` does not require database or Clerk configuration.

## MCP server

The web app serves a Clerk-authenticated MCP endpoint at `/mcp`. Configure the
Clerk instance under **Agents → MCP servers** with the **exact** endpoint URL
(for example, `http://localhost:3000/mcp` locally or a stable HTTPS URL in
production). Set `MCP_RESOURCE_URL` in the web environment to the same full
URL for every hosted deployment. Local development defaults to
`http://localhost:3000/mcp`; non-development requests fail closed without the
setting. Do not use a changing Vercel preview URL unless it is separately
registered in Clerk. The server requires OAuth `profile` and `email` scopes;
configure these as default scopes in Clerk if the client does not request them.
The `/mcp` token verifier requires `aud` to match `MCP_RESOURCE_URL` and accepts
only Clerk OAuth access tokens, not browser sessions or arbitrary bearer tokens.
The `.well-known` OAuth metadata endpoints remain public. Use Node.js 22.18 or
later, as required by the [Clerk MCP guide](https://clerk.com/docs/nextjs/guides/ai/mcp/build-mcp-server).

The MCP route uses `mcp-handler` 2 and the MCP SDK 2 server. `zod-mcp` is an
isolated Zod 4 alias for MCP tool schemas; the application keeps Zod 3. The
root pnpm package extension pins Zod 3 for `@hookform/resolvers` so its
existing form types do not accidentally resolve through Zod 4.

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

## Dashboard Charts

The dashboard uses `@tanstack/charts` 1.1.0, with React imported from
`@tanstack/charts/react` (React 18/19 peer compatibility). Chart definitions,
scales and tooltip use the official package exports. See the
[React quick start](https://tanstack.com/charts/latest/docs/framework/react/quick-start).
Periods use `America/Santiago` calendar days, as file imports do. URL parameters
are `period=current|previous|3|6|12|custom`, with inclusive `from` and `to`
(`YYYY-MM-DD`) for custom ranges. Aggregations use transaction dates and decrypt
amounts only after filtering by the authenticated owner and period.
