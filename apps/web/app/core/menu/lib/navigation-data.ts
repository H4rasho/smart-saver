import { getUserCategoriesAction } from "@/app/core/categories/actions/categories-actions";
import { getMovementTypes } from "@/app/core/movement-types.ts/repository/movement-type-repository";
import type { MovementType } from "@/app/core/movement-types.ts/types/movement-type-types";
import { getUserCurrency } from "@/app/core/user/actions/user-actions";
import type { Category } from "@/types/income";
import { unstable_cache } from "next/cache";
import {
	NAVIGATION_CACHE_TAG,
	USER_PREFERENCES_CACHE_TAG,
} from "../const/navigation-cache";

const getNavigationCategories = unstable_cache(
	async (userId: string): Promise<Category[]> => {
		const categories = await getUserCategoriesAction(userId);

		return categories.map((category) => ({
			id: Number(category.id),
			name: category.name as string,
		}));
	},
	["navigation-categories"],
	{
		tags: [NAVIGATION_CACHE_TAG],
		revalidate: 300,
	},
);

const getNavigationMovementTypes = unstable_cache(
	async (): Promise<MovementType[]> => {
		const movementTypes = await getMovementTypes();

		return movementTypes.map((movementType) => ({
			id: Number(movementType.id),
			name: movementType.name,
		}));
	},
	["navigation-movement-types"],
	{
		tags: [NAVIGATION_CACHE_TAG],
		revalidate: 3600,
	},
);

const getNavigationCurrency = unstable_cache(
	async (userId: string): Promise<string> => {
		void userId;
		return getUserCurrency();
	},
	["navigation-user-currency"],
	{
		tags: [USER_PREFERENCES_CACHE_TAG],
		revalidate: 300,
	},
);

export async function getAuthenticatedNavigationData(userId: string): Promise<{
	categories: Category[];
	movementTypes: MovementType[];
	userCurrency: string;
}> {
	const [categories, movementTypes, userCurrency] = await Promise.all([
		getNavigationCategories(userId),
		getNavigationMovementTypes(),
		getNavigationCurrency(userId),
	]);

	return {
		categories,
		movementTypes,
		userCurrency,
	};
}
