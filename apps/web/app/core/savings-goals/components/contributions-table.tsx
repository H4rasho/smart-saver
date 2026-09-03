import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { SavingsGoalContribution } from "../types/savings-goals-types";

interface ContributionsTableProps {
	contributions: SavingsGoalContribution[];
	userCurrency: string;
}

export function ContributionsTable({
	contributions,
	userCurrency,
}: ContributionsTableProps) {
	if (contributions.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-center">
				<p className="text-sm font-medium text-foreground">
					Todavía no hay abonos registrados
				</p>
				<p className="mt-1 text-sm text-muted-foreground">
					Cuando agregues un abono aparecerá aquí su historial.
				</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Fecha</TableHead>
					<TableHead className="text-right">Monto</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{contributions.map((contribution) => (
					<TableRow key={contribution.id}>
						<TableCell>{contribution.formatted_contribution_date}</TableCell>
						<TableCell className="text-right font-medium">
							{formatCurrencyAmount(contribution.amount, userCurrency)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
