"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

import { categories } from "@/app/core/categories/model/categories-model";
import { MovementTypeDict } from "@/app/core/movements/const/movement-type-dict";
import { movements } from "@/app/core/movements/model/movement-model";
import { db } from "@/database/database";

import type { UserCreateProfile } from "@/types/income";

export const createUserProfile = async (profile: UserCreateProfile) => {
	const { getToken, userId } = await auth();
	if (!userId) {
		throw new Error("User not found");
	}
	const clerkId = userId;
	const token = await getToken();
	if (!token) {
		throw new Error("User session token not found");
	}

	// 1. Registrar el usuario mediante la API
	const apiUrl = (process.env.API_URL ?? "http://localhost:3001").replace(
		/\/$/,
		"",
	);
	const response = await fetch(`${apiUrl}/users`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ currency: profile.selectedCurrency }),
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error(`User registration failed with status ${response.status}`);
	}

	// 2. Verificar si existen categorías duplicadas para este usuario
	for (const categoryName of profile.categories) {
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
			throw new Error(
				`Category '${categoryName}' already exists for this user`,
			);
		}
	}

	// 3. Insertar categorías
	await db.insert(categories).values(
		profile.categories.map((categoryName) => ({
			name: categoryName,
			clerk_id: clerkId,
		})),
	);

	// 4. Insertar movimientos (ingresos y gastos fijos)
	const now = new Date().toISOString();
	const incomeMovements = profile.incomeSources.map((income) => ({
		clerk_id: clerkId,
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
		clerk_id: clerkId,
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
