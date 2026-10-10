"use server";
import {
	getUserCurrency,
	getUserId,
} from "@/app/core/user/actions/user-actions";
import { aggregateCategoryExpenses } from "../lib/dashboard_category_expenses";
import { aggregateOverview } from "../lib/dashboard_overview";
import { validatePeriod } from "../lib/dashboard_period";
import {
	getDashboardAmounts,
	getDashboardCategoryAmounts,
} from "../repository/dashboard_repository";
import type {
	DashboardCategoryResult,
	DashboardPeriod,
	DashboardResult,
} from "../types/dashboard_types";
export async function getDashboardOverviewAction(
	period: DashboardPeriod,
): Promise<DashboardResult> {
	try {
		const userId = await getUserId();
		if (!userId) return { success: false, error: "unauthenticated" };
		if (!validatePeriod(period))
			return { success: false, error: "invalidPeriod" };
		const [rows, currency] = await Promise.all([
			getDashboardAmounts(userId, period),
			getUserCurrency(),
		]);
		return { success: true, data: aggregateOverview(rows, period, currency) };
	} catch (error) {
		console.error("Failed to load dashboard overview", error);
		return { success: false, error: "unavailable" };
	}
}

export async function getDashboardCategoryExpensesAction(
	period: DashboardPeriod,
): Promise<DashboardCategoryResult> {
	try {
		const userId = await getUserId();
		if (!userId) return { success: false, error: "unauthenticated" };
		if (!validatePeriod(period))
			return { success: false, error: "invalidPeriod" };
		return {
			success: true,
			data: aggregateCategoryExpenses(
				await getDashboardCategoryAmounts(userId, period),
				period,
			),
		};
	} catch (error) {
		console.error("Failed to load dashboard category expenses", error);
		return { success: false, error: "unavailable" };
	}
}
