# Testing Guide

SmartSaver uses Playwright for web end-to-end tests and Bun's test runner for
the API.

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
