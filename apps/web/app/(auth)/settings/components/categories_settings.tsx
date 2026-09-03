"use client";

import {
	addUserCategoryAction,
	deleteUserCategoryAction,
} from "@/app/core/categories/actions/categories-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Category {
	id: number;
	name: string;
	clerk_id: string | null;
}

interface CategoriesSettingsProps {
	categories: Category[];
}

export function CategoriesSettings({ categories }: CategoriesSettingsProps) {
	const [newCategory, setNewCategory] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [localCategories, setLocalCategories] = useState(categories);

	const handleAddCategory = async () => {
		if (!newCategory.trim()) {
			toast.error("Por favor, ingresa un nombre para la categoría");
			return;
		}

		setIsAdding(true);
		try {
			const result = await addUserCategoryAction(newCategory.trim());

			if (result.success) {
				toast.success(result.message);
				setNewCategory("");
				// Optimistic update
				const newCat: Category = {
					id: Date.now(), // Temporary ID
					name: newCategory.trim(),
					clerk_id: null,
				};
				setLocalCategories([...localCategories, newCat]);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Error al agregar la categoría");
			console.error(error);
		} finally {
			setIsAdding(false);
		}
	};

	const handleDeleteCategory = async (categoryId: number) => {
		setDeletingId(categoryId);
		try {
			const result = await deleteUserCategoryAction(categoryId);

			if (result.success) {
				toast.success(result.message);
				// Optimistic update
				setLocalCategories(
					localCategories.filter((cat) => cat.id !== categoryId),
				);
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error("Error al eliminar la categoría");
			console.error(error);
		} finally {
			setDeletingId(null);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleAddCategory();
		}
	};

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="new-category">Agregar nueva categoría</Label>
				<div className="flex gap-2">
					<Input
						id="new-category"
						placeholder="Ej: Alimentación, Transporte, etc."
						value={newCategory}
						onChange={(e) => setNewCategory(e.target.value)}
						onKeyPress={handleKeyPress}
						disabled={isAdding}
					/>
					<Button
						onClick={handleAddCategory}
						disabled={isAdding || !newCategory.trim()}
						className="shrink-0"
					>
						<Plus className="w-4 h-4 mr-2" />
						{isAdding ? "Agregando..." : "Agregar"}
					</Button>
				</div>
			</div>

			<div className="space-y-3">
				<Label>Tus categorías</Label>
				{localCategories.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
						<p>No tienes categorías aún.</p>
						<p className="text-sm">Agrega tu primera categoría arriba.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{localCategories.map((category) => (
							<div
								key={category.id}
								className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
							>
								<Badge variant="secondary" className="text-sm font-normal">
									{category.name}
								</Badge>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleDeleteCategory(category.id)}
									disabled={deletingId === category.id}
									className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
								>
									{deletingId === category.id ? (
										<span className="animate-spin">⏳</span>
									) : (
										<Trash2 className="w-4 h-4" />
									)}
								</Button>
							</div>
						))}
					</div>
				)}
				{localCategories.length > 0 && (
					<p className="text-sm text-muted-foreground">
						Total: {localCategories.length} categoría
						{localCategories.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>
		</div>
	);
}
