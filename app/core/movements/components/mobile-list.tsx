"use client";

import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/income";
import {
	ArrowDownCircle,
	ArrowUpCircle,
	Calendar,
	Edit,
	Inbox,
	MoreVertical,
	RefreshCw,
	Tag,
	Trash2,
} from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { deleteMovmentAction } from "../actions/movments-actions";
import {
	MovementType,
	type MovementWithCategoryAndMovementType,
} from "../types/movement-type";
import { EditMovementDialog } from "./edit-movement-dialog";

interface FinancialMovementsListProps {
	movements: MovementWithCategoryAndMovementType[];
	onEdit?: (movement: MovementWithCategoryAndMovementType) => void;
	onDelete?: (movementId: number) => void;
	onConvertToFixed?: (movementId: number) => void;
	userCurrency: string;
	showActions?: boolean; // Nueva prop para controlar las acciones
	maxItems?: number; // Nueva prop para limitar elementos
	className?: string; // Para personalizar estilos
	categories?: Category[]; // para el dialogo de edicion
}

export default function FinancialMovementsList({
	movements,
	onEdit,
	onConvertToFixed,
	userCurrency,
	showActions = true, // Por defecto muestra las acciones
	maxItems, // Sin límite por defecto
	className,
	categories = [],
}: FinancialMovementsListProps) {
	const [_, deleteAction, _isPending] = useActionState(
		deleteMovmentAction,
		null,
	);
	const [editOpen, setEditOpen] = useState(false);
	const [selectedMovement, setSelectedMovement] =
		useState<MovementWithCategoryAndMovementType | null>(null);
	const [dropdownOpen, setDropdownOpen] = useState<Record<number, boolean>>({});

	const formatAmount = (amount: number) => {
		return formatCurrencyAmount(amount, userCurrency, { absolute: true });
	};

	const getAmountColor = (typeName: string) => {
		return typeName.toUpperCase() === MovementType.INCOME
			? "text-green-600 dark:text-green-400"
			: "text-red-600 dark:text-red-400";
	};

	const isFixedExpense = (typeName: string) => {
		return typeName.toUpperCase() === MovementType.FIXED_EXPENSE;
	};

	const isIncome = (typeName: string) => {
		return typeName.toUpperCase() === MovementType.INCOME;
	};

	// Aplicar límite de elementos si se especifica
	const displayedMovements = maxItems
		? movements.slice(0, maxItems)
		: movements;

	if (movements.length === 0) {
		return (
			<div className="text-center py-16">
				<Inbox className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
				<h3 className="text-lg font-semibold text-foreground mb-2">
					No hay movimientos
				</h3>
				<p className="text-muted-foreground text-sm">
					{maxItems
						? "No hay movimientos recientes"
						: "Agrega tu primer movimiento para comenzar"}
				</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-3", className)}>
			{displayedMovements.map((movement) => (
				<div
					key={movement.id}
					className="bg-card p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
				>
					{/* Layout unificado */}
					<div className="flex justify-between items-start">
						<div className="flex-1 min-w-0 pr-3">
							{/* Header con nombre y badges */}
							<div className="flex items-center gap-2 mb-2">
								{isIncome(movement.movement_type_name) ? (
									<ArrowUpCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
								) : (
									<ArrowDownCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
								)}
								<h3 className="font-semibold text-foreground text-sm truncate">
									{movement.name}
								</h3>
								{movement.is_recurring && (
									<RefreshCw className="h-3 w-3 text-blue-500 flex-shrink-0" />
								)}
								{isFixedExpense(movement.movement_type_name) && (
									<Badge
										variant="outline"
										className="text-xs bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 flex-shrink-0"
									>
										Fijo
									</Badge>
								)}
							</div>

							{/* Información adicional */}
							<div className="flex items-center gap-3 text-xs">
								<div className="flex items-center gap-1">
									<Calendar className="w-3 h-3 text-secondary-foreground/60 flex-shrink-0" />
									<span className="text-secondary-foreground/70">
										{movement.created_at}
									</span>
								</div>
								{movement.category_name && (
									<div className="flex items-center gap-1">
										<Tag className="w-3 h-3 text-secondary-foreground/60 flex-shrink-0" />
										<span className="text-secondary-foreground/80 bg-secondary-subtle px-2 py-1 rounded-md capitalize">
											{movement.category_name}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Monto y menú condicional */}
						<div className="flex items-center gap-2 flex-shrink-0">
							<div
								className={`text-sm font-bold ${getAmountColor(movement.movement_type_name)}`}
							>
								<span className="text-xs">
									{isIncome(movement.movement_type_name) ? "+" : "-"}
								</span>
								{formatAmount(movement.amount)}
							</div>

							{/* Menú de acciones - solo si showActions es true */}
							{showActions && (
								<DropdownMenu
									open={dropdownOpen[movement.id] || false}
									onOpenChange={(open) => {
										setDropdownOpen((prev) => ({
											...prev,
											[movement.id]: open,
										}));
									}}
								>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="h-8 w-8 p-0 flex-shrink-0 hover:bg-muted rounded-lg"
										>
											<MoreVertical className="h-4 w-4" />
											<span className="sr-only">Abrir menú</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem
											onClick={() => {
												setSelectedMovement(movement);
												setEditOpen(true);
												setDropdownOpen((prev) => ({
													...prev,
													[movement.id]: false,
												}));
												onEdit?.(movement);
											}}
											className="cursor-pointer py-3"
										>
											<Edit className="mr-2 h-4 w-4" />
											Editar
										</DropdownMenuItem>

										{!isFixedExpense(movement.movement_type_name) && (
											<DropdownMenuItem
												onClick={() => onConvertToFixed?.(movement.id)}
												className="cursor-pointer py-3"
											>
												<RefreshCw className="mr-2 h-4 w-4" />
												Convertir a gasto fijo
											</DropdownMenuItem>
										)}

										<DropdownMenuSeparator />

										<DropdownMenuItem
											onClick={() =>
												startTransition(() => deleteAction(movement.id))
											}
											className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 py-3"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Eliminar
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>
				</div>
			))}
			<EditMovementDialog
				open={editOpen}
				onOpenChange={setEditOpen}
				movement={selectedMovement}
				categories={categories}
			/>
		</div>
	);
}
