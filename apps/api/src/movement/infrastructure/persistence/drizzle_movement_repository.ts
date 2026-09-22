import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { Movement } from "../../domain/movement.js";
import type {
	MovementReference,
	MovementRepository,
} from "../../domain/movement_repository.js";
import {
	decryptMovementField,
	encryptMovementField,
} from "./movement_crypto.js";
import { categories, movementTypes, movements } from "./movement_schema.js";

export class DrizzleMovementRepository implements MovementRepository {
	constructor(private readonly database: LibSQLDatabase) {}

	async listForUser(userId: string, movementId?: number): Promise<Movement[]> {
		const rows = await this.database
			.select({
				id: movements.id,
				clerkId: movements.clerkId,
				categoryId: movements.categoryId,
				categoryName: categories.name,
				movementTypeId: movements.movementTypeId,
				movementTypeName: movementTypes.name,
				name: movements.name,
				amount: movements.amount,
				isRecurring: movements.isRecurring,
				recurrencePeriod: movements.recurrencePeriod,
				recurrenceStart: movements.recurrenceStart,
				recurrenceEnd: movements.recurrenceEnd,
				transactionDate: movements.transactionDate,
				createdAt: movements.createdAt,
			})
			.from(movements)
			.leftJoin(
				categories,
				and(
					eq(movements.categoryId, categories.id),
					eq(categories.clerkId, userId),
				),
			)
			.innerJoin(movementTypes, eq(movements.movementTypeId, movementTypes.id))
			.where(
				movementId === undefined
					? eq(movements.clerkId, userId)
					: and(eq(movements.clerkId, userId), eq(movements.id, movementId)),
			)
			.orderBy(
				desc(
					sql`coalesce(${movements.transactionDate}, substr(${movements.createdAt}, 1, 10), '')`,
				),
				desc(movements.id),
			);

		return rows.map((row) => {
			const amount = Number(decryptMovementField(String(row.amount ?? "")));
			if (!Number.isFinite(amount))
				throw new Error("Invalid stored movement amount");
			return Movement.fromPrimitives({
				id: row.id,
				clerk_id: userId,
				category_id: row.categoryId,
				category_name: row.categoryName,
				movement_type_id: row.movementTypeId ?? 0,
				movement_type_name: row.movementTypeName,
				name: decryptMovementField(row.name ?? ""),
				amount,
				is_recurring: Boolean(row.isRecurring),
				recurrence_period: row.recurrencePeriod,
				recurrence_start: row.recurrenceStart,
				recurrence_end: row.recurrenceEnd,
				transaction_date: row.transactionDate,
				created_at: row.createdAt ?? "",
			});
		});
	}

	async categoryBelongsToUser(
		categoryId: number,
		userId: string,
	): Promise<boolean> {
		const [category] = await this.database
			.select({ id: categories.id })
			.from(categories)
			.where(
				and(eq(categories.id, categoryId), eq(categories.clerkId, userId)),
			);
		return Boolean(category);
	}

	async listCategoriesForUser(userId: string): Promise<MovementReference[]> {
		return this.database
			.select({ id: categories.id, name: categories.name })
			.from(categories)
			.where(eq(categories.clerkId, userId))
			.orderBy(asc(categories.name), asc(categories.id));
	}

	async listMovementTypes(): Promise<MovementReference[]> {
		return this.database
			.select({ id: movementTypes.id, name: movementTypes.name })
			.from(movementTypes)
			.orderBy(asc(movementTypes.name), asc(movementTypes.id));
	}

	async movementTypeExists(typeId: number): Promise<boolean> {
		const [type] = await this.database
			.select({ id: movementTypes.id })
			.from(movementTypes)
			.where(eq(movementTypes.id, typeId));
		return Boolean(type);
	}

	async createForUser(userId: string, movement: Movement): Promise<Movement> {
		const values = movement.toPrimitives();
		if (values.clerk_id !== userId) {
			throw new Error("Movement owner does not match authenticated user");
		}
		const createdAt = new Date().toISOString();
		const [inserted] = await this.database
			.insert(movements)
			.values({
				clerkId: userId,
				categoryId: values.category_id,
				movementTypeId: values.movement_type_id,
				name: encryptMovementField(values.name),
				amount: encryptMovementField(String(values.amount)),
				isRecurring: 0,
				recurrencePeriod: null,
				recurrenceStart: null,
				recurrenceEnd: null,
				transactionDate: values.transaction_date,
				createdAt,
			})
			.returning({ id: movements.id });
		if (!inserted) throw new Error("Movement insert failed");
		const [created] = await this.listForUser(userId, inserted.id);
		if (!created) throw new Error("Inserted movement not found");
		return created;
	}
}
