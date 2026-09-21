import { describe, expect, test } from "bun:test";

import vercelEntrypoint, { restoreRouteRequest } from "../api/index";

describe("Vercel API entrypoint", () => {
	test("rewrites only the supported root routes", async () => {
		const config = JSON.parse(
			await Bun.file(new URL("../vercel.json", import.meta.url)).text(),
		) as { rewrites: Array<{ source: string; destination: string }> };
		const routes = ["/health", "/users", "/movements", "/movements/shortcut"];

		expect(config.rewrites).toEqual(
			routes.map((route) => ({
				source: route,
				destination: `/api/index?__smartsaver_path=${route}`,
			})),
		);
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
