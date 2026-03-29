import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit, RefreshCw, Tag, Trash2, X } from "lucide-react";
import type { CreateMovement } from "../types/movement-type";

interface MovementMobileCardProps {
	movement: CreateMovement;
	categoryName?: string;
	typeName?: string;
	isEditing: boolean;
	onEdit: () => void;
	onDelete: () => void;
	onChange?: (field: keyof CreateMovement, value: string | number) => void;
	onSave?: () => void;
	onCancel?: () => void;
}

export function MovementMobileCard({
	movement,
	categoryName,
	typeName,
	isEditing,
	onEdit,
	onDelete,
	onChange,
	onSave,
	onCancel,
}: MovementMobileCardProps) {
	return (
		<div className="rounded-xl border bg-card p-4 shadow-sm relative">
			<div className="flex items-start justify-between mb-2">
				<div className="flex-1 min-w-0 pr-3">
					<div className="flex items-center gap-2 mb-1">
						{isEditing ? (
							<Input
								type="text"
								value={movement.name ?? ""}
								onChange={(e) => onChange?.("name", e.target.value)}
								placeholder="Nombre"
								className="font-medium text-sm leading-tight truncate text-foreground"
							/>
						) : (
							<h3 className="font-medium text-sm leading-tight truncate text-foreground">
								{movement.name}
							</h3>
						)}
						{movement.is_recurring && (
							<RefreshCw className="h-3 w-3 text-muted-foreground flex-shrink-0" />
						)}
						{/* Puedes agregar badge de tipo si lo necesitas */}
					</div>
				</div>
				<div className="flex items-center gap-2 flex-shrink-0">
					{isEditing ? (
						<>
							<Button
								size="icon"
								variant="ghost"
								onClick={onSave}
								className="h-8 w-8 p-0"
							>
								<Check className="h-4 w-4 text-green-600" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								onClick={onCancel}
								className="h-8 w-8 p-0"
							>
								<X className="h-4 w-4 text-red-600" />
							</Button>
						</>
					) : (
						<>
							<Button
								size="icon"
								variant="ghost"
								onClick={onEdit}
								className="h-8 w-8 p-0"
							>
								<Edit className="h-4 w-4" />
							</Button>
							<Button
								size="icon"
								variant="ghost"
								onClick={onDelete}
								className="h-8 w-8 p-0"
							>
								<Trash2 className="h-4 w-4 text-red-500" />
							</Button>
						</>
					)}
				</div>
			</div>
			<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
				{isEditing ? (
					<Input
						type="date"
						value={movement.created_at ? movement.created_at.slice(0, 10) : ""}
						onChange={(e) => onChange?.("created_at", e.target.value)}
						className="w-32"
					/>
				) : (
					<span>{movement.created_at?.slice(0, 10)}</span>
				)}
				<span>•</span>
				{isEditing ? (
					<Input
						type="number"
						value={movement.category_id ?? ""}
						onChange={(e) => onChange?.("category_id", Number(e.target.value))}
						placeholder="ID categoría"
						className="w-24"
					/>
				) : (
					<div className="flex items-center gap-1">
						<Tag className="h-3 w-3" />
						<span className="truncate max-w-[120px]">
							{categoryName ?? "Sin categoría"}
						</span>
					</div>
				)}
			</div>
			<div className="flex items-center gap-2">
				{isEditing ? (
					<>
						<Input
							type="number"
							value={movement.amount ?? ""}
							onChange={(e) => onChange?.("amount", Number(e.target.value))}
							placeholder="Monto"
							className="w-28"
						/>
						<Input
							type="number"
							value={movement.movement_type_id ?? ""}
							onChange={(e) =>
								onChange?.("movement_type_id", Number(e.target.value))
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
							onChange={(e) => onChange?.("transaction_date", e.target.value)}
							className="w-32"
						/>
					</>
				) : (
					<>
						<span className="font-semibold">{movement.amount}</span>
						<span className="text-xs">Tipo: {typeName ?? "Sin tipo"}</span>
						<span className="text-xs">
							Transacción: {movement.transaction_date?.slice(0, 10)}
						</span>
					</>
				)}
			</div>
		</div>
	);
}
