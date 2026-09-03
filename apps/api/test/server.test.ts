import { describe, expect, test } from "bun:test";

import { handleRequest } from "../src/server";

describe("GET /health", () => {
	test("returns the health status", async () => {
		const response = handleRequest(
			new Request("http://localhost:3001/health", { method: "GET" }),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("application/json");
		expect(await response.text()).toBe('{"status":"ok"}');
	});

	test.each([
		["POST", "/health"],
		["GET", "/unsupported"],
	])("returns 404 for %s %s", async (method, pathname) => {
		const response = handleRequest(
			new Request(`http://localhost:3001${pathname}`, { method }),
		);

		expect(response.status).toBe(404);
		expect(await response.text()).toBe("Not Found");
	});
});
