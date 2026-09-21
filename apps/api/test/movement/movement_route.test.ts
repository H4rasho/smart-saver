import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { describe, expect, test } from "vitest";

import {
	decrypt,
	decryptNumber,
	encrypt,
	encryptNumber,
} from "../../../web/lib/encryption";
import { Movements } from "../../src/movement/application/movements";
import { DrizzleMovementRepository } from "../../src/movement/infrastructure/persistence/drizzle_movement_repository";
import { createMovementRoute } from "../../src/movement/presentation/http/movement_route";
import {
	SHORTCUT_API_KEY_HEADER,
	createShortcutMovementRoute,
} from "../../src/movement/presentation/http/shortcut_movement_route";
import type { IdentityProvider } from "../../src/user/application/identity_provider";

const KEY = "0123456789abcdef".repeat(4);
const SHORTCUT_API_KEY = "shortcut-test-key";
const SHORTCUT_OWNER_ID = "user-a";
process.env.ENCRYPTION_KEY = KEY;

async function createHarness(shortcutOwnerId = SHORTCUT_OWNER_ID) {
	const client = createClient({ url: ":memory:" });
	await client.execute(
		"CREATE TABLE movements (id INTEGER PRIMARY KEY, clerk_id TEXT, category_id INTEGER, movement_type_id INTEGER, name TEXT, amount REAL, is_recurring INTEGER, recurrence_period TEXT, recurrence_start TEXT, recurrence_end TEXT, transaction_date TEXT, created_at TEXT)",
	);
	await client.execute(
		"CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL, clerk_id TEXT)",
	);
	await client.execute(
		"CREATE TABLE movement_types (id INTEGER PRIMARY KEY, name TEXT NOT NULL)",
	);
	await client.execute(
		"INSERT INTO movement_types (id, name) VALUES (3, 'EXPENSE')",
	);
	await client.execute(
		"INSERT INTO categories (id, name, clerk_id) VALUES (1, 'Mine', 'user-a'), (2, 'Other', 'user-b')",
	);
	const identityProvider: IdentityProvider = {
		async getUser(token) {
			return token === "a" || token === "b"
				? { id: `user-${token}`, name: token, email: `${token}@example.com` }
				: null;
		},
	};
	const route = createMovementRoute({
		identityProvider,
		movements: new Movements(new DrizzleMovementRepository(drizzle(client))),
	});
	const shortcutRoute = createShortcutMovementRoute({
		apiKey: SHORTCUT_API_KEY,
		ownerUserId: shortcutOwnerId,
		movements: new Movements(new DrizzleMovementRepository(drizzle(client))),
	});
	const request = (method: "GET" | "POST", token?: string, body?: object) =>
		route(
			new Request("http://localhost:3001/movements", {
				method,
				headers: token
					? {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						}
					: undefined,
				body: body ? JSON.stringify(body) : undefined,
			}),
		);
	const shortcutRequest = (body?: object, apiKey?: string) =>
		shortcutRoute(
			new Request("http://localhost:3001/movements/shortcut", {
				method: "POST",
				headers: apiKey
					? {
							[SHORTCUT_API_KEY_HEADER]: apiKey,
							"Content-Type": "application/json",
						}
					: undefined,
				body: body ? JSON.stringify(body) : undefined,
			}),
		);
	return { client, request, shortcutRequest };
}

const validMovement = {
	name: "Groceries",
	amount: 120.5,
	category_id: 1,
	movement_type_id: 3,
	transaction_date: "2026-09-20",
};

describe("/movements HTTP contract", () => {
	test("rejects missing and invalid authentication", async () => {
		const { request } = await createHarness();
		expect((await request("GET")).status).toBe(401);
		expect((await request("POST", "invalid", validMovement)).status).toBe(401);
	});

	test("requires the dedicated shortcut API key", async () => {
		const { shortcutRequest } = await createHarness();
		expect((await shortcutRequest(validMovement)).status).toBe(401);
		expect((await shortcutRequest(validMovement, "invalid-key")).status).toBe(
			401,
		);
	});

	test("creates shortcut movements for the configured owner only", async () => {
		const { client, shortcutRequest } = await createHarness();
		const response = await shortcutRequest(
			{
				...validMovement,
				userId: "user-b",
				clerk_id: "user-b",
			},
			SHORTCUT_API_KEY,
		);

		expect(response.status).toBe(201);
		expect((await response.json()).clerk_id).toBe(SHORTCUT_OWNER_ID);
		const [row] = (await client.execute("SELECT clerk_id FROM movements")).rows;
		expect(row?.clerk_id).toBe(SHORTCUT_OWNER_ID);
	});

	test("does not create a shortcut movement without an owner configuration", async () => {
		const { client, shortcutRequest } = await createHarness("");
		const response = await shortcutRequest(validMovement, SHORTCUT_API_KEY);

		expect(response.status).toBe(503);
		expect(
			(await client.execute("SELECT id FROM movements")).rows,
		).toHaveLength(0);
	});

	test("reuses movement validation and owner-scoped reference checks", async () => {
		const { client, shortcutRequest } = await createHarness();
		expect(
			(
				await shortcutRequest(
					{ ...validMovement, transaction_date: "2026-02-30" },
					SHORTCUT_API_KEY,
				)
			).status,
		).toBe(422);
		expect(
			(
				await shortcutRequest(
					{ ...validMovement, category_id: 2 },
					SHORTCUT_API_KEY,
				)
			).status,
		).toBe(422);
		expect(
			(await client.execute("SELECT id FROM movements")).rows,
		).toHaveLength(0);
	});

	test("creates encrypted data and lists only the authenticated owner's rows", async () => {
		const { client, request } = await createHarness();
		const created = await request("POST", "a", {
			...validMovement,
			clerk_id: "user-b",
		});
		expect(created.status).toBe(201);
		expect((await created.json()).clerk_id).toBe("user-a");
		const [row] = (
			await client.execute("SELECT clerk_id, name, amount FROM movements")
		).rows;
		expect(row.clerk_id).toBe("user-a");
		expect(String(row.name)).not.toContain("Groceries");
		expect(String(row.amount).split(":")).toHaveLength(3);
		expect(decrypt(String(row.name))).toBe("Groceries");
		expect(decryptNumber(String(row.amount))).toBe(120.5);
		expect((await (await request("GET", "a")).json())[0]).toMatchObject({
			name: "Groceries",
			amount: 120.5,
			category_name: "Mine",
		});
		expect(await (await request("GET", "b")).json()).toEqual([]);
	});

	test("reads rows encrypted by the existing web codec", async () => {
		const { client, request } = await createHarness();
		await client.execute({
			sql: "INSERT INTO movements (clerk_id, category_id, movement_type_id, name, amount, is_recurring, transaction_date, created_at) VALUES (?, ?, 3, ?, ?, 0, '2026-09-20', '2026-09-20T00:00:00Z')",
			args: ["user-a", 1, encrypt("Web movement"), encryptNumber(19.75)],
		});
		expect(await (await request("GET", "a")).json()).toMatchObject([
			{ name: "Web movement", amount: 19.75 },
		]);
	});

	test("rejects another user's category and nonexistent type", async () => {
		const { request } = await createHarness();
		expect(
			(await request("POST", "a", { ...validMovement, category_id: 2 })).status,
		).toBe(422);
		expect(
			(await request("POST", "a", { ...validMovement, movement_type_id: 999 }))
				.status,
		).toBe(422);
	});

	test("rejects malformed dates and amounts before persistence", async () => {
		const { client, request } = await createHarness();
		expect(
			(
				await request("POST", "a", {
					...validMovement,
					transaction_date: "2026-02-30",
				})
			).status,
		).toBe(422);
		expect(
			(await request("POST", "a", { ...validMovement, amount: -1 })).status,
		).toBe(422);
		expect(
			(await client.execute("SELECT id FROM movements")).rows,
		).toHaveLength(0);
	});

	test("reads legacy plaintext movement rows", async () => {
		const { client, request } = await createHarness();
		await client.execute(
			"INSERT INTO movements (clerk_id, category_id, movement_type_id, name, amount, is_recurring, transaction_date, created_at) VALUES ('user-a', 1, 3, 'Legacy', 42.5, 0, '2026-09-19', '2026-09-19T00:00:00Z')",
		);
		expect(await (await request("GET", "a")).json()).toMatchObject([
			{ name: "Legacy", amount: 42.5 },
		]);
	});

	test("preserves historically readable movement values on listing", async () => {
		const { client, request } = await createHarness();
		await client.execute(
			"INSERT INTO movements (clerk_id, category_id, movement_type_id, name, amount, is_recurring, transaction_date, created_at) VALUES ('user-a', NULL, 3, '  Legacy  ', -2.5, 0, 'legacy-date', '')",
		);
		expect(await (await request("GET", "a")).json()).toMatchObject([
			{ name: "  Legacy  ", amount: -2.5, transaction_date: "legacy-date" },
		]);
	});

	test("lists newest transaction dates first with ID tie-breaking and legacy date fallback", async () => {
		const { client, request } = await createHarness();
		for (const row of [
			{ name: "Older", date: "2026-09-19", created: "2026-09-19T00:00:00Z" },
			{
				name: "Same day older ID",
				date: "2026-09-20",
				created: "2026-09-20T00:00:00Z",
			},
			{
				name: "Legacy without transaction date",
				date: null,
				created: "2026-09-18T00:00:00Z",
			},
			{
				name: "Same day newer ID",
				date: "2026-09-20",
				created: "2026-09-20T01:00:00Z",
			},
		]) {
			await client.execute({
				sql: "INSERT INTO movements (clerk_id, movement_type_id, name, amount, is_recurring, transaction_date, created_at) VALUES ('user-a', 3, ?, 1, 0, ?, ?)",
				args: [row.name, row.date, row.created],
			});
		}
		const rows = await (await request("GET", "a")).json();
		expect(rows.map((row: { name: string }) => row.name)).toEqual([
			"Same day newer ID",
			"Same day older ID",
			"Older",
			"Legacy without transaction date",
		]);
	});
});
