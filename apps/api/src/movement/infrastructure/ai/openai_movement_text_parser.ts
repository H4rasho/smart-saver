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
	reasoningEffort: "high";
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
				reasoningEffort: "high",
				strictJsonSchema: true,
				schema: parsedMovementSchema,
				schemaName: "shortcut_movement",
				schemaDescription:
					"A single financial movement extracted from Shortcut text.",
				system: `Extract exactly one financial movement from the user's text. The text may be a short bank or card notification in Chilean Spanish.
Interpret Chilean currency formatting carefully: a period is commonly a thousands separator, so CLP "$15.720" means 15720, not 15.72. Remove currency symbols and grouping separators; return amount as a positive number. Do not infer a decimal fraction unless the text clearly uses one.
Classify the actual transaction direction: purchases, charges, and debits are expenses; received payments, deposits, and credits are income. A card purchase remains an expense even when the notification mentions a credit card. Do not treat warnings or unrelated text as transactions.
Use only a category and movement type from the supplied lists, copying its name exactly. Select the movement type that matches the transaction direction. If no supplied movement type fits, use status "unknown" rather than inventing one.
Extract the transaction date and time from the notification when present. Interpret numeric dates as day-month-year when the text is Chilean, and interpret times in the supplied local time zone. Return only the calendar date as YYYY-MM-DD. Resolve relative dates against local date ${input.localDate} in ${input.timeZone}.
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
				openai: {
					strictJsonSchema: request.strictJsonSchema,
					reasoningEffort: request.reasoningEffort,
				},
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
