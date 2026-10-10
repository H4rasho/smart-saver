import { and, eq, gte, lte } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { decryptNumber } from "../../../../lib/encryption";
import {
	movement_types,
	movements,
} from "../../movements/model/movement-model";
import { validatePeriod } from "../lib/dashboard_period";
import type {
	DashboardAmount,
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
