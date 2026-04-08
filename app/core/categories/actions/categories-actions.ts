"use server";
import { db } from "@/database/database";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { NAVIGATION_CACHE_TAG } from "../../menu/const/navigation-cache";
import { categories } from "../model/categories-model";

export const getUserCategoriesAction = async (userId: string) => {
	const userCategories = await db
		.select()
		.from(categories)
		.where(eq(categories.clerk_id, userId));
	return userCategories;
};

export const addUserCategoryAction = async (
	categoryName: string,
): Promise<{ success: boolean; message: string }> => {
	try {
		const user = await currentUser();
		const clerkId = user?.id;
		if (!clerkId) throw new Error("No clerk id found");

		// Verificar si la categoría ya existe
		const existingCategory = await db
			.select()
			.from(categories)
			.where(
				and(
					eq(categories.clerk_id, clerkId),
					eq(categories.name, categoryName),
				),
			);

		if (existingCategory.length > 0) {
			return {
				success: false,
				message: "La categoría ya existe",
			};
		}

		await db.insert(categories).values({
			name: categoryName,
			clerk_id: clerkId,
		});

		revalidatePath("/settings");
		revalidateTag(NAVIGATION_CACHE_TAG, "max");
		return { success: true, message: "Categoría agregada correctamente" };
	} catch (error) {
		console.error("Error adding category:", error);
		return { success: false, message: "Error al agregar la categoría" };
	}
};

export const deleteUserCategoryAction = async (
	categoryId: number,
): Promise<{ success: boolean; message: string }> => {
	try {
		const user = await currentUser();
		const clerkId = user?.id;
		if (!clerkId) throw new Error("No clerk id found");

		await db
			.delete(categories)
			.where(
				and(eq(categories.id, categoryId), eq(categories.clerk_id, clerkId)),
			);

		revalidatePath("/settings");
		revalidateTag(NAVIGATION_CACHE_TAG, "max");
		return { success: true, message: "Categoría eliminada correctamente" };
	} catch (error) {
		console.error("Error deleting category:", error);
		return { success: false, message: "Error al eliminar la categoría" };
	}
};
