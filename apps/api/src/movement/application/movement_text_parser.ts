export interface MovementTextParserInput {
	text: string;
	localDate: string;
	timeZone: string;
	categories: string[];
	movementTypes: string[];
}

export type MovementTextParseStatus = "ready" | "ambiguous" | "unknown";

export interface ParsedMovementText {
	status: MovementTextParseStatus;
	name: string | null;
	amount: number | null;
	categoryName: string | null;
	movementTypeName: string | null;
	transactionDate: string | null;
}

export interface MovementTextParser {
	parse(input: MovementTextParserInput): Promise<ParsedMovementText>;
}

export class MovementTextProviderError extends Error {
	constructor() {
		super("Movement text provider failed");
		this.name = "MovementTextProviderError";
	}
}
