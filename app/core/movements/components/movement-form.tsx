"use client";

import { createMovmentAction } from "@/app/core/movements/actions/movments-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectCombobox } from "@/components/ui/select-combobox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/types/income";
import {
	ArrowDownCircle,
	ArrowUpCircle,
	CalendarDays,
	ReceiptText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MovementType } from "../types/movement-type";

interface AddMovementFormProps {
	categories: Category[];
	onSuccess?: () => void;
}

const DEFAULT_MOVEMENT_TYPE = MovementType.EXPENSE;

function getTodayDateString(): string {
	return new Date().toISOString().split("T")[0] ?? "";
}

function getMovementConfig(movementType: MovementType): {
	title: string;
	description: string;
	amountLabel: string;
	nameLabel: string;
	namePlaceholder: string;
	accentClassName: string;
	icon: typeof ArrowDownCircle;
} {
	if (movementType === MovementType.INCOME) {
		return {
			title: "Ingreso",
			description:
				"Registra entradas de dinero con una descripción clara y su fecha.",
			amountLabel: "Monto recibido",
			nameLabel: "Concepto",
			namePlaceholder: "Ej. Pago freelance, salario o reembolso",
			accentClassName:
				"border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
			icon: ArrowUpCircle,
		};
	}

	return {
		title: "Gasto",
		description:
			"Añade el gasto con categoría y fecha para mantener tus reportes ordenados.",
		amountLabel: "Monto gastado",
		nameLabel: "Descripción",
		namePlaceholder: "Ej. Supermercado, transporte o suscripción",
		accentClassName:
			"border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
		icon: ArrowDownCircle,
	};
}

export function AddMovementForm({
	categories,
	onSuccess,
}: AddMovementFormProps) {
	const [movementType, setMovementType] = useState<MovementType>(
		DEFAULT_MOVEMENT_TYPE,
	);
	const [selectedCategory, setSelectedCategory] = useState<string>("");
	const [state, formAction, isPending] = useActionState(
		createMovmentAction,
		null,
	);
	const formRef = useRef<HTMLFormElement>(null);
	const router = useRouter();

	const movementConfig = useMemo(
		() => getMovementConfig(movementType),
		[movementType],
	);
	const MovementIcon = movementConfig.icon;

	const categoryOptions = useMemo(
		() =>
			categories.map((category) => ({
				label: category.name,
				value: String(category.id),
			})),
		[categories],
	);

	useEffect(() => {
		if (state?.success) {
			toast.success("Movimiento creado exitosamente");
			formRef.current?.reset();
			router.refresh();
			onSuccess?.();
		} else if (state?.error) {
			toast.error("Error al crear movimiento", {
				description: state.error,
			});
		}
	}, [state, onSuccess, router]);

	return (
		<section className="space-y-5">
			<div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
				<div className="space-y-2">
					<h3 className="text-base font-semibold sm:text-lg">
						¿Qué quieres registrar?
					</h3>
					<p className="text-sm leading-6 text-muted-foreground">
						Primero define el tipo de movimiento. Después completa solo los
						datos necesarios para guardarlo.
					</p>
				</div>
				<Badge
					variant="outline"
					className={`rounded-full px-3 py-1 ${movementConfig.accentClassName}`}
				>
					<MovementIcon className="size-3.5" />
					{movementConfig.title}
				</Badge>
			</div>

			<form
				ref={formRef}
				className="space-y-5"
				action={formAction}
				onReset={() => {
					setSelectedCategory("");
					setMovementType(DEFAULT_MOVEMENT_TYPE);
				}}
			>
				<div className="rounded-2xl border bg-muted/30 p-3 sm:p-4">
					<Tabs
						value={movementType}
						onValueChange={(value) => setMovementType(value as MovementType)}
					>
						<TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-background p-1 shadow-xs">
							<TabsTrigger
								value={MovementType.EXPENSE}
								className="h-11 rounded-lg text-sm"
							>
								<ArrowDownCircle className="size-4" />
								Gasto
							</TabsTrigger>
							<TabsTrigger
								value={MovementType.INCOME}
								className="h-11 rounded-lg text-sm"
							>
								<ArrowUpCircle className="size-4" />
								Ingreso
							</TabsTrigger>
						</TabsList>
					</Tabs>
					<input type="hidden" name="movementType" value={movementType} />
				</div>

				<div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
					<div className="mb-4 flex items-start gap-3">
						<div
							className={`rounded-2xl border p-2.5 ${movementConfig.accentClassName}`}
						>
							<MovementIcon className="size-5" />
						</div>
						<div className="space-y-1">
							<h4 className="font-semibold text-foreground">
								Datos del {movementConfig.title.toLowerCase()}
							</h4>
							<p className="text-sm leading-6 text-muted-foreground">
								{movementConfig.description}
							</p>
						</div>
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="description">{movementConfig.nameLabel}</Label>
							<Input
								id="description"
								name="description"
								required
								placeholder={movementConfig.namePlaceholder}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="amount">{movementConfig.amountLabel}</Label>
							<Input
								id="amount"
								name="amount"
								type="number"
								min="0"
								step="0.01"
								inputMode="decimal"
								required
								placeholder="0.00"
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="date">Fecha del movimiento</Label>
							<div className="relative">
								<CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="date"
									name="date"
									type="date"
									defaultValue={getTodayDateString()}
									required
									className="h-11 pl-10"
								/>
							</div>
						</div>

						{movementType === MovementType.EXPENSE && (
							<div className="space-y-2 sm:col-span-2">
								<SelectCombobox
									label="Categoría"
									options={categoryOptions}
									value={selectedCategory}
									onChange={setSelectedCategory}
									placeholder="Selecciona una categoría"
									name="category"
									required
								/>
								<p className="text-xs leading-5 text-muted-foreground">
									Ayuda a clasificar mejor el gasto en reportes y resúmenes.
								</p>
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-3 rounded-2xl border border-dashed bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="rounded-xl bg-background p-2 shadow-xs">
							<ReceiptText className="size-4 text-muted-foreground" />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium">Revisa antes de guardar</p>
							<p className="text-xs leading-5 text-muted-foreground">
								El movimiento se agregará a tus registros y actualizará el
								resumen principal.
							</p>
						</div>
					</div>

					<Button
						type="submit"
						className="h-11 w-full sm:w-auto"
						disabled={isPending}
					>
						{isPending ? "Guardando..." : "Guardar movimiento"}
					</Button>
				</div>
			</form>
		</section>
	);
}
