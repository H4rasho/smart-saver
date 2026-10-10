# Testing Guide

SmartSaver uses Playwright for web end-to-end tests and Vitest for
the API. Pure web utilities can use Node's test runner under
`apps/web/test/`; run them with `pnpm test:unit`.

- Put end-to-end tests under `apps/web/e2e/`.
- Group related scenarios with `test.describe()`.
- Use `test.beforeEach()` for shared navigation or setup.
- Prefer role, label, and visible-text locators over implementation-specific selectors.
- Use Playwright's built-in web-first assertions.
- Cover user-visible behavior rather than internal implementation details.
- Add or update tests when a change alters user-visible behavior.

```typescript
import { expect, test } from "@playwright/test";

test.describe("Movements", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/movements");
	});

	test("creates a movement", async ({ page }) => {
		await page.getByRole("button", { name: "Añadir movimiento" }).click();
		await expect(page.getByRole("dialog")).toBeVisible();
	});
});
```

See [Development commands](development-commands.md#tests) for commands that run the suite or a focused subset.

Put API tests under `apps/api/test/`. Test HTTP contracts through exported
request handlers and cover successful responses, unsupported methods, and
unsupported paths.

## Dashboard analytics fixtures

Dashboard unit tests run the actual filtered Drizzle query against in-memory
SQLite with encrypted synthetic values, covering owner isolation without Clerk.
Authenticated browser tests in `e2e/dashboard.spec.ts` require a dedicated Clerk
test user and a storage-state file kept outside version control. They are skipped
explicitly when those prerequisites are absent; the unauthenticated access test
still runs.

Use a **new**, dedicated local database file whose name contains `dashboard-e2e`.
Never point this setup at a real user database. From `apps/web`, set
`TURSO_DATABASE_URL=file:/tmp/dashboard-e2e-<unique>.sqlite`, a test-only
64-hex-character `ENCRYPTION_KEY`, and `DASHBOARD_E2E_USER_ID` to the authenticated
Clerk test user's ID. Run:

```sh
pnpm exec node --import tsx scripts/seed_dashboard_e2e.ts
```

The seed applies existing migrations to the fresh database and adds two owners,
January/February 2024 encrypted fixtures and no historical data before that.
Set `DASHBOARD_E2E_STORAGE_STATE` to that test user's authenticated Playwright
state. Start a fresh Next.js server with the **same** database/key environment
(and the existing Clerk test-instance keys). Do not reuse a running server
connected to another database. Then execute the focused dashboard Chromium suite.
Recent movements still use the API; run the API with matching test configuration
when verifying that section. Dashboard analytics itself stays server-side in web.
