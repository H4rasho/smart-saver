"use client";

import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { AmountInput } from "@/components/ui/amount-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectCombobox } from "@/components/ui/select-combobox";
import type { Category } from "@/types/income";
import { CalendarDays, PencilLine, Tag, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { updateMovementAction } from "../actions/movments-actions";
import type { MovementWithCategoryAndMovementType } from "../types/movement-type";

interface EditMovementDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	movement: MovementWithCategoryAndMovementType | null;
	categories: Category[];
	userCurrency?: string;
}

export function EditMovementDialog({
	open,
	onOpenChange,
	movement,
	categories,
	userCurrency = "USD",
}: EditMovementDialogProps) {
	const [selectedCategory, setSelectedCategory] = useState<string>(
		String(movement?.category_id ?? ""),
	);
	const [state, formAction, isPending] = useActionState(
		updateMovementAction,
		null,
	);
	const router = useRouter();

	useEffect(() => {
		if (state?.success) {
			router.refresh();
			onOpenChange(false);
		}
	}, [state, onOpenChange, router]);

	const categoryOptions = useMemo(
		() =>
			categories.map((category) => ({
				label: category.name,
				value: String(category.id),
			})),
		[categories],
	);

	if (!movement) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="top-auto bottom-0 left-0 right-0 flex max-h-[92vh] w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[1.75rem] rounded-b-none border-x-0 border-b-0 p-0 sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:right-auto sm:max-w-2xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border">
				<DialogHeader className="border-b bg-gradient-to-b from-primary/[0.08] via-background to-background px-5 pt-6 pb-5 text-left sm:px-6">
					<div className="flex flex-wrap items-center gap-2">
						<Badge
							variant="outline"
							className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary"
						>
							<PencilLine className="size-3.5" />
							Editar movimiento
						</Badge>
						<Badge variant="outline" className="rounded-full px-3 py-1">
							{movement.movement_type_name}
						</Badge>
					</div>
					<div className="space-y-2">
						<DialogTitle className="text-xl sm:text-2xl">
							Actualiza la información principal
						</DialogTitle>
						<DialogDescription className="max-w-xl text-sm leading-6">
							Ajusta nombre, monto, categoría y fecha para mantener tus
							registros consistentes.
						</DialogDescription>
					</div>

					<div className="grid gap-3 pt-4 sm:grid-cols-3">
						<div className="rounded-2xl border bg-background/90 p-4 shadow-xs">
							<div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
								<Wallet className="size-3.5" />
								Monto actual
							</div>
							<p className="mt-2 text-lg font-semibold">
								{formatCurrencyAmount(movement.amount, userCurrency)}
							</p>
						</div>
						<div className="rounded-2xl border bg-background/90 p-4 shadow-xs">
							<div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
								<Tag className="size-3.5" />
								Categoría
							</div>
							<p className="mt-2 text-sm font-semibold capitalize">
								{movement.category_name ?? "Sin categoría"}
							</p>
						</div>
						<div className="rounded-2xl border bg-background/90 p-4 shadow-xs">
							<div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
								<CalendarDays className="size-3.5" />
								Fecha actual
							</div>
							<p className="mt-2 text-sm font-semibold">
								{(movement.transaction_date ?? "").slice(0, 10) || "Sin fecha"}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
					<form action={formAction} className="space-y-5">
						<input type="hidden" name="id" value={movement.id} />

						<div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
							<div className="mb-4 space-y-1">
								<h3 className="font-semibold">Detalles del movimiento</h3>
								<p className="text-sm text-muted-foreground">
									Haz que la información sea más fácil de entender cuando
									vuelvas a revisarla.
								</p>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2 sm:col-span-2">
									<Label htmlFor="name">Nombre</Label>
									<Input
										id="name"
										name="name"
										defaultValue={movement.name}
										required
										className="h-11"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="amount">Monto</Label>
									<AmountInput
										key={movement.id}
										id="amount"
										name="amount"
										currency={userCurrency}
										defaultValue={movement.amount}
										required
										className="h-11"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="transaction_date">Fecha</Label>
									<Input
										id="transaction_date"
										name="transaction_date"
										type="date"
										defaultValue={(movement.transaction_date ?? "").slice(
											0,
											10,
										)}
										required
										className="h-11"
									/>
								</div>

								<div className="space-y-2 sm:col-span-2">
									<SelectCombobox
										label="Categoría"
										options={categoryOptions}
										value={selectedCategory}
										onChange={setSelectedCategory}
										placeholder="Selecciona una categoría"
										name="category_id"
										required
									/>
								</div>
							</div>
						</div>

						{state?.error && (
							<div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
								{state.error}
							</div>
						)}

						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="w-full sm:w-auto"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={isPending}
								className="w-full sm:w-auto"
							>
								{isPending ? "Guardando..." : "Guardar cambios"}
							</Button>
						</div>
					</form>
				</div>
			</DialogContent>
		</Dialog>
	);
}
