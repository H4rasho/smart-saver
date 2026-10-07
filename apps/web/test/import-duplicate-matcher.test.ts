import assert from "node:assert/strict";
import test from "node:test";
import {
	getInitiallySelectedImportIndices,
	matchImportedMovements,
} from "../app/core/movements/lib/import-duplicate-matcher";
import type {
	CreateMovement,
	MovementWithCategoryAndMovementType,
} from "../app/core/movements/types/movement-type";

function imported(
	name: string,
	amount: number,
	date: string,
	type = 3,
): CreateMovement {
	return {
		clerk_id: "user-1",
		category_id: null,
		movement_type_id: type,
		name,
		amount,
		is_recurring: false,
		recurrence_period: null,
		recurrence_start: null,
		recurrence_end: null,
		transaction_date: date,
		created_at: "2026-10-02T12:00:00.000Z",
	};
}

function existing(
	id: number,
	name: string,
	amount: number,
	date: string,
	type = 3,
): MovementWithCategoryAndMovementType {
	return {
		...imported(name, amount, date, type),
		id,
		category_name: "Sin categoría",
		movement_type_name: type === 1 ? "INCOME" : "EXPENSE",
	};
}

test("marks the same transaction as a clear duplicate", () => {
	const matches = matchImportedMovements(
		[imported("Café Ñuñoa", 15720, "2026-09-28")],
		[existing(7, "Cafe Nunoa", 15720, "2026-09-28")],
	);
	assert.equal(matches[0]?.confidence, "clear");
	assert.equal(matches[0]?.existing.id, 7);
});

test("flags a differently named Shortcut movement with a posting date shift", () => {
	const matches = matchImportedMovements(
		[imported("COMPRA POS 0045", 15720, "2026-10-03")],
		[existing(8, "Almuerzo", 15720, "2026-09-28")],
	);
	assert.equal(matches[0]?.confidence, "possible");
});

test("does not match different amounts, directions, or distant dates", () => {
	const stored = [existing(9, "Almuerzo", 15720, "2026-09-28")];
	const matches = matchImportedMovements(
		[
			imported("Almuerzo", 15721, "2026-09-28"),
			imported("Almuerzo", 15720, "2026-09-28", 1),
			imported("Almuerzo", 15720, "2026-10-05"),
		],
		stored,
	);
	assert.deepEqual(matches, [null, null, null]);
});

test("flags every ambiguous imported row for review", () => {
	const matches = matchImportedMovements(
		[
			imported("Compra tarjeta A", 5000, "2026-09-28"),
			imported("Compra tarjeta B", 5000, "2026-09-28"),
		],
		[existing(10, "Compra con Shortcut", 5000, "2026-09-28")],
	);
	assert.equal(matches[0]?.existing.id, 10);
	assert.equal(matches[1]?.existing.id, 10);
});

test("preselects only new movements while keeping matches recoverable", () => {
	const matches = matchImportedMovements(
		[
			imported("Almuerzo", 15720, "2026-09-28"),
			imported("Sueldo", 1800000, "2026-09-30", 1),
		],
		[existing(11, "Almuerzo", 15720, "2026-09-28")],
	);
	assert.deepEqual(getInitiallySelectedImportIndices(matches), [1]);
});
