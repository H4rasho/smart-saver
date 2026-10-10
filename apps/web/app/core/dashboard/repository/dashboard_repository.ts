import "server-only";
import { db } from "@/database/database";
import type {
	DashboardAmount,
	DashboardPeriod,
} from "../types/dashboard_types";
import { queryDashboardAmounts } from "./dashboard_query";
export async function getDashboardAmounts(
	userId: string,
	period: DashboardPeriod,
): Promise<DashboardAmount[]> {
	return queryDashboardAmounts(db, userId, period);
}
