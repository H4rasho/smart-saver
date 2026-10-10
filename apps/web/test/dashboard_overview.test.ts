import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { aggregateOverview } from "../app/core/dashboard/lib/dashboard_overview";
import { queryDashboardAmounts } from "../app/core/dashboard/repository/dashboard_query";
import { encryptNumber } from "../lib/encryption";
const period = { from: "2025-12-01", to: "2026-02-28" };
test("aggregates fixed expenses, inclusive endpoints, missing dates and empty months", () => {
	const result = aggregateOverview(
		[
			{ date: period.from, amount: 100, type: "INCOME" },
			{ date: period.to, amount: 150, type: "FIXED_EXPENSE" },
			{ date: "2026-02-20", amount: 50, type: "EXPENSE" },
			{ date: null, amount: 999, type: "INCOME" },
			{ date: "2026-02-30", amount: 999, type: "INCOME" },
			{ date: "2026-03-01", amount: 999, type: "INCOME" },
		],
		period,
		"CLP",
	);
	assert.deepEqual(result.totals, {
		income: 100,
		expenses: 200,
		net: -100,
		savingsRate: -100,
	});
	assert.deepEqual(result.monthlySeries[1], {
		month: "2026-01",
		income: 0,
		expenses: 0,
	});
	assert.equal(result.hasMovements, true);
});
test("distinguishes empty periods, zero-valued movements and unavailable savings rate", () => {
	assert.equal(aggregateOverview([], period, "USD").hasMovements, false);
	const result = aggregateOverview(
		[{ date: period.from, amount: 0, type: "EXPENSE" }],
		period,
		"USD",
	);
	assert.equal(result.hasMovements, true);
	assert.equal(result.totals.savingsRate, null);
	assert.throws(() =>
		aggregateOverview(
			[{ date: period.from, amount: Number.NaN, type: "INCOME" }],
			period,
			"USD",
		),
	);
});
test("actual repository query isolates owners and dates and decrypts only selected amounts", async () => {
	process.env.ENCRYPTION_KEY = "11".repeat(32);
	const client = createClient({ url: "file::memory:" });
	try {
		await client.executeMultiple(
			"CREATE TABLE movements (id INTEGER PRIMARY KEY, clerk_id TEXT, amount REAL, movement_type_id INTEGER, transaction_date TEXT); CREATE TABLE movement_types (id INTEGER PRIMARY KEY, name TEXT); INSERT INTO movement_types VALUES (1,'INCOME'),(2,'FIXED_EXPENSE');",
		);
		for (const [id, user, date, amount] of [
			[1, "owner", period.from, 100],
			[2, "other", period.from, 999],
			[3, "owner", "2026-03-01", 999],
			[4, "owner", null, 999],
			[5, "owner", period.to, 25],
		] as const) {
			await client.execute({
				sql: "INSERT INTO movements VALUES (?,?,?,?,?)",
				args: [id, user, encryptNumber(amount), id === 5 ? 2 : 1, date],
			});
		}
		const db = drizzle(client);
		const rows = await queryDashboardAmounts(db, "owner", period);
		assert.equal(rows.length, 2);
		assert.deepEqual(
			rows.map((row) => row.amount),
			[100, 25],
		);
		assert.equal(aggregateOverview(rows, period, "CLP").totals.net, 75);
		await assert.rejects(queryDashboardAmounts(db, "", period));
	} finally {
		client.close();
	}
});
