import assert from "node:assert/strict";
import test from "node:test";
import { findImportCatchAllCategoryId } from "../app/core/movements/lib/import-category-fallback";

test("uses an available generic Others category", () => {
	assert.equal(
		findImportCatchAllCategoryId(
			[
				{ id: 4, name: "Restaurantes" },
				{ id: 8, name: "Otros" },
			],
			3,
		),
		8,
	);
});

test("prefers a catch-all aligned with the movement direction", () => {
	const categories = [
		{ id: 2, name: "Otros" },
		{ id: 3, name: "Otros ingresos" },
		{ id: 4, name: "Gastos varios" },
	];
	assert.equal(findImportCatchAllCategoryId(categories, 1), 3);
	assert.equal(findImportCatchAllCategoryId(categories, 3), 4);
});

test("does not assign an expense-only category to income", () => {
	assert.equal(
		findImportCatchAllCategoryId([{ id: 4, name: "Gastos varios" }], 1),
		null,
	);
});

test("does not treat an unrelated category as catch-all", () => {
	assert.equal(
		findImportCatchAllCategoryId(
			[
				{ id: 5, name: "Otros servicios" },
				{ id: 6, name: "Supermercado" },
			],
			3,
		),
		null,
	);
});
