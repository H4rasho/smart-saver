import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	SelectCombobox,
	type SelectComboboxOption,
} from "@/components/ui/select-combobox";
import { cn } from "@/lib/utils";
import {
	CalendarDays,
	Check,
	Edit,
	Info,
	RefreshCw,
	Tag,
	Trash2,
	Wallet,
	X,
} from "lucide-react";
import { MovementType } from "../types/movement-type";
import type { CreateMovement } from "../types/movement-type";

interface MovementMobileCardProps {
	movement: CreateMovement;
	categoryName?: string;
	typeName?: string;
	userCurrency: string;
	isEditing: boolean;
	categoryOptions: SelectComboboxOption[];
	movementTypeOptions: SelectComboboxOption[];
	onEdit: () => void;
	onDelete: () => void;
	onChange?: (
		field: keyof CreateMovement,
		value: string | number | null,
	) => void;
	onSave?: () => void;
	onCancel?: () => void;
}

function getMovementPresentation(typeName?: string): {
	label: string;
	badgeClassName: string;
	amountClassName: string;
	sign: string;
} {
	if (typeName === MovementType.INCOME) {
		return {
			label: "Ingreso",
			badgeClassName:
				"border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
			amountClassName: "text-emerald-600 dark:text-emerald-400",
			sign: "+",
		};
	}

	if (typeName === MovementType.FIXED_EXPENSE) {
		return {
			label: "Gasto fijo",
			badgeClassName:
				"border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
			amountClassName: "text-rose-600 dark:text-rose-400",
			sign: "-",
		};
	}

	return {
		label: "Gasto",
		badgeClassName:
			"border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
		amountClassName: "text-rose-600 dark:text-rose-400",
		sign: "-",
	};
}

function formatDate(date?: string | null): string {
	if (!date) return "Sin fecha";

	return new Date(date).toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function MovementMobileCard({
	movement,
	categoryName,
	typeName,
	userCurrency,
	isEditing,
	categoryOptions,
	movementTypeOptions,
	onEdit,
	onDelete,
	onChange,
	onSave,
	onCancel,
}: MovementMobileCardProps) {
	const presentation = getMovementPresentation(typeName);

	return (
		<article className="rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/20 sm:p-5">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<Badge
							variant="outline"
							className={cn(
								"rounded-full px-2.5 py-1",
								presentation.badgeClassName,
							)}
						>
							{presentation.label}
						</Badge>
						{movement.is_recurring && (
							<Badge variant="outline" className="rounded-full px-2.5 py-1">
								<RefreshCw className="size-3" />
								Recurrente
							</Badge>
						)}
					</div>

					{isEditing ? (
						<div className="space-y-2">
							<Badge
								variant="secondary"
								className="rounded-full px-3 py-1 text-[11px] font-medium"
							>
								Editando este movimiento
							</Badge>
							<p className="text-xs leading-5 text-muted-foreground">
								Primero corrige lo principal y luego revisa categoría y fechas.
							</p>
						</div>
					) : (
						<h3 className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
							{movement.name}
						</h3>
					)}
				</div>

				<div className="flex items-center gap-1 self-start rounded-full border bg-background/90 p-1 shadow-xs">
					{isEditing ? (
						<div className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
							Editando
						</div>
					) : (
						<>
							<Button
								size="icon"
								variant="ghost"
								onClick={onEdit}
								className="h-8 w-8 rounded-full"
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								onClick={onDelete}
								className="h-8 w-8 rounded-full text-rose-600 hover:text-rose-700"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</>
					)}
				</div>
			</div>

			{isEditing ? (
				<div className="mt-4 space-y-4">
					<div className="rounded-2xl border bg-muted/20 p-4">
						<div className="mb-3 flex items-start gap-2">
							<div className="mt-0.5 rounded-full bg-background p-1 text-muted-foreground">
								<Info className="size-3.5" />
							</div>
							<div>
								<p className="text-sm font-semibold text-foreground">
									Lo principal
								</p>
								<p className="text-xs leading-5 text-muted-foreground">
									Empieza por el nombre y el monto para validar rápido el
									movimiento.
								</p>
							</div>
						</div>

						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-2 sm:col-span-2">
								<p className="text-xs font-medium text-muted-foreground">
									Nombre
								</p>
								<Input
									type="text"
									value={movement.name ?? ""}
									onChange={(event) => onChange?.("name", event.target.value)}
									placeholder="Nombre del movimiento"
									className="h-11 text-sm font-medium"
								/>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-medium text-muted-foreground">
									Monto
								</p>
								<Input
									type="number"
									value={movement.amount ?? ""}
									onChange={(event) =>
										onChange?.("amount", Number(event.target.value))
									}
									placeholder="0.00"
									step="0.01"
									className="h-11"
								/>
							</div>

							<div className="rounded-xl border bg-background/80 px-3 py-2.5 text-xs text-muted-foreground">
								<p className="font-medium text-foreground">
									Moneda de guardado
								</p>
								<p className="mt-1">
									Este movimiento se guardará en {userCurrency}.
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border bg-background/70 p-4">
						<p className="text-sm font-semibold text-foreground">
							Clasificación
						</p>
						<p className="mt-1 text-xs leading-5 text-muted-foreground">
							Completa estos datos solo después de validar lo principal.
						</p>

						<div className="mt-3 grid gap-3 sm:grid-cols-2">
							<div className="space-y-2">
								<p className="text-xs font-medium text-muted-foreground">
									Tipo
								</p>
								<SelectCombobox
									options={movementTypeOptions}
									value={String(movement.movement_type_id ?? "")}
									onChange={(value) =>
										onChange?.("movement_type_id", Number(value))
									}
									placeholder="Selecciona un tipo"
								/>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-medium text-muted-foreground">
									Categoría
								</p>
								<SelectCombobox
									options={categoryOptions}
									value={
										movement.category_id ? String(movement.category_id) : "none"
									}
									onChange={(value) =>
										onChange?.(
											"category_id",
											value && value !== "none" ? Number(value) : null,
										)
									}
									placeholder="Sin categoría"
								/>
							</div>
						</div>
					</div>

					<div className="rounded-2xl border bg-background/70 p-4">
						<p className="text-sm font-semibold text-foreground">Fechas</p>
						<p className="mt-1 text-xs leading-5 text-muted-foreground">
							La fecha de transacción es la que verás primero en el resumen.
						</p>

						<div className="mt-3 grid gap-3 sm:grid-cols-2">
							<div className="space-y-2">
								<p className="text-xs font-medium text-muted-foreground">
									Fecha de transacción
								</p>
								<Input
									type="date"
									value={
										movement.transaction_date
											? movement.transaction_date.slice(0, 10)
											: ""
									}
									onChange={(event) =>
										onChange?.("transaction_date", event.target.value || null)
									}
									className="h-11"
								/>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-medium text-muted-foreground">
									Fecha registrada
								</p>
								<Input
									type="date"
									value={
										movement.created_at ? movement.created_at.slice(0, 10) : ""
									}
									onChange={(event) =>
										onChange?.("created_at", event.target.value)
									}
									className="h-11"
								/>
							</div>
						</div>
					</div>

					<div className="grid gap-2 sm:grid-cols-2">
						<Button
							type="button"
							variant="outline"
							onClick={onCancel}
							className="h-11 w-full"
						>
							<X className="size-4" />
							Cancelar edición
						</Button>
						<Button type="button" onClick={onSave} className="h-11 w-full">
							<Check className="size-4" />
							Guardar cambios
						</Button>
					</div>
				</div>
			) : (
				<div className="mt-4 space-y-4">
					<div className="flex items-end justify-between gap-3 rounded-2xl bg-muted/35 p-3">
						<div>
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
								Monto
							</p>
							<p
								className={cn(
									"mt-1 text-lg font-semibold sm:text-xl",
									presentation.amountClassName,
								)}
							>
								{presentation.sign}
								{formatCurrencyAmount(movement.amount, userCurrency)}
							</p>
						</div>
						<div className="rounded-xl border bg-background px-3 py-2 text-right shadow-xs">
							<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
								Transacción
							</p>
							<p className="mt-1 text-sm font-medium text-foreground">
								{formatDate(movement.transaction_date)}
							</p>
						</div>
					</div>

					<div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
						<div className="flex items-center gap-2 rounded-xl border bg-background/70 px-3 py-2">
							<Tag className="size-4" />
							<span className="truncate">
								{categoryName ?? "Sin categoría"}
							</span>
						</div>
						<div className="flex items-center gap-2 rounded-xl border bg-background/70 px-3 py-2">
							<CalendarDays className="size-4" />
							<span>{formatDate(movement.created_at)}</span>
						</div>
					</div>

					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Wallet className="size-3.5" />
						<span>Se guardará en {userCurrency}.</span>
					</div>
				</div>
			)}
		</article>
	);
}
