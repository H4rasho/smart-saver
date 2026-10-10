"use client";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { barY, defineChart, group } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { DashboardOverview } from "../types/dashboard_types";
export function IncomeExpensesChart({
	overview,
}: { overview: DashboardOverview }): React.ReactNode {
	const t = useTranslations("dashboard");
	const locale = useLocale();
	const definition = useMemo(() => {
		const rows = overview.monthlySeries.flatMap((row) => [
			{
				month: row.month,
				series: t("income"),
				amount: row.income,
				color: "#10b981",
			},
			{
				month: row.month,
				series: t("expenses"),
				amount: row.expenses,
				color: "#f43f5e",
			},
		]);
		return defineChart({
			marks: [
				barY(rows, {
					x: "month",
					y: "amount",
					z: "series",
					fill: (row) => row.color,
					layout: group({ padding: 0.12 }),
					radius: 3,
				}),
			],
			scales: {
				x: {
					scale: () => scaleBand().padding(0.25),
					axis: {
						ticks: {
							format: (value) =>
								new Intl.DateTimeFormat(locale, {
									month: "short",
									year: "2-digit",
									timeZone: "UTC",
								}).format(new Date(`${value}-01T12:00:00Z`)),
						},
					},
				},
				y: {
					scale: scaleLinear,
					nice: true,
					grid: true,
					axis: {
						ticks: {
							format: (value) =>
								new Intl.NumberFormat(locale, { notation: "compact" }).format(
									Number(value),
								),
						},
					},
				},
			},
			theme: {
				foreground: "var(--foreground)",
				muted: "var(--muted-foreground)",
				grid: "var(--border)",
				background: "var(--card)",
			},
			tooltip: {
				use: tooltip,
				format: (point) =>
					`${point.datum.month} · ${point.datum.series}: ${formatCurrencyAmount(point.datum.amount, overview.currency)}`,
			},
		});
	}, [overview, locale, t]);
	return (
		<section
			className="min-w-0 rounded-xl border bg-card p-4 sm:p-6"
			aria-label={t("chartTitle")}
		>
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<h3 className="text-lg font-semibold">{t("chartTitle")}</h3>
				<div className="flex gap-4 text-sm">
					<span>
						<span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
						{t("income")}
					</span>
					<span>
						<span className="mr-2 inline-block h-2 w-2 rounded-full bg-rose-500" />
						{t("expenses")}
					</span>
				</div>
			</div>
			{!overview.hasMovements ? (
				<p className="py-16 text-center text-muted-foreground">{t("empty")}</p>
			) : (
				<>
					<div className="max-w-full overflow-x-auto">
						<div
							style={{
								minWidth: Math.max(280, overview.monthlySeries.length * 64),
							}}
						>
							<Chart
								definition={definition}
								height={300}
								initialWidth={720}
								ariaLabel={t("chartTitle")}
								ariaDescription={t("chartDescription", {
									currency: overview.currency,
								})}
							/>
						</div>
					</div>
					<details className="mt-4 text-sm">
						<summary className="cursor-pointer text-muted-foreground">
							{t("dataTable")}
						</summary>
						<div className="overflow-x-auto">
							<table className="mt-3 w-full text-left">
								<caption className="sr-only">{t("chartTitle")}</caption>
								<thead>
									<tr>
										<th scope="col">{t("month")}</th>
										<th scope="col">{t("income")}</th>
										<th scope="col">{t("expenses")}</th>
									</tr>
								</thead>
								<tbody>
									{overview.monthlySeries.map((row) => (
										<tr key={row.month}>
											<th scope="row">{row.month}</th>
											<td>
												{formatCurrencyAmount(row.income, overview.currency)}
											</td>
											<td>
												{formatCurrencyAmount(row.expenses, overview.currency)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</details>
				</>
			)}
		</section>
	);
}
