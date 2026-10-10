import {
	type MovementTextParser,
	type MovementTextParserInput,
	MovementTextProviderError,
	type ParsedMovementText,
} from "../../application/movement_text_parser.js";
import { OpenAIMovementTextParser } from "./openai_movement_text_parser.js";

export class UserOpenAIMovementTextParser implements MovementTextParser {
	constructor(
		private readonly getKey: () => Promise<string | null>,
		private readonly model: string,
		private readonly createParser: (
			key: string,
			model: string,
		) => MovementTextParser = (key, model) =>
			new OpenAIMovementTextParser(key, model),
	) {}

	async parse(input: MovementTextParserInput): Promise<ParsedMovementText> {
		try {
			// Resolve on every request so rotations and deletions take effect immediately.
			const key = (await this.getKey())?.trim();
			if (!key) throw new MovementTextProviderError();
			return await this.createParser(key, this.model).parse(input);
		} catch {
			throw new MovementTextProviderError();
		}
	}
}
