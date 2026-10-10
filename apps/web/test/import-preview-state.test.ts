import assert from "node:assert/strict";
import test from "node:test";
import { isImportPreviewOpen } from "../app/core/movements/lib/import-preview-state";

test("initial, failed and empty extractions do not open a preview", () => {
	assert.equal(isImportPreviewOpen({ movements: [] }, null), false);
	assert.equal(
		isImportPreviewOpen({ movements: [], error: "Archivo inválido" }, null),
		false,
	);
});

test("a dismissed extraction stays closed while selecting another file", () => {
	const result = { movements: [{ name: "Compra" }] };
	assert.equal(isImportPreviewOpen(result, null), true);
	assert.equal(isImportPreviewOpen(result, result), false);
	// File selection does not change the completed extraction or its dismissal.
	assert.equal(isImportPreviewOpen(result, result), false);
});

test("a fresh extraction opens even when its contents match the previous one", () => {
	const dismissed = { movements: [{ name: "Compra" }] };
	const next = { movements: [{ name: "Compra" }] };
	assert.equal(isImportPreviewOpen(next, dismissed), true);
	assert.equal(isImportPreviewOpen(next, next), false);
});
