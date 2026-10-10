import "server-only";
import { db } from "@/database/database";
import type {
	DashboardAmount,
	DashboardCategoryAmount,
	DashboardPeriod,
} from "../types/dashboard_types";
import {
	queryDashboardAmounts,
	queryDashboardCategoryAmounts,
} from "./dashboard_query";
export async function getDashboardAmounts(
	userId: string,
	period: DashboardPeriod,
): Promise<DashboardAmount[]> {
	return queryDashboardAmounts(db, userId, period);
}

export async function getDashboardCategoryAmounts(
	userId: string,
	period: DashboardPeriod,
): Promise<DashboardCategoryAmount[]> {
	return queryDashboardCategoryAmounts(db, userId, period);
}

export async function getDashboardExpenseAmounts(
	userId: string,
	period: DashboardPeriod,
): Promise<DashboardAmount[]> {
	return queryDashboardAmounts(db, userId, period, true);
}
