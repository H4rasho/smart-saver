import {
	MovementType,
	type MovementWithCategoryAndMovementType,
} from "@/app/core/movements/types/movement-type";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface MovementsTableProps {
	movements: MovementWithCategoryAndMovementType[];
	userCurrency: string;
}

export function MovementsTable({
	movements,
	userCurrency,
}: MovementsTableProps) {
	const formatAmount = (amount: number) => {
		return new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency: userCurrency,
		}).format(Math.abs(amount));
	};

	return (
		<div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] overflow-hidden">
			<div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-secondary/40 via-card to-card">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-foreground">
							Historial de movimientos
						</h2>
						<p className="text-sm text-muted-foreground">
							Vista detallada para escritorio
						</p>
					</div>
					<div className="text-sm text-muted-foreground">
						{movements.length.toLocaleString()} registros
					</div>
				</div>
			</div>
			<Table className="text-[13px]">
				<TableHeader>
					<TableRow className="bg-secondary/30 hover:bg-secondary/30">
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							Movimiento
						</TableHead>
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							Categoria
						</TableHead>
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							Fecha
						</TableHead>
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							Tipo
						</TableHead>
						<TableHead className="text-right uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							Monto
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="[&_tr]:border-border/40">
					{movements.map((movement) => {
						const typeName = movement.movement_type_name.toUpperCase();
						const isIncome = typeName === MovementType.INCOME;
						const isFixedExpense = typeName === MovementType.FIXED_EXPENSE;

						return (
							<TableRow key={movement.id} className="hover:bg-secondary/20">
								<TableCell className="font-medium">
									<div className="flex flex-col">
										<span className="text-foreground">{movement.name}</span>
										{movement.is_recurring && (
											<span className="text-xs text-muted-foreground">
												Recurrente
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									{movement.category_name ? (
										<Badge variant="outline" className="capitalize bg-card">
											{movement.category_name}
										</Badge>
									) : (
										<span className="text-muted-foreground">Sin categoria</span>
									)}
								</TableCell>
								<TableCell className="text-muted-foreground">
									{movement.created_at}
								</TableCell>
								<TableCell>
									<Badge
										variant="outline"
										className={
											isIncome
												? "text-green-700 border-green-200 bg-green-50"
												: isFixedExpense
													? "text-orange-700 border-orange-200 bg-orange-50"
													: "text-red-700 border-red-200 bg-red-50"
										}
									>
										{movement.movement_type_name}
									</Badge>
								</TableCell>
								<TableCell
									className={`text-right font-semibold ${
										isIncome ? "text-green-600" : "text-red-600"
									}`}
								>
									<span className="text-xs mr-1">{isIncome ? "+" : "-"}</span>
									{formatAmount(movement.amount)}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
