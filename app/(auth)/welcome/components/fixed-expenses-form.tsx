import { formatCurrencyAmount } from "@/app/core/user/lib/user-lib";
import { AmountInput } from "@/components/ui/amount-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface FixedExpense {
	name: string;
	amount: string;
}

interface FixedExpensesFormProps {
	currency: string;
	fixedExpenses: string[];
	onFixedExpensesChange: (fixedExpenses: string[]) => void;
}

export function FixedExpensesForm({
	currency,
	fixedExpenses,
	onFixedExpensesChange,
}: FixedExpensesFormProps) {
	const [expenses, setExpenses] = useState<FixedExpense[]>([]);
	const [expenseName, setExpenseName] = useState("");
	const [amount, setAmount] = useState("");

	const handleAddExpense = () => {
		if (!expenseName.trim() || !amount.trim()) return;
		setExpenses([...expenses, { name: expenseName, amount }]);
		setExpenseName("");
		setAmount("");
		onFixedExpensesChange([...fixedExpenses, expenseName]);
	};

	const handleRemoveExpense = (index: number) => {
		setExpenses(expenses.filter((_, i) => i !== index));
	};

	return (
		<div className="flex flex-col gap-4">
			<h3 className="font-medium text-sm sm:text-base">Gastos fijos</h3>
			<div className="flex flex-col sm:flex-row gap-2">
				<Input
					placeholder="Nombre del gasto"
					value={expenseName}
					onChange={(e) => setExpenseName(e.target.value)}
					className="text-sm"
				/>
				<AmountInput
					placeholder="Monto"
					currency={currency}
					value={amount}
					onValueChange={setAmount}
					className="text-sm"
				/>
				<Button
					onClick={handleAddExpense}
					className="text-xs sm:text-sm whitespace-nowrap"
				>
					Agregar
				</Button>
			</div>
			<ul className="flex flex-col gap-2">
				{expenses.map((expense, index) => (
					<li
						key={expense.name}
						className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-2 rounded gap-2"
					>
						<span className="text-xs sm:text-sm">
							{expense.name}: {formatCurrencyAmount(expense.amount, currency)}
						</span>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => handleRemoveExpense(index)}
							className="text-xs w-full sm:w-auto"
						>
							Eliminar
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
}
