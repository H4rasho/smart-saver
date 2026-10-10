import type {
	CumulativeExpenseComparison,
	DashboardAmount,
	DashboardPeriod,
} from "../types/dashboard_types";
import {
	calendarToday,
	isCalendarDate,
	validatePeriod,
} from "./dashboard_period";

export function resolveComparisonPeriods(
	period: DashboardPeriod,
	today = calendarToday(),
): { reference: DashboardPeriod; previous: DashboardPeriod } {
	if (!validatePeriod(period) || !isCalendarDate(today))
		throw new Error("Invalid comparison period");
	const referenceMonth = period.to.slice(0, 7);
	if (referenceMonth > today.slice(0, 7))
		throw new Error("Future comparison month");
	const [year, month] = referenceMonth.split("-").map(Number);
	const previousMonth = new Date(Date.UTC(year, month - 2, 1, 12))
		.toISOString()
		.slice(0, 7);
	const lastDay = new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
	const day =
		referenceMonth === today.slice(0, 7) ? Number(today.slice(8)) : lastDay;
	const previousLastDay = new Date(
		Date.UTC(year, month - 1, 0, 12),
	).getUTCDate();
	return {
		reference: {
			from: `${referenceMonth}-01`,
			to: `${referenceMonth}-${String(day).padStart(2, "0")}`,
		},
		previous: {
			from: `${previousMonth}-01`,
			to: `${previousMonth}-${String(Math.min(day, previousLastDay)).padStart(2, "0")}`,
		},
	};
}

export function aggregateCumulativeExpenses(
	rows: DashboardAmount[],
	periods: ReturnType<typeof resolveComparisonPeriods>,
): CumulativeExpenseComparison {
	const { reference, previous } = periods;
	const daily = new Map<string, number>();
	let hasReferenceExpenses = false;
	let hasPreviousExpenses = false;
	for (const row of rows) {
		if (
			!isCalendarDate(row.date) ||
			!["EXPENSE", "FIXED_EXPENSE"].includes(row.type.toUpperCase())
		)
			continue;
		const current = row.date >= reference.from && row.date <= reference.to;
		const prior = row.date >= previous.from && row.date <= previous.to;
		if (!current && !prior) continue;
		if (!Number.isFinite(row.amount) || row.amount < 0)
			throw new Error("Invalid cumulative expense amount");
		hasReferenceExpenses ||= current;
		hasPreviousExpenses ||= prior;
		daily.set(row.date, (daily.get(row.date) ?? 0) + row.amount);
	}
	const referenceDay = Number(reference.to.slice(8));
	const previousDay = Number(previous.to.slice(8));
	let current = 0;
	let prior = 0;
	const points = Array.from(
		{ length: Math.max(referenceDay, previousDay) },
		(_, index) => {
			const day = index + 1;
			const suffix = String(day).padStart(2, "0");
			current += daily.get(`${reference.from.slice(0, 7)}-${suffix}`) ?? 0;
			prior += daily.get(`${previous.from.slice(0, 7)}-${suffix}`) ?? 0;
			return {
				day,
				current: day <= referenceDay ? current : null,
				previous: day <= previousDay ? prior : null,
			};
		},
	);
	const comparable = points[Math.min(referenceDay, previousDay) - 1];
	return {
		referenceMonth: reference.from.slice(0, 7),
		previousMonth: previous.from.slice(0, 7),
		referenceCutoff: reference.to,
		previousCutoff: previous.to,
		hasReferenceExpenses,
		hasPreviousExpenses,
		points,
		comparableDay: comparable.day,
		difference:
			hasReferenceExpenses && hasPreviousExpenses
				? (comparable.current ?? 0) - (comparable.previous ?? 0)
				: null,
	};
}
