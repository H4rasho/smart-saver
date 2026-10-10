import {
	HomeRecentMovementsLoadingSkeleton,
	HomeSummaryCardsLoadingSkeleton,
} from "@/app/(auth)/components/loading_skeletons";
import {
	SUMMARY_STAT_TONES,
	SummaryStatCard,
} from "@/app/(auth)/components/summary_stat_card";
import { getDashboardOverviewAction } from "@/app/core/dashboard/actions/dashboard_actions";
import { DashboardPeriodFilter } from "@/app/core/dashboard/components/dashboard_period_filter";
import { IncomeExpensesChart } from "@/app/core/dashboard/components/income_expenses_chart";
import { resolvePeriod } from "@/app/core/dashboard/lib/dashboard_period";
import type { DashboardPeriod } from "@/app/core/dashboard/types/dashboard_types";
import { getMovmentsAction } from "@/app/core/movements/actions/movments-actions";
import FinancialMovementsList from "@/app/core/movements/components/mobile-list";
import { MovementsTable } from "@/app/core/movements/components/movements-table";
import {
	getUserCurrency,
	getUserId,
} from "@/app/core/user/actions/user-actions";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Scale, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function HomeSummaryCards({ period }: { period: DashboardPeriod }) {
	const t = await getTranslations("home.summary");
	const result = await getDashboardOverviewAction(period);
	const dashboard = await getTranslations("dashboard");
	if (!result.success) return <p role="alert">{dashboard(result.error)}</p>;
	const { data } = result;
	const {
		income: total_income,
		expenses: total_expenses,
		net: balance,
	} = data.totals;
	const userCurrency = data.currency;

	const formattedBalance = formatCurrencyAmount(balance, userCurrency, {
		maximumFractionDigits: 0,
	});
	const formattedIncome = formatCurrencyAmount(total_income, userCurrency, {
		maximumFractionDigits: 0,
	});
	const formattedExpenses = formatCurrencyAmount(total_expenses, userCurrency, {
		maximumFractionDigits: 0,
	});
	const savingsRatio =
		data.totals.savingsRate === null
			? dashboard("notAvailable")
			: `${data.totals.savingsRate.toFixed(1)}%`;

	const cards = [
		{
			eyebrow: t("overview"),
			label: dashboard("net"),
			value: formattedBalance,
			detail: dashboard("netDetail"),
			icon: Wallet,
			...SUMMARY_STAT_TONES.violet,
		},
		{
			eyebrow: t("incomeEyebrow"),
			label: t("income"),
			value: formattedIncome,
			detail: dashboard("periodDetail"),
			icon: TrendingUp,
			...SUMMARY_STAT_TONES.emerald,
		},
		{
			eyebrow: t("expenseEyebrow"),
			label: t("expenses"),
			value: formattedExpenses,
			detail: dashboard("periodDetail"),
			icon: TrendingDown,
			...SUMMARY_STAT_TONES.rose,
		},
		{
			eyebrow: t("rhythm"),
			label: t("savingsRatio"),
			value: savingsRatio,
			detail: t("savingsRatioDetail"),
			icon: Scale,
			...SUMMARY_STAT_TONES.sky,
		},
	] as const;

	return (
		<div data-dashboard-overview>
			<div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{cards.map((card) => (
					<SummaryStatCard key={card.label} {...card} />
				))}
			</div>
			<IncomeExpensesChart overview={data} />
		</div>
	);
}

async function RecentMovementsSection({ userId }: { userId: string }) {
	const t = await getTranslations("home");
	const [movements, userCurrency] = await Promise.all([
		getMovmentsAction(userId),
		getUserCurrency(),
	]);

	return (
		<>
			<div className="md:hidden">
				<FinancialMovementsList
					movements={movements}
					userCurrency={userCurrency}
					showActions={false}
					maxItems={5}
				/>
			</div>

			<div className="hidden md:block">
				{movements.length === 0 ? (
					<div className="py-12 text-center">
						<h3 className="mb-2 text-lg font-semibold text-foreground">
							{t("noMovements")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("addFirstMovement")}
						</p>
					</div>
				) : (
					<MovementsTable
						movements={movements.slice(0, 5)}
						userCurrency={userCurrency}
					/>
				)}
			</div>
		</>
	);
}

export default async function Home({
	searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
	const t = await getTranslations("home");
	const userId = await getUserId();
	const selection = resolvePeriod(await searchParams);
	const dashboard = await getTranslations("dashboard");

	if (!userId) {
		return redirect("/welcome");
	}

	return (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col py-10">
			<section>
				<div className="mb-6">
					<h2 className="mb-2 text-2xl font-bold text-foreground">
						{t("title")}
					</h2>
					<p className="text-muted-foreground">{t("description")}</p>
				</div>

				{selection ? (
					<>
						<DashboardPeriodFilter
							key={`${selection.preset}:${selection.period.from}:${selection.period.to}`}
							{...selection}
						/>
						<Suspense
							key={`${selection.period.from}:${selection.period.to}`}
							fallback={
								<div aria-live="polite">
									<p>{dashboard("loading")}</p>
									<HomeSummaryCardsLoadingSkeleton />
								</div>
							}
						>
							<HomeSummaryCards period={selection.period} />
						</Suspense>
					</>
				) : (
					<p role="alert">{dashboard("invalidPeriod")}</p>
				)}
			</section>

			<section className="mt-6">
				<div className="mb-4">
					<h3 className="mb-2 text-xl font-semibold text-foreground">
						{t("recentMovements")}
					</h3>
					<p className="text-sm text-muted-foreground">
						{t("recentMovementsDescription")}
					</p>
				</div>

				<Suspense fallback={<HomeRecentMovementsLoadingSkeleton />}>
					<RecentMovementsSection userId={userId} />
				</Suspense>
			</section>
		</main>
	);
}
