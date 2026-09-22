import { createHash, timingSafeEqual } from "node:crypto";

import {
	type CreateShortcutMovement,
	ShortcutMovementInterpretationError,
} from "../../application/create_shortcut_movement.js";
import { MovementTextProviderError } from "../../application/movement_text_parser.js";
import { InvalidMovementReferenceError } from "../../application/movements.js";

export const SHORTCUT_API_KEY_HEADER = "X-SmartSaver-Shortcut-Key";

interface Dependencies {
	apiKey: string;
	ownerUserId: string;
	createShortcutMovement: CreateShortcutMovement;
}

function hasValidApiKey(
	providedApiKey: string | null,
	configuredApiKey: string,
): boolean {
	if (!providedApiKey || !configuredApiKey) return false;

	const providedDigest = createHash("sha256").update(providedApiKey).digest();
	const configuredDigest = createHash("sha256")
		.update(configuredApiKey)
		.digest();

	return timingSafeEqual(providedDigest, configuredDigest);
}

export function createShortcutMovementRoute({
	apiKey,
	ownerUserId,
	createShortcutMovement,
}: Dependencies): (request: Request) => Promise<Response> {
	return async (request: Request): Promise<Response> => {
		if (request.method !== "POST") {
			return Response.json({ message: "Method not allowed" }, { status: 405 });
		}

		if (!hasValidApiKey(request.headers.get(SHORTCUT_API_KEY_HEADER), apiKey)) {
			return Response.json({ message: "Unauthorized" }, { status: 401 });
		}
		if (ownerUserId.trim().length === 0) {
			return Response.json(
				{ message: "Shortcut authentication is not configured" },
				{ status: 503 },
			);
		}

		let body: unknown;
		try {
			body = await request.json();
		} catch {
			body = null;
		}
		console.info("Shortcut movement request body", body);
		const text =
			typeof body === "object" &&
			body !== null &&
			typeof (body as Record<string, unknown>).text === "string"
				? (body as Record<string, string>).text.trim()
				: "";
		if (text.length === 0 || text.length > 2_000) {
			return Response.json(
				{ message: "Invalid shortcut text" },
				{ status: 422 },
			);
		}

		try {
			return Response.json(
				(
					await createShortcutMovement.execute(ownerUserId, text)
				).toPrimitives(),
				{ status: 201 },
			);
		} catch (error) {
			if (
				error instanceof InvalidMovementReferenceError ||
				error instanceof ShortcutMovementInterpretationError
			) {
				return Response.json({ message: error.message }, { status: 422 });
			}
			if (error instanceof MovementTextProviderError) {
				return Response.json(
					{ message: "Movement interpretation is temporarily unavailable" },
					{ status: 503 },
				);
			}
			throw error;
		}
	};
}
