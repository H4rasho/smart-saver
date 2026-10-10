import { and, eq, gte, inArray, isNull, lte, or } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { decryptNumber } from "../../../../lib/encryption";
import { categories } from "../../categories/model/categories-model";
import {
	movement_types,
	movements,
} from "../../movements/model/movement-model";
import { validatePeriod } from "../lib/dashboard_period";
import type {
	DashboardAmount,
	DashboardCategoryAmount,
	DashboardPeriod,
} from "../types/dashboard_types";
export async function queryDashboardAmounts(
	db: LibSQLDatabase,
	userId: string,
	period: DashboardPeriod,
): Promise<DashboardAmount[]> {
	if (!userId || !validatePeriod(period))
		throw new Error("Invalid dashboard query");
	const rows = await db
		.select({
			date: movements.transaction_date,
			amount: movements.amount,
			type: movement_types.name,
		})
		.from(movements)
		.innerJoin(
			movement_types,
			eq(movements.movement_type_id, movement_types.id),
		)
		.where(
			and(
				eq(movements.clerk_id, userId),
				gte(movements.transaction_date, period.from),
				lte(movements.transaction_date, period.to),
			),
		);
	return rows.map((row) => {
		const value: unknown = row.amount;
		const amount = typeof value === "string" ? decryptNumber(value) : value;
		if (typeof amount !== "number" || !Number.isFinite(amount))
			throw new Error("Invalid stored dashboard amount");
		return { date: row.date, amount, type: row.type };
	});
}
export async function queryDashboardCategoryAmounts(
	db: LibSQLDatabase,
	userId: string,
	period: DashboardPeriod,
): Promise<DashboardCategoryAmount[]> {
	if (!userId || !validatePeriod(period))
		throw new Error("Invalid dashboard query");
	const rows = await db
		.select({
			date: movements.transaction_date,
			categoryId: categories.id,
			categoryName: categories.name,
			amount: movements.amount,
			type: movement_types.name,
		})
		.from(movements)
		.innerJoin(
			movement_types,
			eq(movements.movement_type_id, movement_types.id),
		)
		.leftJoin(
			categories,
			and(
				eq(movements.category_id, categories.id),
				or(eq(categories.clerk_id, userId), isNull(categories.clerk_id)),
			),
		)
		.where(
			and(
				eq(movements.clerk_id, userId),
				inArray(movement_types.name, ["EXPENSE", "FIXED_EXPENSE"]),
				gte(movements.transaction_date, period.from),
				lte(movements.transaction_date, period.to),
			),
		);
	return rows.map((row) => {
		const value: unknown = row.amount;
		const amount = typeof value === "string" ? decryptNumber(value) : value;
		if (typeof amount !== "number" || !Number.isFinite(amount))
			throw new Error("Invalid stored dashboard amount");
		return {
			date: row.date,
			amount,
			type: row.type,
			categoryId: row.categoryId,
			categoryName: row.categoryName,
		};
	});
}
