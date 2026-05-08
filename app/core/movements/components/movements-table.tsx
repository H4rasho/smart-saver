import {
	MovementType,
	type MovementWithCategoryAndMovementType,
} from "@/app/core/movements/types/movement-type";
import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { getLocale, getTranslations } from "next-intl/server";

interface MovementsTableProps {
	movements: MovementWithCategoryAndMovementType[];
	userCurrency: string;
}

function getMovementTypeTranslationKey(
	typeName: string,
): "income" | "fixedExpense" | "expense" {
	if (typeName.toUpperCase() === MovementType.INCOME) {
		return "income";
	}

	if (typeName.toUpperCase() === MovementType.FIXED_EXPENSE) {
		return "fixedExpense";
	}

	return "expense";
}

export async function MovementsTable({
	movements,
	userCurrency,
}: MovementsTableProps) {
	const t = await getTranslations("movementsTable");
	const locale = await getLocale();

	const formatAmount = (amount: number) => {
		return formatCurrencyAmount(amount, userCurrency, { absolute: true });
	};

	return (
		<div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/30 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.45)] overflow-hidden">
			<div className="px-6 py-4 border-b border-border/60 bg-gradient-to-r from-secondary/40 via-card to-card">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-foreground">
							{t("title")}
						</h2>
						<p className="text-sm text-muted-foreground">{t("description")}</p>
					</div>
					<div className="text-sm text-muted-foreground">
						{t("recordCount", {
							count: movements.length.toLocaleString(locale),
						})}
					</div>
				</div>
			</div>
			<Table className="text-[13px]">
				<TableHeader>
					<TableRow className="bg-secondary/30 hover:bg-secondary/30">
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							{t("columns.movement")}
						</TableHead>
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							{t("columns.category")}
						</TableHead>
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							{t("columns.date")}
						</TableHead>
						<TableHead className="uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							{t("columns.type")}
						</TableHead>
						<TableHead className="text-right uppercase tracking-[0.12em] text-[11px] text-muted-foreground">
							{t("columns.amount")}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className="[&_tr]:border-border/40">
					{movements.map((movement) => {
						const typeName = movement.movement_type_name.toUpperCase();
						const isIncome = typeName === MovementType.INCOME;
						const isFixedExpense = typeName === MovementType.FIXED_EXPENSE;
						const movementTypeLabel = t(
							`types.${getMovementTypeTranslationKey(typeName)}`,
						);

						return (
							<TableRow key={movement.id} className="hover:bg-secondary/20">
								<TableCell className="font-medium">
									<div className="flex flex-col">
										<span className="text-foreground">{movement.name}</span>
										{movement.is_recurring && (
											<span className="text-xs text-muted-foreground">
												{t("recurring")}
											</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									{movement.category_name ? (
										<Badge
											variant="outline"
											className="capitalize border-border/70 bg-secondary/40 text-foreground dark:border-secondary/70 dark:bg-secondary/20"
										>
											{movement.category_name}
										</Badge>
									) : (
										<span className="text-muted-foreground">
											{t("withoutCategory")}
										</span>
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
												? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
												: isFixedExpense
													? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
													: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300"
										}
									>
										{movementTypeLabel}
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
