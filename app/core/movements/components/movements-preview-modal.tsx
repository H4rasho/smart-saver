"use client";

import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { MovementTypeDict } from "@/app/core/movements/const/movement-type-dict";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { SelectComboboxOption } from "@/components/ui/select-combobox";
import type { Category } from "@/types/income";
import {
	ArrowDownCircle,
	ArrowUpCircle,
	PencilLine,
	Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
	type CreateMovement,
	MovementType as MovementKind,
} from "../types/movement-type";
import { MovementMobileCard } from "./movement-mobile-card";

interface MovementsPreviewModalProps {
	open: boolean;
	movements: CreateMovement[];
	userCurrency: string;
	categories?: Category[];
	movementTypes?: MovementType[];
	onCancel: () => void;
	onConfirm: (movements: CreateMovement[]) => void;
}

function getMovementTypeLabel(typeName?: string): string {
	if (typeName === MovementKind.INCOME) return "Ingreso";
	if (typeName === MovementKind.FIXED_EXPENSE) return "Gasto fijo";
	return "Gasto";
}

export function MovementsPreviewModal({
	open,
	movements,
	userCurrency,
	categories = [],
	movementTypes = [],
	onCancel,
	onConfirm,
}: MovementsPreviewModalProps) {
	const [editedMovements, setEditedMovements] =
		useState<CreateMovement[]>(movements);
	const [editingIdx, setEditingIdx] = useState<number | null>(null);
	const [editDraft, setEditDraft] = useState<CreateMovement | null>(null);

	const categoryNamesById = useMemo(() => {
		return new Map(
			categories.map((category) => [Number(category.id), category.name]),
		);
	}, [categories]);

	const movementTypeNamesById = useMemo(() => {
		const fallbackMovementTypes: MovementType[] = [
			{ id: MovementTypeDict.INCOME, name: "INCOME" },
			{ id: MovementTypeDict.FIXED_EXPENSE, name: "FIXED_EXPENSE" },
			{ id: MovementTypeDict.EXPENSE, name: "EXPENSE" },
		];

		return new Map(
			(movementTypes.length > 0 ? movementTypes : fallbackMovementTypes).map(
				(movementType) => [Number(movementType.id), movementType.name],
			),
		);
	}, [movementTypes]);

	const categoryOptions = useMemo<SelectComboboxOption[]>(
		() => [
			{ label: "Sin categoría", value: "none" },
			...categories.map((category) => ({
				label: category.name,
				value: String(category.id),
			})),
		],
		[categories],
	);

	const movementTypeOptions = useMemo<SelectComboboxOption[]>(() => {
		return Array.from(movementTypeNamesById.entries()).map(([id, name]) => ({
			label: getMovementTypeLabel(name),
			value: String(id),
		}));
	}, [movementTypeNamesById]);

	const summary = useMemo(() => {
		return editedMovements.reduce(
			(accumulator, movement) => {
				if (movement.movement_type_id === MovementTypeDict.INCOME) {
					accumulator.income += movement.amount;
				} else {
					accumulator.expense += movement.amount;
				}

				return accumulator;
			},
			{ income: 0, expense: 0 },
		);
	}, [editedMovements]);

	const handleFieldChange = (
		field: keyof CreateMovement,
		value: string | number | null,
	) => {
		if (editDraft) {
			setEditDraft({ ...editDraft, [field]: value });
		}
	};

	const handleEdit = (idx: number) => {
		setEditingIdx(idx);
		setEditDraft({ ...editedMovements[idx] });
	};

	const handleSave = () => {
		if (editingIdx !== null && editDraft) {
			setEditedMovements((prev) =>
				prev.map((movement, index) =>
					index === editingIdx ? editDraft : movement,
				),
			);
			setEditingIdx(null);
			setEditDraft(null);
		}
	};

	const handleCancelEdit = () => {
		setEditingIdx(null);
		setEditDraft(null);
	};

	const handleDelete = (idx: number) => {
		setEditedMovements((prev) => prev.filter((_, index) => index !== idx));
		if (editingIdx === idx) {
			handleCancelEdit();
		}
	};

	return (
		<Dialog open={open} onOpenChange={(value) => !value && onCancel()}>
			<DialogContent className="top-auto bottom-0 left-0 right-0 flex max-h-[94vh] w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-t-[1.75rem] rounded-b-none border-x-0 border-b-0 p-0 sm:top-[50%] sm:bottom-auto sm:left-[50%] sm:right-auto sm:max-w-4xl sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl sm:border">
				<DialogHeader className="border-b bg-gradient-to-b from-primary/[0.08] via-background to-background px-5 pt-6 pb-5 text-left sm:px-6">
					<div className="flex flex-wrap items-center gap-2">
						<Badge
							variant="outline"
							className="rounded-full border-primary/20 bg-primary/10 px-3 py-1 text-primary"
						>
							<PencilLine className="size-3.5" />
							Previsualización editable
						</Badge>
						<Badge variant="outline" className="rounded-full px-3 py-1">
							{editedMovements.length} movimiento
							{editedMovements.length === 1 ? "" : "s"}
						</Badge>
					</div>
					<div className="space-y-2">
						<DialogTitle className="text-xl sm:text-2xl">
							Revisa, corrige y confirma antes de guardar
						</DialogTitle>
						<DialogDescription className="max-w-2xl text-sm leading-6">
							Verifica nombres, montos, categorías y fechas. Puedes editar cada
							tarjeta sin salir del flujo, una a la vez y con acciones claras al
							final de cada edición.
						</DialogDescription>
					</div>

					<div className="grid gap-3 pt-4 sm:grid-cols-3">
						<div className="rounded-2xl border bg-background/90 p-4 shadow-xs">
							<div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
								<Wallet className="size-3.5" />
								Ingresos detectados
							</div>
							<p className="mt-2 text-lg font-semibold text-emerald-600 dark:text-emerald-400">
								{formatCurrencyAmount(summary.income, userCurrency)}
							</p>
						</div>
						<div className="rounded-2xl border bg-background/90 p-4 shadow-xs">
							<div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
								<ArrowDownCircle className="size-3.5" />
								Gastos detectados
							</div>
							<p className="mt-2 text-lg font-semibold text-rose-600 dark:text-rose-400">
								{formatCurrencyAmount(summary.expense, userCurrency)}
							</p>
						</div>
						<div className="rounded-2xl border bg-background/90 p-4 shadow-xs">
							<div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
								<ArrowUpCircle className="size-3.5" />
								Balance estimado
							</div>
							<p className="mt-2 text-lg font-semibold">
								{formatCurrencyAmount(
									summary.income - summary.expense,
									userCurrency,
								)}
							</p>
						</div>
					</div>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
					<div className="space-y-4">
						{editingIdx !== null && editDraft && (
							<div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
								<p className="text-sm font-semibold text-foreground">
									Estás editando 1 movimiento
								</p>
								<p className="mt-1 text-sm text-muted-foreground">
									Termina esta tarjeta antes de guardar toda la lista. Usa los
									botones{" "}
									<span className="font-medium text-foreground">
										Cancelar edición
									</span>{" "}
									o{" "}
									<span className="font-medium text-foreground">
										Guardar cambios
									</span>{" "}
									al final de la tarjeta.
								</p>
							</div>
						)}
						{editedMovements.length === 0 ? (
							<div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
								No hay movimientos para mostrar. Vuelve al paso anterior y carga
								un nuevo archivo o audio.
							</div>
						) : (
							editedMovements.map((movement, idx) => {
								const currentMovement =
									editingIdx === idx && editDraft ? editDraft : movement;
								const categoryName =
									currentMovement.category_id !== null
										? categoryNamesById.get(currentMovement.category_id)
										: undefined;
								const typeName = movementTypeNamesById.get(
									currentMovement.movement_type_id,
								);

								return (
									<MovementMobileCard
										key={`${movement.name}-${movement.created_at}-${movement.transaction_date ?? "no-date"}-${idx}`}
										movement={currentMovement}
										categoryName={categoryName}
										typeName={typeName}
										userCurrency={userCurrency}
										isEditing={editingIdx === idx}
										categoryOptions={categoryOptions}
										movementTypeOptions={movementTypeOptions}
										onEdit={() => handleEdit(idx)}
										onDelete={() => handleDelete(idx)}
										onChange={handleFieldChange}
										onSave={handleSave}
										onCancel={handleCancelEdit}
									/>
								);
							})
						)}
					</div>
				</div>

				<DialogFooter className="border-t bg-background px-5 py-4 sm:px-6">
					<div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-sm text-muted-foreground">
							{editingIdx !== null
								? "Termina la edición actual para habilitar el guardado final."
								: "Confirma solo cuando la lista esté lista para guardarse en tu cuenta."}
						</p>
						<div className="flex flex-col-reverse gap-2 sm:flex-row">
							<Button
								variant="outline"
								type="button"
								onClick={onCancel}
								className="w-full sm:w-auto"
							>
								Cancelar
							</Button>
							<Button
								type="button"
								onClick={() => onConfirm(editedMovements)}
								disabled={editedMovements.length === 0 || editingIdx !== null}
								className="w-full sm:w-auto"
							>
								{editingIdx !== null
									? "Termina esta edición"
									: editedMovements.length === 1
										? "Guardar 1 movimiento"
										: `Guardar ${editedMovements.length} movimientos`}
							</Button>
						</div>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
