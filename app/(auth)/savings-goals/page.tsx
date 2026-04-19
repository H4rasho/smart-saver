export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getSavingsGoalsOverviewAction } from "@/app/core/savings-goals/actions/savings-goals-actions";
import { CreateSavingsGoalForm } from "@/app/core/savings-goals/components/create-savings-goal-form";
import { SavingsGoalCard } from "@/app/core/savings-goals/components/savings-goal-card";
import {
	getUserCurrency,
	getUserId,
} from "@/app/core/user/actions/user-actions";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PiggyBank, Target, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SavingsGoalsPage() {
	const userId = await getUserId();

	if (!userId) {
		return redirect("/welcome");
	}

	const [overview, userCurrency] = await Promise.all([
		getSavingsGoalsOverviewAction(),
		getUserCurrency(),
	]);

	return (
		<main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8">
			<section className="space-y-4">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<div className="mb-3 flex items-center gap-3">
							<div className="rounded-lg bg-primary/10 p-2">
								<Target className="h-6 w-6 text-primary" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-foreground">
									Metas de ahorro
								</h1>
								<p className="text-sm text-muted-foreground">
									Planifica objetivos y lleva el seguimiento de abonos sin
									afectar gastos, ingresos ni balances existentes.
								</p>
							</div>
						</div>
					</div>

					<Badge variant="outline" className="w-fit rounded-full px-3 py-1.5">
						<PiggyBank className="size-3.5" />
						Seguimiento aislado del dashboard principal
					</Badge>
				</div>

				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<div className="rounded-xl border border-secondary-dark/20 bg-gradient-to-br from-secondary-light to-secondary p-5 shadow-sm">
						<p className="text-sm font-medium text-foreground/70">
							Metas activas
						</p>
						<p className="mt-2 text-2xl font-bold text-foreground">
							{overview.goals.length.toLocaleString()}
						</p>
					</div>

					<div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm dark:border-green-700/40 dark:from-green-900/20 dark:to-green-800/30">
						<p className="text-sm font-medium text-green-700 dark:text-green-300">
							Ahorrado en metas
						</p>
						<p className="mt-2 text-2xl font-bold text-green-800 dark:text-green-200">
							{formatCurrencyAmount(overview.total_saved_amount, userCurrency, {
								maximumFractionDigits: 0,
							})}
						</p>
					</div>

					<div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-sm dark:border-blue-700/40 dark:from-blue-900/20 dark:to-blue-800/30">
						<p className="text-sm font-medium text-blue-700 dark:text-blue-300">
							Objetivo total
						</p>
						<p className="mt-2 text-2xl font-bold text-blue-800 dark:text-blue-200">
							{formatCurrencyAmount(
								overview.total_target_amount,
								userCurrency,
								{
									maximumFractionDigits: 0,
								},
							)}
						</p>
					</div>

					<div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-sm dark:border-amber-700/40 dark:from-amber-900/20 dark:to-amber-800/30">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-medium text-amber-700 dark:text-amber-300">
									Avance global
								</p>
								<p className="mt-2 text-2xl font-bold text-amber-800 dark:text-amber-200">
									{overview.global_progress_percentage}%
								</p>
							</div>
							<div className="rounded-lg bg-amber-500 p-3 text-white">
								<TrendingUp className="size-5" />
							</div>
						</div>
					</div>
				</div>
			</section>

			<section>
				<Card>
					<CardHeader>
						<CardTitle>Nueva meta</CardTitle>
						<CardDescription>
							Define un objetivo de ahorro y empieza a registrar sus abonos.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CreateSavingsGoalForm />
					</CardContent>
				</Card>
			</section>

			<section className="space-y-4">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Tus metas</h2>
					<p className="text-sm text-muted-foreground">
						Visualiza el progreso y el historial de aportes por meta.
					</p>
				</div>

				{overview.goals.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center">
							<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
								<PiggyBank className="size-6" />
							</div>
							<h3 className="text-lg font-semibold text-foreground">
								Todavía no tienes metas de ahorro
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Crea tu primera meta para comenzar a llevar el seguimiento de
								tus abonos de forma independiente.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-6">
						{overview.goals.map((goal) => (
							<SavingsGoalCard
								key={goal.id}
								goal={goal}
								userCurrency={userCurrency}
							/>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
