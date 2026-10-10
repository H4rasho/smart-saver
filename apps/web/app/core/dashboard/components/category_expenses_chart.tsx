"use client";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { barX, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { CategoryExpenseSummary } from "../types/dashboard_types";

export function CategoryExpensesChart({
	categories,
	currency,
}: {
	categories: CategoryExpenseSummary[];
	currency: string;
}): React.ReactNode {
	const t = useTranslations("dashboard");
	const locale = useLocale();
	const percentage = (value: number): string =>
		new Intl.NumberFormat(locale, {
			style: "percent",
			maximumFractionDigits: 1,
		}).format(value / 100);
	const definition = useMemo(() => {
		const rows = categories.map((row, index) => ({
			...row,
			key: String(index),
			label: row.categoryId === null ? t("uncategorized") : row.categoryName,
		}));
		return defineChart({
			marks: [
				barX(rows, { x: "amount", y: "key", fill: "#f43f5e", radius: 3 }),
			],
			scales: {
				x: {
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
				y: {
					scale: () => scaleBand().padding(0.25),
					axis: {
						ticks: {
							format: (value) => {
								const label = rows[Number(value)]?.label ?? "";
								return label.length > 18 ? `${label.slice(0, 17)}…` : label;
							},
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
					`${point.datum.label}: ${formatCurrencyAmount(point.datum.amount, currency)} · ${new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(point.datum.share / 100)}`,
			},
		});
	}, [categories, currency, locale, t]);
	return (
		<section
			data-dashboard-categories
			className="mt-6 min-w-0 rounded-xl border bg-card p-4 sm:p-6"
			aria-label={t("categoryTitle")}
		>
			<h3 className="text-lg font-semibold">{t("categoryTitle")}</h3>
			<p className="mt-1 text-sm text-muted-foreground">
				{t("categoryDescription")}
			</p>
			{categories.length === 0 ? (
				<p className="py-16 text-center text-muted-foreground">
					{t("noExpenses")}
				</p>
			) : (
				<>
					<Chart
						definition={definition}
						height={Math.max(220, categories.length * 44)}
						initialWidth={720}
						ariaLabel={t("categoryTitle")}
					/>
					<details className="mt-4 text-sm">
						<summary className="cursor-pointer text-muted-foreground">
							{t("dataTable")}
						</summary>
						<table className="mt-3 w-full table-fixed text-left">
							<caption className="sr-only">{t("categoryTitle")}</caption>
							<thead>
								<tr>
									<th scope="col">{t("category")}</th>
									<th scope="col">{t("amount")}</th>
									<th scope="col">{t("share")}</th>
								</tr>
							</thead>
							<tbody>
								{categories.map((row) => (
									<tr key={row.categoryId ?? "uncategorized"}>
										<th
											scope="row"
											className="break-words py-2 pr-2 font-medium"
										>
											{row.categoryId === null
												? t("uncategorized")
												: row.categoryName}
										</th>
										<td className="break-words pr-2">
											{formatCurrencyAmount(row.amount, currency)}
										</td>
										<td>{percentage(row.share)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</details>
				</>
			)}
		</section>
	);
}
