"use client";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { defineChart, lineY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { CumulativeExpenseComparison } from "../types/dashboard_types";

export function CumulativeExpensesChart({
	comparison,
	currency,
}: {
	comparison: CumulativeExpenseComparison;
	currency: string;
}): React.ReactNode {
	const t = useTranslations("dashboard");
	const locale = useLocale();
	const month = (value: string): string =>
		new Intl.DateTimeFormat(locale, {
			month: "long",
			year: "numeric",
			timeZone: "UTC",
		}).format(new Date(`${value}-01T12:00:00Z`));
	const definition = useMemo(() => {
		const rows = comparison.points.flatMap((point) => [
			{
				day: point.day,
				amount: comparison.hasReferenceExpenses ? point.current : null,
				series: comparison.referenceMonth,
				color: "#f43f5e",
			},
			{
				day: point.day,
				amount: comparison.hasPreviousExpenses ? point.previous : null,
				series: comparison.previousMonth,
				color: "#0ea5e9",
			},
		]);
		return defineChart({
			marks: [
				lineY(rows, {
					x: "day",
					y: "amount",
					z: "series",
					stroke: (row) => row.color,
					points: true,
				}),
			],
			scales: {
				x: {
					scale: scaleLinear,
					axis: { ticks: { format: (value) => String(value) } },
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
					`${point.datum.series} · ${t("day")} ${point.datum.day}: ${formatCurrencyAmount(point.datum.amount ?? 0, currency)}`,
			},
		});
	}, [comparison, currency, locale, t]);
	const available =
		comparison.hasReferenceExpenses || comparison.hasPreviousExpenses;
	const amount = (value: number | null, hasExpenses: boolean): string =>
		value === null || !hasExpenses
			? t("notAvailable")
			: formatCurrencyAmount(value, currency);
	return (
		<section
			data-dashboard-cumulative
			className="mt-6 min-w-0 rounded-xl border bg-card p-4 sm:p-6"
			aria-label={t("cumulativeTitle")}
		>
			<h3 className="text-lg font-semibold">{t("cumulativeTitle")}</h3>
			<p className="mt-1 text-sm text-muted-foreground">
				{t("cumulativeContext")}
			</p>
			<div className="my-5 grid gap-3 sm:grid-cols-2">
				{[
					{
						name: comparison.referenceMonth,
						cutoff: comparison.referenceCutoff,
						available: comparison.hasReferenceExpenses,
						color: "bg-rose-500",
					},
					{
						name: comparison.previousMonth,
						cutoff: comparison.previousCutoff,
						available: comparison.hasPreviousExpenses,
						color: "bg-sky-500",
					},
				].map((series) => (
					<div
						key={series.name}
						className="min-w-0 rounded-lg border p-3 text-sm"
					>
						<p className="font-medium">
							<span
								className={`mr-2 inline-block size-2 rounded-full ${series.color}`}
							/>
							{month(series.name)}
						</p>
						<p className="mt-1 text-muted-foreground">
							{t("cutoff", { date: series.cutoff })}
						</p>
						{!series.available && (
							<p className="mt-1 text-muted-foreground">
								{t("noSeriesExpenses")}
							</p>
						)}
					</div>
				))}
			</div>
			{!available ? (
				<p className="py-12 text-center text-muted-foreground">
					{t("cumulativeEmpty")}
				</p>
			) : (
				<>
					<p className="mb-4 text-sm">
						{t("cumulativeDifference", {
							day: comparison.comparableDay,
							amount:
								comparison.difference === null
									? t("notAvailable")
									: formatCurrencyAmount(comparison.difference, currency),
						})}
					</p>
					<Chart
						definition={definition}
						height={300}
						initialWidth={720}
						ariaLabel={t("cumulativeTitle")}
						ariaDescription={t("cumulativeContext")}
					/>
					<details className="mt-4 text-sm">
						<summary className="cursor-pointer text-muted-foreground">
							{t("dataTable")}
						</summary>
						<div className="overflow-x-auto">
							<table className="mt-3 w-full text-left">
								<caption className="sr-only">{t("cumulativeTitle")}</caption>
								<thead>
									<tr>
										<th scope="col">{t("day")}</th>
										<th scope="col">{month(comparison.referenceMonth)}</th>
										<th scope="col">{month(comparison.previousMonth)}</th>
									</tr>
								</thead>
								<tbody>
									{comparison.points.map((point) => (
										<tr key={point.day}>
											<th scope="row" className="py-2">
												{point.day}
											</th>
											<td>
												{amount(point.current, comparison.hasReferenceExpenses)}
											</td>
											<td>
												{amount(point.previous, comparison.hasPreviousExpenses)}
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
