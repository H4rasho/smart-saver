import { categories } from "@/app/core/categories/model/categories-model";
import {
	movement_types,
	movements,
} from "@/app/core/movements/model/movement-model";
import {
	type CreateMovement,
	type CreateNotRecurringMovement,
	type Movement,
	MovementType,
	type MovementWithCategoryAndMovementType,
	type MovementsGroupedByCategory,
} from "@/app/core/movements/types/movement-type";
import { getUserId } from "@/app/core/user/actions/user-actions";
import { db } from "@/database/database";
import {
	decryptMovement,
	decryptMovementsWithRelations,
	encryptMovement,
	encryptMovementUpdateData,
	encryptMovements,
} from "@/lib/encrypted_movements";
import { decryptNumber } from "@/lib/encryption";
import { and, eq, sql } from "drizzle-orm";

function getCurrentMonthDateRange(): { firstDay: string; lastDay: string } {
	const now = new Date();

	return {
		firstDay: new Date(now.getFullYear(), now.getMonth(), 1)
			.toISOString()
			.slice(0, 10),
		lastDay: new Date(now.getFullYear(), now.getMonth() + 1, 0)
			.toISOString()
			.slice(0, 10),
	};
}

function parseStoredMovementAmount(value: unknown): number {
	if (typeof value === "number") {
		return value;
	}

	if (typeof value === "string") {
		return decryptNumber(value);
	}

	return 0;
}

async function getCurrentMonthMovementAmounts(userId: string): Promise<
	Array<{
		amount: number;
		movement_type_name: string;
	}>
> {
	const { firstDay, lastDay } = getCurrentMonthDateRange();

	const rows = await db
		.select({
			amount: movements.amount,
			movement_type_name: movement_types.name,
		})
		.from(movements)
		.innerJoin(
			movement_types,
			eq(movements.movement_type_id, movement_types.id),
		)
		.where(
			and(
				eq(movements.clerk_id, userId),
				sql`${movements.transaction_date} >= ${firstDay}`,
				sql`${movements.transaction_date} <= ${lastDay}`,
			),
		);

	return rows.map((row) => ({
		amount: parseStoredMovementAmount(row.amount),
		movement_type_name: row.movement_type_name,
	}));
}

function getTotalsFromMovementAmounts(
	movementAmounts: Array<{ amount: number; movement_type_name: string }>,
): { total_expenses: number; total_income: number } {
	return movementAmounts.reduce(
		(accumulator, movement) => {
			const typeName = movement.movement_type_name.toUpperCase();

			if (typeName === MovementType.INCOME) {
				accumulator.total_income += movement.amount;
			}

			if (
				typeName === MovementType.EXPENSE ||
				typeName === MovementType.FIXED_EXPENSE
			) {
				accumulator.total_expenses += movement.amount;
			}

			return accumulator;
		},
		{ total_expenses: 0, total_income: 0 },
	);
}

export async function createManyMovements(
	movementsData: CreateNotRecurringMovement[],
): Promise<void> {
	const clerkId = await getUserId();

	if (movementsData.length === 0) {
		return;
	}

	// Encrypt sensitive data before saving
	const encryptedMovements = encryptMovements(movementsData);

	await db.insert(movements).values(
		encryptedMovements.map((movement) => ({
			clerk_id: clerkId,
			category_id: movement.category_id ?? null,
			movement_type_id: movement.movement_type_id,
			name: movement.name,
			amount: movement.amount as unknown as number,
			is_recurring: 0,
			recurrence_period: null,
			recurrence_start: null,
			recurrence_end: null,
			transaction_date: movement.transaction_date,
			created_at: new Date().toISOString(),
		})),
	);
}

export async function createMovement(
	movement: CreateMovement,
): Promise<Movement> {
	const {
		clerk_id,
		category_id,
		movement_type_id,
		name,
		amount,
		is_recurring,
		recurrence_period,
		recurrence_start,
		recurrence_end,
		transaction_date,
		created_at,
	} = movement;

	// Encrypt sensitive data before saving
	const encryptedMovement = encryptMovement({
		category_id,
		movement_type_id,
		name,
		amount,
		transaction_date,
		created_at,
	});

	const [inserted] = await db
		.insert(movements)
		.values({
			clerk_id,
			category_id: category_id ?? null,
			movement_type_id,
			name: encryptedMovement.name,
			amount: encryptedMovement.amount as unknown as number,
			is_recurring: is_recurring ? 1 : 0,
			recurrence_period: recurrence_period ?? null,
			recurrence_start: recurrence_start ?? null,
			recurrence_end: recurrence_end ?? null,
			transaction_date,
			created_at,
		})
		.returning();

	if (!inserted) {
		throw new Error("No se pudo recuperar el movimiento insertado");
	}

	// Decrypt before returning
	const decrypted = decryptMovement({
		...inserted,
		is_recurring: Boolean(inserted.is_recurring),
	} as Movement);

	return decrypted;
}

export async function getCurrentMonthMovements(
	userId: string,
): Promise<MovementWithCategoryAndMovementType[]> {
	const { firstDay, lastDay } = getCurrentMonthDateRange();

	const rows = await db
		.select({
			id: movements.id,
			clerk_id: movements.clerk_id,
			category_id: movements.category_id,
			movement_type_id: movements.movement_type_id,
			name: movements.name,
			amount: movements.amount,
			is_recurring: movements.is_recurring,
			recurrence_period: movements.recurrence_period,
			recurrence_start: movements.recurrence_start,
			recurrence_end: movements.recurrence_end,
			created_at: movements.created_at,
			category_name: categories.name,
			movement_type_name: movement_types.name,
			transaction_date: movements.transaction_date,
		})
		.from(movements)
		.leftJoin(categories, eq(movements.category_id, categories.id))
		.innerJoin(
			movement_types,
			eq(movements.movement_type_id, movement_types.id),
		)
		.where(
			and(
				eq(movements.clerk_id, userId),
				sql`${movements.transaction_date} >= ${firstDay}`,
				sql`${movements.transaction_date} <= ${lastDay}`,
			),
		);

	const normalizedRows = rows.map((row) => ({
		...row,
		is_recurring: Boolean(row.is_recurring),
	})) as MovementWithCategoryAndMovementType[];

	// Decrypt sensitive data before returning
	return decryptMovementsWithRelations(normalizedRows);
}

export async function getAllMovements(
	userId: string,
): Promise<MovementWithCategoryAndMovementType[]> {
	const rows = await db
		.select({
			id: movements.id,
			clerk_id: movements.clerk_id,
			category_id: movements.category_id,
			movement_type_id: movements.movement_type_id,
			name: movements.name,
			amount: movements.amount,
			is_recurring: movements.is_recurring,
			recurrence_period: movements.recurrence_period,
			recurrence_start: movements.recurrence_start,
			recurrence_end: movements.recurrence_end,
			created_at: movements.created_at,
			category_name: categories.name,
			movement_type_name: movement_types.name,
			transaction_date: movements.transaction_date,
		})
		.from(movements)
		.leftJoin(categories, eq(movements.category_id, categories.id))
		.innerJoin(
			movement_types,
			eq(movements.movement_type_id, movement_types.id),
		)
		.where(eq(movements.clerk_id, userId));

	const normalizedRows = rows.map((row) => ({
		...row,
		is_recurring: Boolean(row.is_recurring),
	})) as MovementWithCategoryAndMovementType[];

	// Decrypt sensitive data before returning
	return decryptMovementsWithRelations(normalizedRows);
}

export async function getMovementsGroupedByCategory(
	userId: string,
): Promise<MovementsGroupedByCategory> {
	const allMovements = await getAllMovements(userId);

	const groupedMovements = allMovements.reduce<MovementsGroupedByCategory>(
		(accumulator, movement) => {
			const categoryId = movement.category_id ?? null;
			const categoryName = movement.category_name ?? "Sin categoría";
			const categoryKey = categoryId ?? 0;
			let categoryGroup = accumulator.find(
				(group) => (group.category_id ?? 0) === categoryKey,
			);

			if (!categoryGroup) {
				categoryGroup = {
					category_id: categoryId,
					category_name: categoryName,
					total_amount: 0,
					total_expenses: 0,
					total_income: 0,
					movements_count: 0,
					movements: [],
				};
				accumulator.push(categoryGroup);
			}

			const movementTypeName = movement.movement_type_name.toUpperCase();
			const isIncome = movementTypeName === MovementType.INCOME;
			const isExpense =
				movementTypeName === MovementType.EXPENSE ||
				movementTypeName === MovementType.FIXED_EXPENSE;

			categoryGroup.movements.push(movement);
			categoryGroup.movements_count += 1;
			categoryGroup.total_amount += movement.amount;

			if (isIncome) {
				categoryGroup.total_income += movement.amount;
			}

			if (isExpense) {
				categoryGroup.total_expenses += movement.amount;
			}

			return accumulator;
		},
		[],
	);

	return groupedMovements.sort(
		(firstCategory, secondCategory) =>
			secondCategory.movements_count - firstCategory.movements_count,
	);
}

export async function getTotalsByType(
	userId: string,
): Promise<{ total_expenses: number; total_income: number }> {
	const movementAmounts = await getCurrentMonthMovementAmounts(userId);

	return getTotalsFromMovementAmounts(movementAmounts);
}

export async function getBalance(userId: string): Promise<number> {
	const movementAmounts = await getCurrentMonthMovementAmounts(userId);
	const { total_expenses, total_income } =
		getTotalsFromMovementAmounts(movementAmounts);

	return total_income - total_expenses;
}

export async function deleteMovement(id: number): Promise<void> {
	await db.delete(movements).where(eq(movements.id, id));
}

export async function updateMovement(
	id: number,
	data: {
		name: string;
		amount: number;
		category_id: number | null;
		transaction_date: string | null;
	},
): Promise<void> {
	// Encrypt sensitive data before updating
	const encryptedData = encryptMovementUpdateData(data);

	await db
		.update(movements)
		.set({
			name: encryptedData.name,
			amount: encryptedData.amount as unknown as number,
			category_id: encryptedData.category_id,
			transaction_date: encryptedData.transaction_date,
		})
		.where(eq(movements.id, id));
}
