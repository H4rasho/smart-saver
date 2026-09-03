import { Input } from "@/components/ui/input";
import { RefreshCw, Tag, Trash2 } from "lucide-react";
import type { CreateMovement } from "../types/movement-type";

interface MovementMobileCardEditableProps {
	movement: CreateMovement;
	onChange: (field: keyof CreateMovement, value: string | number) => void;
	onDelete: () => void;
}

export function MovementMobileCardEditable({
	movement,
	onChange,
	onDelete,
}: MovementMobileCardEditableProps) {
	return (
		<div className="rounded-xl border bg-card p-4 shadow-sm relative">
			<button
				type="button"
				aria-label="Eliminar movimiento"
				className="absolute top-2 right-2 text-red-500 hover:text-red-700"
				onClick={onDelete}
			>
				<Trash2 className="w-5 h-5" />
			</button>
			<div className="flex flex-col gap-2">
				<div className="flex items-center gap-2 mb-1">
					<Input
						type="text"
						value={movement.name ?? ""}
						onChange={(e) => onChange("name", e.target.value)}
						placeholder="Nombre"
						className="font-medium text-sm leading-tight truncate text-foreground"
					/>
					{movement.is_recurring && (
						<RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
					)}
					{/* Puedes agregar badge de tipo si lo necesitas */}
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Input
						type="date"
						value={movement.created_at ? movement.created_at.slice(0, 10) : ""}
						onChange={(e) => onChange("created_at", e.target.value)}
						className="w-32"
					/>
					<span>•</span>
					<Input
						type="number"
						value={movement.category_id ?? ""}
						onChange={(e) => onChange("category_id", Number(e.target.value))}
						placeholder="ID categoría"
						className="w-24"
					/>
					<Tag className="h-3 w-3" />
				</div>
				<div className="flex items-center gap-2">
					<Input
						type="number"
						value={movement.amount ?? ""}
						onChange={(e) => onChange("amount", Number(e.target.value))}
						placeholder="Monto"
						className="w-28"
					/>
					<Input
						type="number"
						value={movement.movement_type_id ?? ""}
						onChange={(e) =>
							onChange("movement_type_id", Number(e.target.value))
						}
						placeholder="Tipo"
						className="w-20"
					/>
					<Input
						type="date"
						value={
							movement.transaction_date
								? movement.transaction_date.slice(0, 10)
								: ""
						}
						onChange={(e) => onChange("transaction_date", e.target.value)}
						className="w-32"
					/>
				</div>
			</div>
		</div>
	);
}
