import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import { getMovementTypes } from "@/app/core/movement-types.ts/repository/movement-type-repository";
import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { AddMovement } from "@/app/core/movements/components/create-movment";
import type { Category } from "@/types/income";
import { getUserCurrency, getUserId } from "../../user/actions/user-actions";
import { InputOptionsButton } from "./input-options-button";
import { NavLink } from "./nav-link";

export async function NavigationMenu() {
	const userId = await getUserId();
	if (!userId) return null;
	const categories = await getUserCategoriesAction(userId);
	const movementTypes = await getMovementTypes();
	const userCurrency = await getUserCurrency();
	const categoriesData: Category[] = categories.map((category) => ({
		id: Number(category.id),
		name: category.name as string,
	}));
	const movementTypesData: MovementType[] = movementTypes.map(
		(movementType) => ({
			id: Number(movementType.id),
			name: movementType.name,
		}),
	);

	return (
		<nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/80">
			<div className="relative px-4 pt-2 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
				{/* Botón central flotante */}
				<div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
					<AddMovement categories={categoriesData} />
				</div>

				{/* Grid de 4 botones */}
				<div className="grid grid-cols-4 gap-2">
					<NavLink href="/home" icon="home" label="Inicio" />

					<InputOptionsButton
						categories={categoriesData}
						movementTypes={movementTypesData}
						userCurrency={userCurrency}
					/>

					<NavLink href="/movements" icon="history" label="Historial" />

					<NavLink href="/settings" icon="settings" label="Config" />
				</div>
			</div>
		</nav>
	);
}
