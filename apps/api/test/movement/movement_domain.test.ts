import { describe, expect, test } from "bun:test";

import {
	Movement,
	type MovementPrimitives,
} from "../../src/movement/domain/movement";
import { CategoryId } from "../../src/movement/domain/value_objects/category_id";
import { MovementAmount } from "../../src/movement/domain/value_objects/movement_amount";
import { MovementDate } from "../../src/movement/domain/value_objects/movement_date";
import { MovementId } from "../../src/movement/domain/value_objects/movement_id";
import { MovementName } from "../../src/movement/domain/value_objects/movement_name";
import { MovementOwnerId } from "../../src/movement/domain/value_objects/movement_owner_id";
import { MovementTypeId } from "../../src/movement/domain/value_objects/movement_type_id";

const storedMovement: MovementPrimitives = {
	id: 42,
	clerk_id: "user-a",
	category_id: 1,
	category_name: "Food",
	movement_type_id: 3,
	movement_type_name: "EXPENSE",
	name: "Groceries",
	amount: 12.5,
	is_recurring: true,
	recurrence_period: "monthly",
	recurrence_start: "2026-01-01",
	recurrence_end: null,
	transaction_date: null,
	created_at: "2026-09-20T12:00:00Z",
};

describe("Movement domain", () => {
	test("value objects reject invalid values and normalize meaningful text", () => {
		expect(MovementName.create("  Groceries  ").value).toBe("Groceries");
		expect(new MovementOwnerId(" user-a ").value).toBe("user-a");
		expect(() => MovementName.create("  ")).toThrow();
		expect(() => new MovementOwnerId("  ")).toThrow();
		expect(() => MovementAmount.create(0)).toThrow();
		expect(() => MovementAmount.create(Number.POSITIVE_INFINITY)).toThrow();
		expect(() => new MovementId(1.5)).toThrow();
		expect(() => new MovementId(Number.MAX_SAFE_INTEGER + 1)).toThrow();
		expect(() => new CategoryId(0)).toThrow(
			"Category ID must be a positive safe integer",
		);
		expect(() => new MovementTypeId(0)).toThrow(
			"Movement type ID must be a positive safe integer",
		);
		expect(new CategoryId(1)).not.toBeInstanceOf(MovementId);
		expect(new MovementTypeId(3)).not.toBeInstanceOf(CategoryId);
		expect(() => MovementDate.create("2026-02-30")).toThrow();
		expect(MovementDate.create("2026-02-28").value).toBe("2026-02-28");
	});

	test("create applies invariants before persistence", () => {
		const movement = Movement.create(" user-a ", {
			name: " Groceries ",
			amount: 12.5,
			category_id: null,
			movement_type_id: 3,
			transaction_date: "2026-09-20",
		});
		expect(movement.toPrimitives()).toMatchObject({
			id: null,
			clerk_id: "user-a",
			name: "Groceries",
			category_id: null,
			amount: 12.5,
			is_recurring: false,
			transaction_date: "2026-09-20",
		});
		expect(() =>
			Movement.create("user-a", {
				name: "Invalid",
				amount: -1,
				category_id: null,
				movement_type_id: 3,
				transaction_date: "2026-09-20",
			}),
		).toThrow();
	});

	test("fromPrimitives and toPrimitives preserve persisted and legacy nullable fields", () => {
		expect(Movement.fromPrimitives(storedMovement).toPrimitives()).toEqual(
			storedMovement,
		);
		expect(
			Movement.fromPrimitives({
				...storedMovement,
				category_id: null,
				category_name: null,
				is_recurring: false,
				recurrence_period: null,
				recurrence_start: null,
				transaction_date: "2026-09-20",
			}).toPrimitives(),
		).toMatchObject({
			category_id: null,
			transaction_date: "2026-09-20",
		});
		expect(() =>
			Movement.fromPrimitives({ ...storedMovement, movement_type_id: 0 }),
		).toThrow();
		expect(
			Movement.fromPrimitives({
				...storedMovement,
				name: "  Legacy  ",
				amount: -12.5,
				transaction_date: "legacy-date",
			}).toPrimitives(),
		).toMatchObject({
			name: "  Legacy  ",
			amount: -12.5,
			transaction_date: "legacy-date",
		});
	});
});
