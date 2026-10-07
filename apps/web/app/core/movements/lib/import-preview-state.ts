interface PreviewResult {
	movements: readonly unknown[];
}

export function isImportPreviewOpen<T extends PreviewResult>(
	result: T,
	dismissedResult: T | null,
): boolean {
	// Dismiss an extraction, not its contents: a new extraction may be identical.
	return result.movements.length > 0 && result !== dismissedResult;
}
