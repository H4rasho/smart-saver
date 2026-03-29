import { db } from "@/database/database";
import { and, eq } from "drizzle-orm";
import { categories } from "../model/categories-model";

export async function createCategory(
	clerkId: string,
	categoryName: string,
): Promise<{ success: boolean; message: string }> {
	const existingCategory = await db
		.select()
		.from(categories)
		.where(
			and(eq(categories.clerk_id, clerkId), eq(categories.name, categoryName)),
		);

	if (existingCategory.length > 0) {
		return { success: false, message: "La categoría ya existe" };
	}

	await db.insert(categories).values({
		name: categoryName,
		clerk_id: clerkId,
	});

	return { success: true, message: "Categoría agregada correctamente" };
}
