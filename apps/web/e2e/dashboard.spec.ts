import { expect, test } from "@playwright/test";
import { formatCurrencyAmount } from "../app/core/user/lib/user-lib";
const storageState = process.env.DASHBOARD_E2E_STORAGE_STATE;
const fixturesReady =
	!!storageState &&
	process.env.TURSO_DATABASE_URL?.startsWith("file:") &&
	!!process.env.DASHBOARD_E2E_USER_ID;
test.describe("Dashboard with isolated synthetic fixtures", () => {
	test.skip(
		!fixturesReady,
		"Requires an isolated local database, fixture user and Clerk storage state",
	);
	test.use({ storageState: storageState ?? { cookies: [], origins: [] } });
	test("filters update URL and figures and persist after reload", async ({
		page,
	}) => {
		await page.goto("/home?period=custom&from=2024-01-01&to=2024-01-31");
		const overview = page.locator("[data-dashboard-overview]");
		await expect(
			overview.getByText(
				formatCurrencyAmount(100000, "CLP", { maximumFractionDigits: 0 }),
				{ exact: true },
			),
		).toBeVisible();
		await page.getByLabel("Desde").fill("2024-02-01");
		await page.getByLabel("Hasta").fill("2024-02-29");
		await page.getByRole("button", { name: "Aplicar", exact: true }).click();
		await expect(page).toHaveURL(/from=2024-02-01&to=2024-02-29/);
		await expect(
			overview.getByText(
				formatCurrencyAmount(300000, "CLP", { maximumFractionDigits: 0 }),
				{ exact: true },
			),
		).toBeVisible();
		await page.reload();
		await expect(page.getByLabel("Desde")).toHaveValue("2024-02-01");
		await page.getByRole("button", { name: "Período", exact: true }).click();
		await page
			.getByRole("menuitemradio", { name: "Mes anterior", exact: true })
			.click();
		await expect(page).toHaveURL(/period=previous/);
	});
	test("empty period and unavailable savings are explicit", async ({
		page,
	}) => {
		await page.goto("/home?period=custom&from=1901-01-01&to=1901-01-31");
		await expect(
			page.getByText("No hay movimientos en este período."),
		).toBeVisible();
		await expect(
			page.getByText("No disponible", { exact: true }),
		).toBeVisible();
	});
	test("English mobile chart does not overflow", async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/en/home?period=custom&from=2024-01-01&to=2024-02-29");
		await expect(
			page.getByRole("heading", { name: "Income vs. expenses" }),
		).toBeVisible();
		await page.getByText("View chart data", { exact: true }).click();
		await expect(page.getByRole("table").first()).toBeVisible();
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= window.innerWidth,
			),
		).toBe(true);
	});
});
test("unauthenticated visitors cannot access dashboard aggregates", async ({
	page,
}) => {
	await page.goto("/home?period=12");
	await expect(page.locator("[data-dashboard-overview]")).toHaveCount(0);
	await expect(page).not.toHaveURL(/\/home\?/);
});
