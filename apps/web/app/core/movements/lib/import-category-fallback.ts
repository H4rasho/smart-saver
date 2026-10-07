interface CategoryReference {
	id: number;
	name: string;
}

const CATCH_ALL_WORDS = new Set([
	"other",
	"others",
	"otro",
	"otra",
	"otros",
	"otras",
	"vario",
	"varia",
	"varios",
	"varias",
	"misc",
	"miscellaneous",
	"miscelaneo",
	"miscelanea",
	"miscelaneos",
	"miscelaneas",
	"general",
]);
const EXPENSE_WORDS = new Set(["gasto", "gastos", "expense", "expenses"]);
const INCOME_WORDS = new Set(["ingreso", "ingresos", "income"]);

function normalizeCategoryName(name: string): string[] {
	return name
		.normalize("NFKD")
		.replace(/\p{Diacritic}/gu, "")
		.toLocaleLowerCase("es-CL")
		.replace(/[^\p{Letter}\p{Number}]+/gu, " ")
		.trim()
		.split(/\s+/)
		.filter(Boolean);
}

export function findImportCatchAllCategoryId(
	categories: CategoryReference[],
	movementTypeId: number,
): number | null {
	const isIncome = movementTypeId === 1;
	const matchingTypeWords = isIncome ? INCOME_WORDS : EXPENSE_WORDS;
	const oppositeTypeWords = isIncome ? EXPENSE_WORDS : INCOME_WORDS;
	const candidates = categories.flatMap((category) => {
		const words = normalizeCategoryName(category.name);
		if (
			!words.some((word) => CATCH_ALL_WORDS.has(word)) ||
			words.some((word) => oppositeTypeWords.has(word)) ||
			words.some(
				(word) => !CATCH_ALL_WORDS.has(word) && !matchingTypeWords.has(word),
			)
		) {
			return [];
		}
		return [
			{
				id: category.id,
				specific: words.some((word) => matchingTypeWords.has(word)),
			},
		];
	});
	candidates.sort((first, second) =>
		first.specific === second.specific
			? first.id - second.id
			: first.specific
				? -1
				: 1,
	);
	return candidates[0]?.id ?? null;
}
