import { describe, expect, it, vi } from "vitest";
import { MovementTextProviderError } from "../../src/movement/application/movement_text_parser.js";
import { UserOpenAIMovementTextParser } from "../../src/movement/infrastructure/ai/user_openai_movement_text_parser.js";

const input = {
	text: "Compra 1000",
	localDate: "2026-10-10",
	timeZone: "America/Santiago",
	categories: [],
	movementTypes: [],
};
const result = {
	status: "unknown" as const,
	name: null,
	amount: null,
	categoryName: null,
	movementTypeName: null,
	transactionDate: null,
};

describe("User OpenAI key resolution", () => {
	it("reads the current database key for each request, including rotation and deletion", async () => {
		const getKey = vi
			.fn()
			.mockResolvedValueOnce("first")
			.mockResolvedValueOnce("second")
			.mockResolvedValueOnce(null);
		const parse = vi.fn().mockResolvedValue(result);
		const factory = vi.fn(() => ({ parse }));
		const parser = new UserOpenAIMovementTextParser(getKey, "model", factory);
		await expect(parser.parse(input)).resolves.toEqual(result);
		await expect(parser.parse(input)).resolves.toEqual(result);
		await expect(parser.parse(input)).rejects.toBeInstanceOf(
			MovementTextProviderError,
		);
		expect(factory.mock.calls).toEqual([
			["first", "model"],
			["second", "model"],
		]);
		expect(parse).toHaveBeenCalledTimes(2);
	});

	it.each([null, "", "   "])(
		"does not invoke AI when the user's key is %s",
		async (key) => {
			const factory = vi.fn();
			const parser = new UserOpenAIMovementTextParser(
				async () => key,
				"model",
				factory,
			);
			await expect(parser.parse(input)).rejects.toBeInstanceOf(
				MovementTextProviderError,
			);
			expect(factory).not.toHaveBeenCalled();
		},
	);

	it("maps database/decryption failures to safe provider errors", async () => {
		const factory = vi.fn();
		const parser = new UserOpenAIMovementTextParser(
			async () => {
				throw new Error("secret ciphertext");
			},
			"model",
			factory,
		);
		await expect(parser.parse(input)).rejects.toThrow(
			"Movement text provider failed",
		);
		expect(factory).not.toHaveBeenCalled();
	});
});
