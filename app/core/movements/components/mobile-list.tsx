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
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
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
	const t = useTranslations("movementsTable");
	const [deleteState, deleteAction] = useActionState(deleteMovmentAction, null);
	const [editOpen, setEditOpen] = useState(false);
	const [selectedMovement, setSelectedMovement] =
		useState<MovementWithCategoryAndMovementType | null>(null);
	const [dropdownOpen, setDropdownOpen] = useState<Record<number, boolean>>({});
	const router = useRouter();

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

	useEffect(() => {
		if (deleteState?.success) {
			toast.success(t("deleteSuccess"));
			router.refresh();
		} else if (deleteState?.error) {
			toast.error(t("deleteError"), {
				description: deleteState.error,
			});
		}
	}, [deleteState, router, t]);

	if (movements.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed bg-muted/20 py-16 text-center">
				<Inbox className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
				<h3 className="text-lg font-semibold text-foreground mb-2">
					{t("emptyTitle")}
				</h3>
				<p className="text-muted-foreground text-sm">
					{maxItems ? t("emptyRecentDescription") : t("emptyDescription")}
				</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-3", className)}>
			{displayedMovements.map((movement) => (
				<div
					key={movement.id}
					className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md sm:p-5"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="flex-1 min-w-0 pr-3">
							<div className="mb-3 flex items-center gap-2">
								{isIncome(movement.movement_type_name) ? (
									<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
										<ArrowUpCircle className="h-4 w-4 flex-shrink-0" />
									</div>
								) : (
									<div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-600 dark:text-rose-400">
										<ArrowDownCircle className="h-4 w-4 flex-shrink-0" />
									</div>
								)}
								<div className="min-w-0 flex-1 space-y-2">
									<div className="flex flex-wrap items-center gap-2">
										<h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
											{movement.name}
										</h3>
										{movement.is_recurring && (
											<Badge
												variant="outline"
												className="rounded-full px-2 py-0.5 text-[11px]"
											>
												<RefreshCw className="h-3 w-3 text-blue-500" />
												{t("recurring")}
											</Badge>
										)}
										{isFixedExpense(movement.movement_type_name) && (
											<Badge
												variant="outline"
												className="rounded-full border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
											>
												{t("fixed")}
											</Badge>
										)}
									</div>
									<div className="flex flex-wrap items-center gap-2 text-xs text-secondary-foreground/75">
										<div className="flex items-center gap-1 rounded-full bg-secondary-subtle px-2.5 py-1">
											<Calendar className="h-3 w-3 flex-shrink-0 text-secondary-foreground/60" />
											<span>{movement.created_at}</span>
										</div>
										{movement.category_name && (
											<div className="flex items-center gap-1 rounded-full bg-secondary-subtle px-2.5 py-1 capitalize">
												<Tag className="h-3 w-3 flex-shrink-0 text-secondary-foreground/60" />
												<span>{movement.category_name}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2 flex-shrink-0">
							<div className="rounded-2xl border bg-background px-3 py-2 text-right shadow-xs">
								<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
									{t("total")}
								</p>
								<div
									className={`mt-1 text-sm font-bold sm:text-base ${getAmountColor(movement.movement_type_name)}`}
								>
									<span className="text-xs">
										{isIncome(movement.movement_type_name) ? "+" : "-"}
									</span>
									{formatAmount(movement.amount)}
								</div>
							</div>

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
											<span className="sr-only">{t("openMenu")}</span>
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
											{t("actions.edit")}
										</DropdownMenuItem>

										{!isFixedExpense(movement.movement_type_name) && (
											<DropdownMenuItem
												onClick={() => onConvertToFixed?.(movement.id)}
												className="cursor-pointer py-3"
											>
												<RefreshCw className="mr-2 h-4 w-4" />
												{t("actions.convertToFixed")}
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
											{t("actions.delete")}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>
				</div>
			))}
			<EditMovementDialog
				key={selectedMovement?.id ?? "new"}
				open={editOpen}
				onOpenChange={setEditOpen}
				movement={selectedMovement}
				categories={categories}
				userCurrency={userCurrency}
			/>
		</div>
	);
}
