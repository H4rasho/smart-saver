import type {
	DashboardPeriod,
	DashboardPreset,
} from "../types/dashboard_types";
export function calendarToday(now: Date = new Date()): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "America/Santiago",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}
export function isCalendarDate(value: unknown): value is string {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
		return false;
	const date = new Date(`${value}T12:00:00Z`);
	return (
		Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
	);
}
export function validatePeriod(period: DashboardPeriod): boolean {
	return (
		!!period &&
		isCalendarDate(period.from) &&
		isCalendarDate(period.to) &&
		period.from <= period.to
	);
}
function monthDate(year: number, month: number, day: number): string {
	return new Date(Date.UTC(year, month, day, 12)).toISOString().slice(0, 10);
}
export function presetPeriod(
	preset: Exclude<DashboardPreset, "custom">,
	today: string = calendarToday(),
): DashboardPeriod {
	const [year, month] = today.split("-").map(Number);
	const offset = preset === "previous" ? 1 : 0;
	const count =
		preset === "current" || preset === "previous" ? 1 : Number(preset);
	return {
		from: monthDate(year, month - 1 - offset - count + 1, 1),
		to: monthDate(year, month - offset, 0),
	};
}
export function resolvePeriod(
	query: Record<string, string | string[] | undefined>,
	today: string = calendarToday(),
): { period: DashboardPeriod; preset: DashboardPreset } | null {
	const preset = query.period ?? "current";
	if (
		!["current", "previous", "3", "6", "12", "custom"].includes(
			String(preset),
		) ||
		Array.isArray(preset)
	)
		return null;
	if (preset === "custom") {
		const period = { from: query.from as string, to: query.to as string };
		return validatePeriod(period) ? { period, preset } : null;
	}
	return {
		period: presetPeriod(preset as Exclude<DashboardPreset, "custom">, today),
		preset: preset as DashboardPreset,
	};
}
export function periodMonths(period: DashboardPeriod): string[] {
	if (!validatePeriod(period)) throw new Error("Invalid dashboard period");
	const months: string[] = [];
	let [year, month] = period.from.slice(0, 7).split("-").map(Number);
	const end = period.to.slice(0, 7);
	while (true) {
		const key = `${year}-${String(month).padStart(2, "0")}`;
		if (key > end) break;
		months.push(key);
		month++;
		if (month === 13) {
			year++;
			month = 1;
		}
	}
	return months;
}
