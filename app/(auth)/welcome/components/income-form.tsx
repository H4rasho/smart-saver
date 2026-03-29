import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Income {
	id: string;
	source: string;
	amount: string;
}

interface IncomeFormProps {
	incomeSources: Income[];
	onIncomeSourcesChange: (incomeSources: Income[]) => void;
}

export function IncomeForm({
	incomeSources,
	onIncomeSourcesChange,
}: IncomeFormProps) {
	const [incomes, setIncomes] = useState<Income[]>([]);
	const [source, setSource] = useState("");
	const [amount, setAmount] = useState("");

	const handleAddIncome = () => {
		if (!source.trim() || !amount.trim()) return;
		const newIncome = { id: crypto.randomUUID(), source, amount };
		setIncomes([...incomes, newIncome]);
		setSource("");
		setAmount("");
		onIncomeSourcesChange([...incomeSources, newIncome]);
	};

	const handleRemoveIncome = (id: string) => {
		setIncomes(incomes.filter((income) => income.id !== id));
	};

	return (
		<div className="flex flex-col gap-4">
			<h3 className="font-medium text-sm sm:text-base">Ingresos</h3>
			<div className="flex flex-col sm:flex-row gap-2">
				<Input
					placeholder="Fuente de ingreso"
					value={source}
					onChange={(e) => setSource(e.target.value)}
					className="text-sm"
				/>
				<Input
					placeholder="Monto"
					type="number"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					className="text-sm"
				/>
				<Button
					onClick={handleAddIncome}
					className="text-xs sm:text-sm whitespace-nowrap"
				>
					Agregar
				</Button>
			</div>
			<ul className="flex flex-col gap-2">
				{incomes.map((income) => (
					<li
						key={income.id}
						className="flex flex-col sm:flex-row justify-between items-start sm:items-center border p-2 rounded gap-2"
					>
						<span className="text-xs sm:text-sm">
							{income.source}: ${income.amount}
						</span>
						<Button
							size="sm"
							variant="destructive"
							onClick={() => handleRemoveIncome(income.id)}
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
