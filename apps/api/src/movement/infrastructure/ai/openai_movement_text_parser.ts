import { createOpenAI } from "@ai-sdk/openai";
import { Output, generateText } from "ai";
import { z } from "zod";

import {
	type MovementTextParser,
	type MovementTextParserInput,
	MovementTextProviderError,
	type ParsedMovementText,
} from "../../application/movement_text_parser.js";

const parsedMovementSchema = z.object({
	status: z.enum(["ready", "ambiguous", "unknown"]),
	name: z.string().nullable(),
	amount: z.number().positive().nullable(),
	categoryName: z.string().nullable(),
	movementTypeName: z.string().nullable(),
	transactionDate: z.string().nullable(),
});

export interface MovementTextGenerationRequest {
	model: string;
	strictJsonSchema: true;
	schema: typeof parsedMovementSchema;
	schemaName: string;
	schemaDescription: string;
	system: string;
	prompt: string;
}

export type MovementTextGenerator = (
	request: MovementTextGenerationRequest,
) => Promise<ParsedMovementText>;

export class OpenAIMovementTextParser implements MovementTextParser {
	private readonly openai: ReturnType<typeof createOpenAI>;
	private readonly isConfigured: boolean;
	private readonly generate: MovementTextGenerator;

	constructor(
		apiKey: string,
		private readonly model: string,
		generator?: MovementTextGenerator,
	) {
		this.openai = createOpenAI({ apiKey });
		this.isConfigured = apiKey.trim().length > 0;
		this.generate =
			generator ?? ((request) => this.generateWithOpenAI(request));
	}

	async parse(input: MovementTextParserInput): Promise<ParsedMovementText> {
		if (!this.isConfigured) {
			throw new MovementTextProviderError();
		}
		try {
			return await this.generate({
				model: this.model,
				strictJsonSchema: true,
				schema: parsedMovementSchema,
				schemaName: "shortcut_movement",
				schemaDescription:
					"A single financial movement extracted from Shortcut text.",
				system: `Extract exactly one financial movement from the user's text.
Use only a category and movement type from the supplied lists, copying its name exactly.
Resolve relative dates against local date ${input.localDate} in ${input.timeZone} and return YYYY-MM-DD.
Use status "ambiguous" when more than one plausible movement or value exists.
Use status "unknown" when any required value cannot be established.
For non-ready results, set every field that cannot be established to null.
Never invent categories, movement types, amounts, or dates.`,
				prompt: `Shortcut text: ${JSON.stringify(input.text)}
Allowed categories: ${JSON.stringify(input.categories)}
Allowed movement types: ${JSON.stringify(input.movementTypes)}`,
			});
		} catch {
			throw new MovementTextProviderError();
		}
	}

	private async generateWithOpenAI(
		request: MovementTextGenerationRequest,
	): Promise<ParsedMovementText> {
		const { output } = await generateText({
			model: this.openai(request.model),
			providerOptions: {
				openai: { strictJsonSchema: request.strictJsonSchema },
			},
			output: Output.object({
				schema: request.schema,
				name: request.schemaName,
				description: request.schemaDescription,
			}),
			maxRetries: 1,
			system: request.system,
			prompt: request.prompt,
		});
		return output;
	}
}
