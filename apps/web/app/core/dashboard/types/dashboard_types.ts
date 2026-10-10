export type DashboardPeriod = { from: string; to: string };
export type DashboardPreset =
	| "current"
	| "previous"
	| "3"
	| "6"
	| "12"
	| "custom";
export interface DashboardAmount {
	date: string | null;
	amount: number;
	type: string;
}
export interface DashboardOverview {
	period: DashboardPeriod;
	currency: string;
	hasMovements: boolean;
	totals: {
		income: number;
		expenses: number;
		net: number;
		savingsRate: number | null;
	};
	monthlySeries: Array<{ month: string; income: number; expenses: number }>;
}
export type DashboardResult =
	| { success: true; data: DashboardOverview }
	| {
			success: false;
			error: "invalidPeriod" | "unauthenticated" | "unavailable";
	  };

export interface DashboardCategoryAmount extends DashboardAmount {
	categoryId: number | null;
	categoryName: string | null;
}
export interface CategoryExpenseSummary {
	categoryId: number | null;
	categoryName: string;
	amount: number;
	share: number;
}
export type DashboardCategoryResult =
	| { success: true; data: CategoryExpenseSummary[] }
	| {
			success: false;
			error: "invalidPeriod" | "unauthenticated" | "unavailable";
	  };
