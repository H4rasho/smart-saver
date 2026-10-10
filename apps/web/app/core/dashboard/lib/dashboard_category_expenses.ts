import type {
	CategoryExpenseSummary,
	DashboardCategoryAmount,
	DashboardPeriod,
} from "../types/dashboard_types";
import { isCalendarDate, validatePeriod } from "./dashboard_period";

export function aggregateCategoryExpenses(
	rows: DashboardCategoryAmount[],
	period: DashboardPeriod,
): CategoryExpenseSummary[] {
	if (!validatePeriod(period)) throw new Error("Invalid dashboard period");
	const groups = new Map<number | null, CategoryExpenseSummary>();
	for (const row of rows) {
		if (
			!isCalendarDate(row.date) ||
			row.date < period.from ||
			row.date > period.to
		)
			continue;
		if (!["EXPENSE", "FIXED_EXPENSE"].includes(row.type.toUpperCase()))
			continue;
		if (!Number.isFinite(row.amount) || row.amount < 0)
			throw new Error("Invalid category expense amount");
		const entry = groups.get(row.categoryId) ?? {
			categoryId: row.categoryId,
			categoryName: row.categoryName ?? "",
			amount: 0,
			share: 0,
		};
		entry.amount += row.amount;
		groups.set(row.categoryId, entry);
	}
	const result = [...groups.values()];
	const total = result.reduce((sum, row) => sum + row.amount, 0);
	return result
		.map((row) => ({
			...row,
			share: total === 0 ? 0 : (row.amount / total) * 100,
		}))
		.sort(
			(a, b) =>
				b.amount - a.amount || (a.categoryId ?? -1) - (b.categoryId ?? -1),
		);
}
