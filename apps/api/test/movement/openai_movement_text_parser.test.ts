import { describe, expect, test, vi } from "vitest";

const generateText = vi.hoisted(() => vi.fn());
vi.mock("ai", async (importOriginal) => ({
	...(await importOriginal<typeof import("ai")>()),
	generateText,
}));
vi.mock("@ai-sdk/openai", () => ({
	createOpenAI: () => (model: string) => ({ model }),
}));

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
const generatedMovement = {
	status: "ready" as const,
	name: "Coffee",
	amount: 3500,
	categoryName: "Food",
	movementTypeName: "EXPENSE",
	transactionDate: "2026-09-20",
};

describe("OpenAIMovementTextParser", () => {
	test("logs safe metadata on successful provider calls", async () => {
		const info = vi.spyOn(console, "info").mockImplementation(() => {});
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const secretText = "card transaction secret 1234";
		generateText.mockResolvedValueOnce({
			output: { ...generatedMovement },
			finishReason: "stop",
			usage: { inputTokens: 12, outputTokens: 8, totalTokens: 20 },
		});
		const parser = new OpenAIMovementTextParser("test-api-key", "test-model");

		await parser.parse({ ...input, text: secretText });

		expect(info).toHaveBeenCalledTimes(2);
		expect(info).toHaveBeenNthCalledWith(1, "OpenAI movement parsing started", {
			event: "openai_movement_parse_started",
			model: "test-model",
			reasoningEffort: "high",
		});
		expect(info).toHaveBeenNthCalledWith(
			2,
			"OpenAI movement parsing succeeded",
			{
				event: "openai_movement_parse_succeeded",
				model: "test-model",
				durationMs: expect.any(Number),
				finishReason: "stop",
				usage: { inputTokens: 12, outputTokens: 8, totalTokens: 20 },
			},
		);
		expect(JSON.stringify(info.mock.calls)).not.toContain(secretText);
		expect(error).not.toHaveBeenCalled();
		info.mockRestore();
		error.mockRestore();
	});

	test("logs sanitized provider failure metadata and preserves provider error mapping", async () => {
		const info = vi.spyOn(console, "info").mockImplementation(() => {});
		const logError = vi.spyOn(console, "error").mockImplementation(() => {});
		const secretText = "private transaction text";
		generateText.mockRejectedValueOnce(
			Object.assign(new Error(`secret ${secretText}`), {
				statusCode: 429,
				request_id: "req_safe-123",
			}),
		);
		const parser = new OpenAIMovementTextParser("test-api-key", "test-model");

		await expect(
			parser.parse({ ...input, text: secretText }),
		).rejects.toMatchObject({
			name: "MovementTextProviderError",
		});
		expect(logError).toHaveBeenCalledWith("OpenAI movement parsing failed", {
			event: "openai_movement_parse_failed",
			model: "test-model",
			durationMs: expect.any(Number),
			errorClass: "Error",
			statusCode: 429,
			requestId: "req_safe-123",
		});
		expect(
			JSON.stringify([...info.mock.calls, ...logError.mock.calls]),
		).not.toContain(secretText);
		expect(JSON.stringify(logError.mock.calls)).not.toContain("test-api-key");
		info.mockRestore();
		logError.mockRestore();
	});

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
			reasoningEffort: "high",
			strictJsonSchema: true,
			schemaName: "shortcut_movement",
		});
		expect(capturedRequest?.system).toContain(
			"local date 2026-09-21 in America/Santiago",
		);
		expect(capturedRequest?.system).toContain(
			'CLP "$15.720" means 15720, not 15.72',
		);
		expect(capturedRequest?.system).toContain(
			"A card purchase remains an expense",
		);
		expect(capturedRequest?.system).toContain(
			"Interpret numeric dates as day-month-year",
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
