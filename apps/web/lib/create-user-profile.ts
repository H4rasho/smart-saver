"use server";

import { categories } from "@/app/core/categories/model/categories-model";
import { MovementTypeDict } from "@/app/core/movements/const/movement-type-dict";
import { movements } from "@/app/core/movements/model/movement-model";
import { users } from "@/app/core/user/model/user-model";
import { db } from "@/database/database";
import type { UserCreateProfile } from "@/types/income";
import { currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export const createUserProfile = async (profile: UserCreateProfile) => {
	const user = await currentUser();
	if (!user) {
		throw new Error("User not found");
	}
	const email = user.emailAddresses[0].emailAddress;
	const name = user.firstName;
	const clerk_id = user.id;

	// 1. Verificar si el usuario ya existe
	const existingUser = await db
		.select()
		.from(users)
		.where(eq(users.clerk_id, clerk_id));
	if (existingUser.length > 0) {
		throw new Error("User already exists");
	}

	// 2. Insertar usuario
	await db.insert(users).values({
		name: name ?? email,
		email,
		currency: profile.selectedCurrency,
		clerk_id,
	});

	// 3. Verificar si existen categorías duplicadas para este usuario
	for (const categoryName of profile.categories) {
		const existingCategory = await db
			.select()
			.from(categories)
			.where(
				and(
					eq(categories.clerk_id, clerk_id),
					eq(categories.name, categoryName),
				),
			);
		if (existingCategory.length > 0) {
			throw new Error(
				`Category '${categoryName}' already exists for this user`,
			);
		}
	}

	// 4. Insertar categorías
	await db.insert(categories).values(
		profile.categories.map((categoryName) => ({
			name: categoryName,
			clerk_id,
		})),
	);

	// 5. Insertar movimientos (ingresos y gastos fijos)
	const now = new Date().toISOString();
	const incomeMovements = profile.incomeSources.map((income) => ({
		clerk_id,
		movement_type_id: MovementTypeDict.INCOME,
		name: income.source,
		amount: Number(income.amount),
		is_recurring: 0,
		recurrence_period: null,
		recurrence_start: null,
		recurrence_end: null,
		created_at: now,
		category_id: null,
	}));
	const fixedExpenseMovements = profile.fixedExpenses.map((expense) => ({
		clerk_id,
		movement_type_id: MovementTypeDict.FIXED_EXPENSE,
		name: expense,
		amount: 0,
		is_recurring: 0,
		recurrence_period: null,
		recurrence_start: null,
		recurrence_end: null,
		created_at: now,
		category_id: null,
	}));
	if (incomeMovements.length > 1 || fixedExpenseMovements.length > 1) {
		await db
			.insert(movements)
			.values([...incomeMovements, ...fixedExpenseMovements]);
	}
};
