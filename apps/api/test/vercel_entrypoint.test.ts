import { readFile, readdir } from "node:fs/promises";

import { describe, expect, test } from "vitest";

import vercelEntrypoint, { restoreRouteRequest } from "../api/index";

describe("Vercel API entrypoint", () => {
	test("rewrites only the supported root routes", async () => {
		const config = JSON.parse(
			await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
		) as {
			bunVersion?: string;
			rewrites: Array<{ source: string; destination: string }>;
		};
		const packageManifest = JSON.parse(
			await readFile(new URL("../package.json", import.meta.url), "utf8"),
		) as { type?: string };
		const routes = ["/health", "/users", "/movements", "/movements/shortcut"];
		expect(config.bunVersion).toBeUndefined();
		expect(packageManifest.type).toBe("module");

		expect(config.rewrites).toEqual(
			routes.map((route) => ({
				source: route,
				destination: `/api/index?__smartsaver_path=${route}`,
			})),
		);
	});

	test("uses explicit extensions for every API ESM relative import", async () => {
		const sourceRoot = new URL("../src/", import.meta.url);
		const sourceFiles = (await readdir(sourceRoot, { recursive: true })).filter(
			(path) => path.endsWith(".ts"),
		);
		const extensionlessImport =
			/(?:from|import\(\s*)["'](\.{1,2}\/[^"']+)["']/g;
		const offenders: string[] = [];

		for (const sourceFile of sourceFiles) {
			const source = await readFile(new URL(sourceFile, sourceRoot), "utf8");
			for (const match of source.matchAll(extensionlessImport)) {
				offenders.push(`${sourceFile}: ${match[1]}`);
			}
		}

		expect(offenders).toEqual([]);
	});

	test("routes rewritten health requests without forwarding the internal parameter", async () => {
		const request = new Request(
			"https://api.example.test/api/index?foo=one&__smartsaver_path=/health&foo=two",
		);
		const restored = restoreRouteRequest(request);

		expect(restored).not.toBeNull();
		expect(new URL(restored?.url ?? "").pathname).toBe("/health");
		expect(new URL(restored?.url ?? "").search).toBe("?foo=one&foo=two");

		const response = await vercelEntrypoint.fetch(request);
		expect(response.status).toBe(200);
		expect(await response.text()).toBe('{"status":"ok"}');
	});

	test.each(["/users", "/movements"])(
		"restores the %s pathname",
		(pathname) => {
			const request = new Request(
				`https://api.example.test/api/index?__smartsaver_path=${pathname}`,
			);
			expect(new URL(restoreRouteRequest(request)?.url ?? "").pathname).toBe(
				pathname,
			);
		},
	);

	test("preserves method, headers, and body for a protected route", async () => {
		const request = new Request(
			"https://api.example.test/api/index?__smartsaver_path=/movements/shortcut&ref=ios",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-SmartSaver-Shortcut-Key": "test-key",
				},
				body: '{"name":"Groceries"}',
			},
		);
		const restored = restoreRouteRequest(request);

		expect(restored).not.toBeNull();
		expect(restored?.method).toBe("POST");
		expect(restored?.headers.get("X-SmartSaver-Shortcut-Key")).toBe("test-key");
		expect(new URL(restored?.url ?? "").pathname).toBe("/movements/shortcut");
		expect(new URL(restored?.url ?? "").search).toBe("?ref=ios");
		expect(await restored?.text()).toBe('{"name":"Groceries"}');
	});

	test.each([
		"https://api.example.test/api/index",
		"https://api.example.test/api/index?__smartsaver_path=/unknown",
		"https://api.example.test/api/index?__smartsaver_path=/health&__smartsaver_path=/movements/shortcut",
		"https://api.example.test/unknown?__smartsaver_path=/health",
	])("rejects unsupported function requests: %s", async (url) => {
		const response = await vercelEntrypoint.fetch(new Request(url));
		expect(response.status).toBe(404);
	});

	test("keeps the original pathname if Vercel preserves it", async () => {
		const response = await vercelEntrypoint.fetch(
			new Request(
				"https://api.example.test/health?__smartsaver_path=/health&check=1",
			),
		);
		expect(response.status).toBe(200);
	});
});
