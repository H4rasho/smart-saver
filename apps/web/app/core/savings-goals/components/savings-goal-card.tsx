import { AddContributionForm } from "@/app/core/savings-goals/components/add-contribution-form";
import { ContributionsTable } from "@/app/core/savings-goals/components/contributions-table";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CalendarDays, PiggyBank, Target } from "lucide-react";
import type { SavingsGoalSummary } from "../types/savings-goals-types";

interface SavingsGoalCardProps {
	goal: SavingsGoalSummary;
	userCurrency: string;
}

export function SavingsGoalCard({ goal, userCurrency }: SavingsGoalCardProps) {
	const progressWidth = `${Math.min(goal.progress_percentage, 100)}%`;

	return (
		<Card className="gap-0 overflow-hidden py-0">
			<CardHeader className="border-b bg-gradient-to-r from-primary/[0.08] via-background to-background py-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<div className="rounded-xl bg-primary/10 p-2 text-primary">
								<Target className="size-4" />
							</div>
							<CardTitle className="text-xl">{goal.name}</CardTitle>
						</div>
						<CardDescription>
							Creada el {goal.formatted_created_at}
							{goal.formatted_target_date
								? ` · Meta para ${goal.formatted_target_date}`
								: " · Sin fecha objetivo"}
						</CardDescription>
					</div>

					<div className="flex flex-wrap gap-2">
						<Badge variant="outline" className="rounded-full px-3 py-1.5">
							<PiggyBank className="size-3.5" />
							{goal.contributions_count} abonos
						</Badge>
						<Badge variant="outline" className="rounded-full px-3 py-1.5">
							<CalendarDays className="size-3.5" />
							{goal.progress_percentage}% completado
						</Badge>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-8 py-6">
				<div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
					<div className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-3">
							<div className="rounded-2xl border bg-muted/25 p-4">
								<p className="text-sm text-muted-foreground">Objetivo</p>
								<p className="mt-1 text-lg font-semibold text-foreground">
									{formatCurrencyAmount(goal.target_amount, userCurrency)}
								</p>
							</div>
							<div className="rounded-2xl border bg-muted/25 p-4">
								<p className="text-sm text-muted-foreground">Ahorrado</p>
								<p className="mt-1 text-lg font-semibold text-foreground">
									{formatCurrencyAmount(goal.current_amount, userCurrency)}
								</p>
							</div>
							<div className="rounded-2xl border bg-muted/25 p-4">
								<p className="text-sm text-muted-foreground">Pendiente</p>
								<p className="mt-1 text-lg font-semibold text-foreground">
									{formatCurrencyAmount(goal.remaining_amount, userCurrency)}
								</p>
							</div>
						</div>

						<div className="space-y-3 rounded-2xl border bg-card p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-foreground">Avance</p>
									<p className="text-sm text-muted-foreground">
										Tus abonos registrados avanzan esta meta sin tocar el
										balance principal.
									</p>
								</div>
								<p className="text-sm font-semibold text-foreground">
									{goal.progress_percentage}%
								</p>
							</div>
							<div className="h-3 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary transition-all"
									style={{ width: progressWidth }}
								/>
							</div>
						</div>

						<div className="space-y-4 rounded-2xl border bg-card p-4">
							<div>
								<h3 className="font-semibold text-foreground">
									Historial de abonos
								</h3>
								<p className="text-sm text-muted-foreground">
									Consulta cada aporte registrado para esta meta.
								</p>
							</div>
							<ContributionsTable
								contributions={goal.contributions}
								userCurrency={userCurrency}
							/>
						</div>
					</div>

					<div className="rounded-2xl border bg-card p-4 shadow-sm">
						<div className="mb-4 space-y-1">
							<h3 className="font-semibold text-foreground">Registrar abono</h3>
							<p className="text-sm text-muted-foreground">
								Agrega nuevos aportes manuales para seguir el progreso de esta
								meta.
							</p>
						</div>
						<AddContributionForm goalId={goal.id} userCurrency={userCurrency} />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
