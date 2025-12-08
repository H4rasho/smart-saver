import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test("should load homepage successfully", async ({ page }) => {
		// Verify page title
		await expect(page).toHaveTitle(
			"SmartSaver - Gestión Inteligente de Finanzas Personales",
		);

		// Verify URL
		expect(page.url()).toBe("http://localhost:3000/");
	});

	test("should display main heading and hero section", async ({ page }) => {
		// Check main heading
		const heading = page.getByRole("heading", {
			name: "Controla tus gastos como nunca antes",
			level: 1,
		});
		await expect(heading).toBeVisible();

		// Check description paragraph
		const description = page.getByText(
			"La app más intuitiva para gestionar tus finanzas personales",
		);
		await expect(description).toBeVisible();

		// Check CTA buttons
		await expect(
			page.getByRole("button", { name: "Comenzar Gratis" }),
		).toBeVisible();
		await expect(page.getByRole("button", { name: "Ver Demo" })).toBeVisible();
	});

	test("should display header with logo and login button", async ({ page }) => {
		// Check SmartSaver logo/text
		await expect(page.getByText("SmartSaver").first()).toBeVisible();

		// Check login button
		await expect(
			page.getByRole("button", { name: "Iniciar Sesión" }),
		).toBeVisible();
	});

	test("should display features section", async ({ page }) => {
		// Check features section heading
		const featuresHeading = page.getByRole("heading", {
			name: "Todo lo que necesitas en una app",
			level: 2,
		});
		await expect(featuresHeading).toBeVisible();

		// Check all 6 feature cards
		await expect(
			page.getByRole("heading", { name: "Seguimiento Automático", level: 3 }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Análisis Inteligente", level: 3 }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Seguridad Total", level: 3 }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Mobile First", level: 3 }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Presupuestos Smart", level: 3 }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Notificaciones", level: 3 }),
		).toBeVisible();
	});

	test('should open sign-in dialog when clicking "Iniciar Sesión"', async ({
		page,
	}) => {
		// Click login button
		await page.getByRole("button", { name: "Iniciar Sesión" }).click();

		// Verify dialog is visible
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		// Verify dialog content
		await expect(
			page.getByRole("heading", { name: "Sign in to save-ai", level: 1 }),
		).toBeVisible();
		await expect(
			page.getByText("Welcome back! Please sign in to continue"),
		).toBeVisible();

		// Check authentication options
		await expect(
			page.getByRole("button", { name: "Sign in with GitHub" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Sign in with Google" }),
		).toBeVisible();

		// Check email/password fields
		await expect(
			page.getByRole("textbox", { name: "Email address" }),
		).toBeVisible();
		await expect(page.getByPlaceholder("Enter your password")).toBeVisible();

		// Check continue button
		await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
	});

	test('should open sign-in dialog when clicking "Comenzar Gratis"', async ({
		page,
	}) => {
		// Click the main CTA button
		await page.getByRole("button", { name: "Comenzar Gratis" }).click();

		// Verify dialog is visible
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		// Verify it's the sign-in dialog
		await expect(
			page.getByRole("heading", { name: "Sign in to save-ai", level: 1 }),
		).toBeVisible();
	});

	test("should close sign-in dialog when clicking close button", async ({
		page,
	}) => {
		// Open dialog
		await page.getByRole("button", { name: "Iniciar Sesión" }).click();

		// Verify dialog is open
		const dialog = page.getByRole("dialog");
		await expect(dialog).toBeVisible();

		// Close dialog
		await page.getByRole("button", { name: "Close modal" }).click();

		// Verify dialog is closed
		await expect(dialog).not.toBeVisible();
	});

	test("should display CTA section at bottom", async ({ page }) => {
		// Check bottom CTA heading
		const ctaHeading = page.getByRole("heading", {
			name: "¿Listo para tomar control de tus finanzas?",
			level: 2,
		});
		await expect(ctaHeading).toBeVisible();

		// Check bottom CTA buttons
		await expect(
			page.getByRole("button", { name: "Crear Cuenta Gratis" }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "¿Ya tienes cuenta? Inicia Sesión" }),
		).toBeVisible();

		// Check trust indicators
		await expect(
			page.getByText(
				"Sin tarjeta de crédito • Gratis por 30 días • Cancela cuando quieras",
			),
		).toBeVisible();
	});
});
