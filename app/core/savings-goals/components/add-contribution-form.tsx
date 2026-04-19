"use client";

import { createSavingsGoalContributionAction } from "@/app/core/savings-goals/actions/savings-goals-actions";
import { getTodayDateOnlyString } from "@/app/core/savings-goals/lib/savings_goals_date";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, PiggyBank } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface AddContributionFormProps {
	goalId: number;
	userCurrency: string;
}

export function AddContributionForm({
	goalId,
	userCurrency,
}: AddContributionFormProps) {
	const [state, formAction, isPending] = useActionState(
		createSavingsGoalContributionAction,
		null,
	);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (state?.success) {
			toast.success("Abono registrado correctamente");
			formRef.current?.reset();
			return;
		}

		if (state?.error) {
			toast.error("No se pudo registrar el abono", {
				description: state.error,
			});
		}
	}, [state]);

	return (
		<form ref={formRef} action={formAction} className="space-y-4">
			<input type="hidden" name="goalId" value={goalId} />

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor={`contribution-amount-${goalId}`}>
						Monto del abono
					</Label>
					<div className="relative">
						<PiggyBank className="pointer-events-none absolute top-[22px] left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<AmountInput
							id={`contribution-amount-${goalId}`}
							name="amount"
							currency={userCurrency}
							required
							placeholder="0.00"
							className="h-11 pl-10"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor={`contribution-date-${goalId}`}>Fecha del abono</Label>
					<div className="relative">
						<CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id={`contribution-date-${goalId}`}
							name="contributionDate"
							type="date"
							defaultValue={getTodayDateOnlyString()}
							required
							className="h-11 pl-10"
						/>
					</div>
				</div>
			</div>

			<Button
				type="submit"
				className="h-11 w-full sm:w-auto"
				disabled={isPending}
			>
				{isPending ? "Guardando..." : "Agregar abono"}
			</Button>
		</form>
	);
}
