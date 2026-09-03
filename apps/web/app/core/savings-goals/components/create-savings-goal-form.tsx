"use client";

import { createSavingsGoalAction } from "@/app/core/savings-goals/actions/savings-goals-actions";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface CreateSavingsGoalFormProps {
	userCurrency: string;
}

export function CreateSavingsGoalForm({
	userCurrency,
}: CreateSavingsGoalFormProps) {
	const [state, formAction, isPending] = useActionState(
		createSavingsGoalAction,
		null,
	);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (state?.success) {
			toast.success("Meta creada correctamente");
			formRef.current?.reset();
			return;
		}

		if (state?.error) {
			toast.error("No se pudo crear la meta", {
				description: state.error,
			});
		}
	}, [state]);

	return (
		<form ref={formRef} action={formAction} className="space-y-5">
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="space-y-2 lg:col-span-2">
					<Label htmlFor="goal-name">Nombre de la meta</Label>
					<div className="relative">
						<Target className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="goal-name"
							name="name"
							required
							placeholder="Ej. Fondo de emergencia, viaje o cuota inicial"
							className="h-11 pl-10"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="goal-target-amount">Monto objetivo</Label>
					<AmountInput
						id="goal-target-amount"
						name="targetAmount"
						currency={userCurrency}
						required
						placeholder="0.00"
						className="h-11"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="goal-target-date">Fecha objetivo</Label>
					<Input
						id="goal-target-date"
						name="targetDate"
						type="date"
						className="h-11"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-3 rounded-2xl border border-dashed bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-sm leading-6 text-muted-foreground">
					Las metas y sus abonos se registran por separado y no alteran tus
					movimientos ni el dashboard principal.
				</p>
				<Button type="submit" className="h-11 sm:w-auto" disabled={isPending}>
					{isPending ? "Guardando..." : "Crear meta"}
				</Button>
			</div>
		</form>
	);
}
