import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { aggregateCategoryExpenses } from "../app/core/dashboard/lib/dashboard_category_expenses";
import { queryDashboardCategoryAmounts } from "../app/core/dashboard/repository/dashboard_query";
import type { DashboardCategoryAmount } from "../app/core/dashboard/types/dashboard_types";
import { encryptNumber } from "../lib/encryption";
const period = { from: "2024-01-01", to: "2024-01-31" };
function row(
	amount: number,
	categoryId: number | null,
	type = "EXPENSE",
): DashboardCategoryAmount {
	return {
		date: period.from,
		amount,
		categoryId,
		categoryName: categoryId === null ? null : "Same name",
		type,
	};
}
test("groups by identifier, includes fixed expenses, excludes income and sorts by amount", () => {
	const result = aggregateCategoryExpenses(
		[
			row(10, 1),
			row(20, 1, "FIXED_EXPENSE"),
			row(50, 2),
			row(20, null),
			row(999, 1, "INCOME"),
			{ ...row(999, 1), date: null },
			{ ...row(999, 1), date: "2024-02-01" },
		],
		period,
	);
	assert.deepEqual(
		result.map((r) => [r.categoryId, r.amount, r.share]),
		[
			[2, 50, 50],
			[1, 30, 30],
			[null, 20, 20],
		],
	);
	assert.equal(result[0].categoryName, result[1].categoryName);
});
test("handles empty and zero totals and rejects invalid amounts and periods", () => {
	assert.deepEqual(aggregateCategoryExpenses([], period), []);
	assert.equal(aggregateCategoryExpenses([row(0, null)], period)[0].share, 0);
	for (const amount of [Number.NaN, Number.POSITIVE_INFINITY, -1])
		assert.throws(() => aggregateCategoryExpenses([row(amount, 1)], period));
	assert.throws(() =>
		aggregateCategoryExpenses([], { from: period.to, to: period.from }),
	);
});
test("category query isolates owners and dates, decrypts values and hides foreign categories", async () => {
	process.env.ENCRYPTION_KEY = "11".repeat(32);
	const client = createClient({ url: "file::memory:" });
	try {
		await client.executeMultiple(
			"CREATE TABLE movements (clerk_id TEXT, amount REAL, movement_type_id INTEGER, transaction_date TEXT, category_id INTEGER); CREATE TABLE movement_types (id INTEGER, name TEXT); CREATE TABLE categories (id INTEGER, name TEXT, clerk_id TEXT); INSERT INTO movement_types VALUES (1,'FIXED_EXPENSE'); INSERT INTO categories VALUES (1,'Private','other'),(2,'Own','owner'),(3,'Shared',NULL);",
		);
		for (const [owner, date, category] of [
			["owner", period.from, 1],
			["owner", period.to, 2],
			["owner", period.to, 3],
			["other", period.from, 2],
			["owner", "2024-02-01", 2],
			["owner", null, 2],
		] as const) {
			await client.execute({
				sql: "INSERT INTO movements VALUES (?,?,?,?,?)",
				args: [owner, encryptNumber(10), 1, date, category],
			});
		}
		const result = await queryDashboardCategoryAmounts(
			drizzle(client),
			"owner",
			period,
		);
		assert.equal(result.length, 3);
		assert.deepEqual(
			result.map((r) => r.categoryName),
			[null, "Own", "Shared"],
		);
		assert.equal(
			result.every((r) => r.amount === 10),
			true,
		);
		await assert.rejects(
			queryDashboardCategoryAmounts(drizzle(client), "", period),
		);
	} finally {
		client.close();
	}
});
