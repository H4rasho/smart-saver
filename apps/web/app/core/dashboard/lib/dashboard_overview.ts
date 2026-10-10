import type {
	DashboardAmount,
	DashboardOverview,
	DashboardPeriod,
} from "../types/dashboard_types";
import { isCalendarDate, periodMonths } from "./dashboard_period";
export function aggregateOverview(
	rows: DashboardAmount[],
	period: DashboardPeriod,
	currency: string,
): DashboardOverview {
	const monthlySeries = periodMonths(period).map((month) => ({
		month,
		income: 0,
		expenses: 0,
	}));
	const byMonth = new Map(monthlySeries.map((row) => [row.month, row]));
	let income = 0;
	let expenses = 0;
	let hasMovements = false;
	for (const row of rows) {
		if (
			!isCalendarDate(row.date) ||
			row.date < period.from ||
			row.date > period.to
		)
			continue;
		if (!Number.isFinite(row.amount))
			throw new Error("Invalid dashboard amount");
		const type = row.type.toUpperCase();
		const month = byMonth.get(row.date.slice(0, 7));
		if (!month) continue;
		if (type === "INCOME") {
			income += row.amount;
			month.income += row.amount;
			hasMovements = true;
		}
		if (type === "EXPENSE" || type === "FIXED_EXPENSE") {
			expenses += row.amount;
			month.expenses += row.amount;
			hasMovements = true;
		}
	}
	const net = income - expenses;
	return {
		period,
		currency,
		hasMovements,
		totals: {
			income,
			expenses,
			net,
			savingsRate: income === 0 ? null : (net / income) * 100,
		},
		monthlySeries,
	};
}
