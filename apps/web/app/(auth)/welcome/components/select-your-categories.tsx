import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useState } from "react";

interface SelectYourCategoriesProps {
	categories: string[];
	onCategoriesChange: (categories: string[]) => void;
}

export const SelectYourCategories = ({
	categories,
	onCategoriesChange,
}: SelectYourCategoriesProps) => {
	const [newCategory, setNewCategory] = useState("");

	const handleSelectCategory = (category: string) => {
		onCategoriesChange(categories.filter((c) => c !== category));
	};

	const handleAddCategory = ({ category }: { category: string }) => {
		if (!category.trim()) return;
		onCategoriesChange([...categories, category]);
		setNewCategory("");
	};

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2 flex-wrap">
				{categories.map((category) => (
					<Button
						size="sm"
						key={category}
						onClick={() => handleSelectCategory(category)}
						className="text-xs sm:text-sm"
					>
						<X className="w-3 h-3 sm:w-4 sm:h-4" />
						{category}
					</Button>
				))}
			</div>
			<Input
				placeholder="Agregar categoría"
				value={newCategory}
				onChange={(e) => setNewCategory(e.target.value)}
				className="text-sm"
			/>
			<Button
				onClick={() => handleAddCategory({ category: newCategory })}
				className="text-xs sm:text-sm"
			>
				Agregar categoría
			</Button>
		</div>
	);
};
