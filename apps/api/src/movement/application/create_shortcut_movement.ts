import type { Movement, NewMovement } from "../domain/movement.js";
import { validateNewMovement } from "../domain/movement.js";
import type {
	MovementReference,
	MovementRepository,
} from "../domain/movement_repository.js";
import type { MovementTextParser } from "./movement_text_parser.js";
import type { Movements } from "./movements.js";

export type ShortcutMovementInterpretationReason =
	| "ambiguous"
	| "unknown"
	| "invalid";

export class ShortcutMovementInterpretationError extends Error {
	constructor(readonly reason: ShortcutMovementInterpretationReason) {
		super(`Movement text is ${reason}`);
		this.name = "ShortcutMovementInterpretationError";
	}
}

interface Dependencies {
	movements: Movements;
	parser: MovementTextParser;
	repository: MovementRepository;
	timeZone: string;
	now?: () => Date;
}

function getLocalDate(date: Date, timeZone: string): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const values = Object.fromEntries(
		parts.map((part) => [part.type, part.value]),
	);
	return `${values.year}-${values.month}-${values.day}`;
}

function normalizeReferenceName(value: string): string {
	return value
		.normalize("NFKD")
		.replace(/\p{Diacritic}/gu, "")
		.trim()
		.replace(/\s+/g, " ")
		.toLocaleLowerCase("en-US");
}

function resolveReference(
	name: string,
	references: MovementReference[],
): MovementReference {
	const normalizedName = normalizeReferenceName(name);
	const matches = references.filter(
		(reference) => normalizeReferenceName(reference.name) === normalizedName,
	);
	if (matches.length !== 1) {
		throw new ShortcutMovementInterpretationError(
			matches.length > 1 ? "ambiguous" : "unknown",
		);
	}
	const [match] = matches;
	if (!match) {
		throw new ShortcutMovementInterpretationError("unknown");
	}
	return match;
}

export class CreateShortcutMovement {
	private readonly now: () => Date;

	constructor(private readonly dependencies: Dependencies) {
		this.now = dependencies.now ?? (() => new Date());
	}

	async execute(userId: string, text: string): Promise<Movement> {
		const [categories, movementTypes] = await Promise.all([
			this.dependencies.repository.listCategoriesForUser(userId),
			this.dependencies.repository.listMovementTypes(),
		]);
		const parsed = await this.dependencies.parser.parse({
			text,
			localDate: getLocalDate(this.now(), this.dependencies.timeZone),
			timeZone: this.dependencies.timeZone,
			categories: categories.map((category) => category.name),
			movementTypes: movementTypes.map((movementType) => movementType.name),
		});
		if (parsed.status !== "ready") {
			throw new ShortcutMovementInterpretationError(parsed.status);
		}
		if (
			parsed.name === null ||
			parsed.amount === null ||
			parsed.movementTypeName === null ||
			parsed.transactionDate === null
		) {
			throw new ShortcutMovementInterpretationError("invalid");
		}

		const movementType = resolveReference(
			parsed.movementTypeName,
			movementTypes,
		);
		const category =
			parsed.categoryName === null
				? null
				: resolveReference(parsed.categoryName, categories);
		const movement = validateNewMovement({
			name: parsed.name,
			amount: parsed.amount,
			category_id: category?.id ?? null,
			movement_type_id: movementType.id,
			transaction_date: parsed.transactionDate,
		} satisfies NewMovement);
		if (!movement) {
			throw new ShortcutMovementInterpretationError("invalid");
		}

		return this.dependencies.movements.create(userId, movement);
	}
}
