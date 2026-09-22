import { describe, expect, test, vi } from "vitest";

import type { MovementTextParserInput } from "../../src/movement/application/movement_text_parser";
import {
	type MovementTextGenerationRequest,
	OpenAIMovementTextParser,
} from "../../src/movement/infrastructure/ai/openai_movement_text_parser";

const input: MovementTextParserInput = {
	text: "Coffee for 3500 yesterday",
	localDate: "2026-09-21",
	timeZone: "America/Santiago",
	categories: ["Food"],
	movementTypes: ["EXPENSE"],
};

describe("OpenAIMovementTextParser", () => {
	test("maps parser input to a strict structured-output request", async () => {
		let capturedRequest: MovementTextGenerationRequest | undefined;
		const generated = {
			status: "ready" as const,
			name: "Coffee",
			amount: 3500,
			categoryName: "Food",
			movementTypeName: "EXPENSE",
			transactionDate: "2026-09-20",
		};
		const generator = vi.fn(async (request: MovementTextGenerationRequest) => {
			capturedRequest = request;
			return generated;
		});
		const parser = new OpenAIMovementTextParser(
			"test-api-key",
			"test-model",
			generator,
		);

		await expect(parser.parse(input)).resolves.toEqual(generated);
		expect(generator).toHaveBeenCalledOnce();
		expect(capturedRequest).toMatchObject({
			model: "test-model",
			strictJsonSchema: true,
			schemaName: "shortcut_movement",
		});
		expect(capturedRequest?.system).toContain(
			"local date 2026-09-21 in America/Santiago",
		);
		expect(capturedRequest?.prompt).toContain('Allowed categories: ["Food"]');
		expect(capturedRequest?.schema.safeParse(generated).success).toBeTruthy();
		expect(
			capturedRequest?.schema.safeParse({
				...generated,
				amount: "3500",
			}).success,
		).toBeFalsy();
	});
});
