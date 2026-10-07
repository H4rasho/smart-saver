import type {
	CreateMovement,
	MovementWithCategoryAndMovementType,
} from "../types/movement-type";

export interface ImportDuplicateMatch {
	confidence: "clear" | "possible";
	existing: {
		id: number;
		name: string;
		amount: number;
		transaction_date: string | null;
	};
}

export function getInitiallySelectedImportIndices(
	matches: Array<ImportDuplicateMatch | null>,
): number[] {
	return matches.flatMap((match, index) => (match === null ? [index] : []));
}

type ComparableMovement = Pick<
	CreateMovement,
	"name" | "amount" | "movement_type_id" | "transaction_date"
>;

const MAX_DATE_DISTANCE_DAYS = 5;

function normalizeName(name: string): string {
	return name
		.normalize("NFKD")
		.replace(/\p{Diacritic}/gu, "")
		.toLocaleLowerCase("es-CL")
		.replace(/[^\p{Letter}\p{Number}]+/gu, " ")
		.trim()
		.replace(/\s+/g, " ");
}

function dateDistanceDays(first: string | null, second: string | null): number {
	if (!first || !second) return Number.POSITIVE_INFINITY;
	const firstTime = Date.parse(`${first}T00:00:00Z`);
	const secondTime = Date.parse(`${second}T00:00:00Z`);
	if (!Number.isFinite(firstTime) || !Number.isFinite(secondTime)) {
		return Number.POSITIVE_INFINITY;
	}
	return Math.abs(firstTime - secondTime) / 86_400_000;
}

function isSameDirection(firstType: number, secondType: number): boolean {
	return (firstType === 1) === (secondType === 1);
}

function namesAreSimilar(first: string, second: string): boolean {
	const firstName = normalizeName(first);
	const secondName = normalizeName(second);
	if (!firstName || !secondName) return false;
	if (firstName === secondName) return true;
	const firstTokens = firstName.split(" ").filter((token) => token.length > 2);
	const secondTokens = new Set(
		secondName.split(" ").filter((token) => token.length > 2),
	);
	return firstTokens.some((token) => secondTokens.has(token));
}

export function matchImportedMovements(
	imported: ComparableMovement[],
	existing: MovementWithCategoryAndMovementType[],
): Array<ImportDuplicateMatch | null> {
	return imported.map((movement) => {
		const candidates = existing
			.filter((candidate) => {
				return (
					Math.round(candidate.amount * 100) ===
						Math.round(movement.amount * 100) &&
					isSameDirection(
						candidate.movement_type_id,
						movement.movement_type_id,
					) &&
					dateDistanceDays(
						candidate.transaction_date,
						movement.transaction_date,
					) <= MAX_DATE_DISTANCE_DAYS
				);
			})
			.map((candidate) => ({
				candidate,
				distance: dateDistanceDays(
					candidate.transaction_date,
					movement.transaction_date,
				),
				similarName: namesAreSimilar(candidate.name, movement.name),
			}))
			.sort((first, second) => {
				if (first.similarName !== second.similarName) {
					return first.similarName ? -1 : 1;
				}
				return first.distance - second.distance;
			});
		const best = candidates[0];
		if (!best) return null;
		return {
			confidence:
				best.distance === 0 &&
				normalizeName(best.candidate.name) === normalizeName(movement.name)
					? "clear"
					: "possible",
			existing: {
				id: best.candidate.id,
				name: best.candidate.name,
				amount: best.candidate.amount,
				transaction_date: best.candidate.transaction_date,
			},
		};
	});
}
