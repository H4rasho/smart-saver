import assert from "node:assert/strict";
import { test } from "node:test";
import {
	calendarToday,
	isCalendarDate,
	periodMonths,
	presetPeriod,
	resolvePeriod,
	validatePeriod,
} from "../app/core/dashboard/lib/dashboard_period";
test("validates real inclusive calendar dates and rejects malformed ranges", () => {
	for (const value of [
		null,
		"2025-02-29",
		"2026-04-31",
		"2026-1-01",
		"invalid",
	])
		assert.equal(isCalendarDate(value), false);
	assert.equal(isCalendarDate("2024-02-29"), true);
	assert.equal(validatePeriod({ from: "2026-10-10", to: "2026-10-10" }), true);
	assert.equal(validatePeriod({ from: "2026-10-11", to: "2026-10-10" }), false);
	assert.equal(
		resolvePeriod({ period: "custom", from: ["2026-10-10"], to: "2026-10-10" }),
		null,
	);
	assert.equal(resolvePeriod({ period: "unknown" }), null);
});
test("presets include complete months across years", () => {
	assert.deepEqual(presetPeriod("previous", "2026-01-15"), {
		from: "2025-12-01",
		to: "2025-12-31",
	});
	assert.deepEqual(presetPeriod("3", "2026-01-15"), {
		from: "2025-11-01",
		to: "2026-01-31",
	});
	assert.deepEqual(presetPeriod("current", "2024-02-15"), {
		from: "2024-02-01",
		to: "2024-02-29",
	});
	assert.equal(periodMonths(presetPeriod("12", "2026-01-15")).length, 12);
	assert.deepEqual(periodMonths({ from: "2025-12-31", to: "2026-01-01" }), [
		"2025-12",
		"2026-01",
	]);
});
test("today uses Santiago rather than the UTC calendar day", () => {
	assert.equal(calendarToday(new Date("2026-10-11T01:00:00Z")), "2026-10-10");
});
