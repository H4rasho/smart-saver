import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
	aggregateCumulativeExpenses,
	resolveComparisonPeriods,
} from "../app/core/dashboard/lib/dashboard_cumulative_expenses";
import { queryDashboardAmounts } from "../app/core/dashboard/repository/dashboard_query";
import { encryptNumber } from "../lib/encryption";
const period = (to: string) => ({ from: `${to.slice(0, 7)}-01`, to });
test("closed months use equivalent days without inventing leap or short month dates", () => {
	for (const [to, cutoff] of [
		["2024-03-31", "2024-02-29"],
		["2023-03-31", "2023-02-28"],
		["2024-05-31", "2024-04-30"],
		["2024-04-30", "2024-03-30"],
		["2024-01-31", "2023-12-31"],
	])
		assert.equal(
			resolveComparisonPeriods(period(to), "2025-01-01").previous.to,
			cutoff,
		);
});
test("current month ends today, custom ranges retain whole monthly context", () => {
	const result = resolveComparisonPeriods(
		{ from: "2024-01-25", to: "2024-03-05" },
		"2024-03-20",
	);
	assert.deepEqual(result, {
		reference: { from: "2024-03-01", to: "2024-03-20" },
		previous: { from: "2024-02-01", to: "2024-02-20" },
	});
	assert.throws(() =>
		resolveComparisonPeriods(period("2026-01-31"), "2025-01-01"),
	);
	assert.throws(() =>
		resolveComparisonPeriods(period("2024-02-30"), "2025-01-01"),
	);
});
test("daily totals carry forward, fixed expenses count, cutoffs are null and differences use comparable days", () => {
	const periods = resolveComparisonPeriods(period("2024-03-31"), "2025-01-01");
	const result = aggregateCumulativeExpenses(
		[
			{ date: "2024-03-01", amount: 10, type: "EXPENSE" },
			{ date: "2024-03-31", amount: 100, type: "FIXED_EXPENSE" },
			{ date: "2024-02-29", amount: 3, type: "FIXED_EXPENSE" },
			{ date: "2024-03-01", amount: 999, type: "INCOME" },
			{ date: null, amount: 999, type: "EXPENSE" },
			{ date: "2024-02-30", amount: 999, type: "EXPENSE" },
			{ date: "2024-01-31", amount: 999, type: "EXPENSE" },
		],
		periods,
	);
	assert.deepEqual(result.points[1], { day: 2, current: 10, previous: 0 });
	assert.deepEqual(result.points[30], {
		day: 31,
		current: 110,
		previous: null,
	});
	assert.equal(result.comparableDay, 29);
	assert.equal(result.difference, 7);
});
test("empty, one series and zero expense records remain distinguishable; future rows are excluded", () => {
	const periods = resolveComparisonPeriods(period("2024-03-31"), "2024-03-10");
	const empty = aggregateCumulativeExpenses([], periods);
	assert.equal(empty.hasReferenceExpenses, false);
	assert.equal(empty.hasPreviousExpenses, false);
	assert.equal(empty.difference, null);
	const one = aggregateCumulativeExpenses(
		[
			{ date: "2024-03-01", amount: 0, type: "EXPENSE" },
			{ date: "2024-03-11", amount: 100, type: "EXPENSE" },
		],
		periods,
	);
	assert.equal(one.hasReferenceExpenses, true);
	assert.equal(one.hasPreviousExpenses, false);
	assert.equal(one.difference, null);
	assert.equal(one.points.length, 10);
	assert.equal(one.points[9].current, 0);
	assert.throws(() =>
		aggregateCumulativeExpenses(
			[{ date: "2024-03-01", amount: -1, type: "EXPENSE" }],
			periods,
		),
	);
});
test("expense queries isolate owners, include cutoffs and decrypt only the two monthly windows", async () => {
	process.env.ENCRYPTION_KEY = "11".repeat(32);
	const client = createClient({ url: "file::memory:" });
	try {
		await client.executeMultiple(
			"CREATE TABLE movements (clerk_id TEXT, amount REAL, movement_type_id INTEGER, transaction_date TEXT); CREATE TABLE movement_types (id INTEGER, name TEXT); INSERT INTO movement_types VALUES (1,'EXPENSE'),(2,'INCOME'),(3,'FIXED_EXPENSE');",
		);
		for (const [owner, date, type] of [
			["owner", "2024-02-01", 1],
			["owner", "2024-02-29", 3],
			["owner", "2024-03-01", 1],
			["owner", "2024-03-10", 3],
			["owner", "2024-03-11", 1],
			["other", "2024-03-01", 1],
			["owner", null, 1],
			["owner", "2024-03-01", 2],
		] as const)
			await client.execute({
				sql: "INSERT INTO movements VALUES (?,?,?,?)",
				args: [owner, encryptNumber(10), type, date],
			});
		const periods = resolveComparisonPeriods(
			period("2024-03-31"),
			"2024-03-10",
		);
		const rows = (
			await Promise.all(
				[periods.reference, periods.previous].map((window) =>
					queryDashboardAmounts(drizzle(client), "owner", window, true),
				),
			)
		).flat();
		assert.equal(rows.length, 3);
		assert.equal(aggregateCumulativeExpenses(rows, periods).difference, 10);
	} finally {
		client.close();
	}
});
