export const dynamic = "force-dynamic";
export const revalidate = 0;

import {
	SUMMARY_STAT_TONES,
	SummaryStatCard,
} from "@/app/(auth)/components/summary_stat_card";
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
import { PiggyBank, Target, TrendingUp, Wallet } from "lucide-react";
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
	const summaryCards = [
		{
			eyebrow: "Estado",
			label: "Metas activas",
			value: overview.goals.length.toLocaleString(),
			detail: "Objetivos que siguen abiertos y admiten nuevos abonos.",
			icon: Target,
			...SUMMARY_STAT_TONES.violet,
		},
		{
			eyebrow: "Reserva",
			label: "Ahorrado en metas",
			value: formatCurrencyAmount(overview.total_saved_amount, userCurrency, {
				maximumFractionDigits: 0,
			}),
			detail: "Capital que ya quedó apartado para tus objetivos.",
			icon: PiggyBank,
			...SUMMARY_STAT_TONES.emerald,
		},
		{
			eyebrow: "Destino",
			label: "Objetivo total",
			value: formatCurrencyAmount(overview.total_target_amount, userCurrency, {
				maximumFractionDigits: 0,
			}),
			detail: "La suma a la que apuntan todas tus metas combinadas.",
			icon: Wallet,
			...SUMMARY_STAT_TONES.sky,
		},
		{
			eyebrow: "Impulso",
			label: "Avance global",
			value: `${overview.global_progress_percentage}%`,
			detail: "Qué tan cerca está tu portafolio de ahorro del objetivo final.",
			icon: TrendingUp,
			...SUMMARY_STAT_TONES.amber,
		},
	] as const;

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
					{summaryCards.map((card) => (
						<SummaryStatCard key={card.label} {...card} />
					))}
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
						<CreateSavingsGoalForm userCurrency={userCurrency} />
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
