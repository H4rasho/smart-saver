import { CategoryId } from "./value_objects/category_id.js";
import { MovementAmount } from "./value_objects/movement_amount.js";
import { MovementDate } from "./value_objects/movement_date.js";
import { MovementId } from "./value_objects/movement_id.js";
import { MovementName } from "./value_objects/movement_name.js";
import { MovementOwnerId } from "./value_objects/movement_owner_id.js";
import { MovementTypeId } from "./value_objects/movement_type_id.js";

export interface MovementPrimitives {
	id: number | null;
	clerk_id: string;
	category_id: number | null;
	category_name: string | null;
	movement_type_id: number;
	movement_type_name: string;
	name: string;
	amount: number;
	is_recurring: boolean;
	recurrence_period: string | null;
	recurrence_start: string | null;
	recurrence_end: string | null;
	transaction_date: string | null;
	created_at: string;
}

export interface NewMovement {
	name: string;
	amount: number;
	category_id: number | null;
	movement_type_id: number;
	transaction_date: string;
}

export class Movement {
	private constructor(
		private readonly id: MovementId | null,
		private readonly ownerId: MovementOwnerId,
		private readonly categoryId: CategoryId | null,
		private readonly categoryName: string | null,
		private readonly typeId: MovementTypeId,
		private readonly typeName: string,
		private readonly name: MovementName,
		private readonly amount: MovementAmount,
		private readonly isRecurring: boolean,
		private readonly recurrencePeriod: string | null,
		private readonly recurrenceStart: string | null,
		private readonly recurrenceEnd: string | null,
		private readonly transactionDate: MovementDate | null,
		private readonly createdAt: string,
	) {}

	static create(ownerId: string, movement: NewMovement): Movement {
		return new Movement(
			null,
			new MovementOwnerId(ownerId),
			movement.category_id === null
				? null
				: new CategoryId(movement.category_id),
			null,
			new MovementTypeId(movement.movement_type_id),
			"",
			MovementName.create(movement.name),
			MovementAmount.create(movement.amount),
			false,
			null,
			null,
			null,
			MovementDate.create(movement.transaction_date),
			"",
		);
	}

	static fromPrimitives(primitives: MovementPrimitives): Movement {
		return new Movement(
			primitives.id === null ? null : new MovementId(primitives.id),
			new MovementOwnerId(primitives.clerk_id),
			primitives.category_id === null
				? null
				: new CategoryId(primitives.category_id),
			primitives.category_name,
			new MovementTypeId(primitives.movement_type_id),
			primitives.movement_type_name,
			MovementName.fromStored(primitives.name),
			MovementAmount.fromStored(primitives.amount),
			primitives.is_recurring,
			primitives.recurrence_period,
			primitives.recurrence_start,
			primitives.recurrence_end,
			primitives.transaction_date === null
				? null
				: MovementDate.fromStored(primitives.transaction_date),
			primitives.created_at,
		);
	}

	get category(): CategoryId | null {
		return this.categoryId;
	}

	get type(): MovementTypeId {
		return this.typeId;
	}

	toPrimitives(): MovementPrimitives {
		return {
			id: this.id?.value ?? null,
			clerk_id: this.ownerId.value,
			category_id: this.categoryId?.value ?? null,
			category_name: this.categoryName,
			movement_type_id: this.typeId.value,
			movement_type_name: this.typeName,
			name: this.name.value,
			amount: this.amount.value,
			is_recurring: this.isRecurring,
			recurrence_period: this.recurrencePeriod,
			recurrence_start: this.recurrenceStart,
			recurrence_end: this.recurrenceEnd,
			transaction_date: this.transactionDate?.value ?? null,
			created_at: this.createdAt,
		};
	}
}

export function validateNewMovement(value: unknown): NewMovement | null {
	if (typeof value !== "object" || value === null) return null;
	const input = value as Record<string, unknown>;
	const { name, amount, category_id, movement_type_id, transaction_date } =
		input;
	if (
		typeof name !== "string" ||
		typeof amount !== "number" ||
		typeof movement_type_id !== "number" ||
		(category_id !== null && typeof category_id !== "number") ||
		typeof transaction_date !== "string"
	)
		return null;
	try {
		return {
			name: MovementName.create(name).value,
			amount: MovementAmount.create(amount).value,
			category_id:
				category_id === null ? null : new CategoryId(category_id).value,
			movement_type_id: new MovementTypeId(movement_type_id).value,
			transaction_date: MovementDate.create(transaction_date).value,
		};
	} catch {
		return null;
	}
}
